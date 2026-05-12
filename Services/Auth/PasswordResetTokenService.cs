using System.Security.Cryptography;
using System.Text;
using FlightReservation.Data;
using FlightReservation.Dtos.Auth;
using FlightReservation.Models;
using FlightReservation.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlightReservation.Services.Auth;

public class PasswordResetTokenService : IPasswordResetTokenService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IResetNotificationService _notificationService;
    private readonly PasswordResetOptions _options;
    private readonly IWebHostEnvironment _environment;
    private readonly IAuditService _auditService;

    public PasswordResetTokenService(
        ApplicationDbContext context,
        IPasswordHasher<User> passwordHasher,
        IResetNotificationService notificationService,
        IOptions<PasswordResetOptions> options,
        IWebHostEnvironment environment,
        IAuditService auditService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _notificationService = notificationService;
        _options = options.Value;
        _environment = environment;
        _auditService = auditService;
    }

    public async Task<RequestPasswordResetResponseDto> CreateTokenAsync(
        string email,
        string? remoteIp,
        string? userAgent,
        CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail, cancellationToken);

        if (user == null)
        {
            _auditService.Write("PasswordResetRequested", "Password reset requested for unknown email.", new { Email = normalizedEmail });
            return GenericResponse();
        }

        var activeTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == user.Id && t.ConsumedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var token in activeTokens)
        {
            token.ConsumedAtUtc = DateTime.UtcNow;
        }

        var rawToken = GenerateSecureToken();
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_options.TokenLifetimeMinutes);
        var entity = new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = ComputeHash(rawToken),
            RequestedByIp = Truncate(remoteIp, 64),
            UserAgent = Truncate(userAgent, 512),
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = expiresAtUtc
        };

        _context.PasswordResetTokens.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        var resetUrl = BuildResetUrl(rawToken);
        await _notificationService.SendPasswordResetAsync(user.Email, resetUrl, expiresAtUtc, cancellationToken);
        _auditService.Write("PasswordResetRequested", "Password reset token created.", new { UserId = user.Id, user.Email, ExpiresAtUtc = expiresAtUtc });

        return new RequestPasswordResetResponseDto
        {
            Message = "If the account exists, password reset instructions have been sent.",
            DebugResetToken = _environment.IsDevelopment() && _options.ExposeDebugTokenInDevelopment ? rawToken : null,
            ExpiresAtUtc = _environment.IsDevelopment() && _options.ExposeDebugTokenInDevelopment ? expiresAtUtc : null
        };
    }

    public async Task<(bool Succeeded, string Message)> ResetPasswordAsync(CompletePasswordResetRequestDto request, CancellationToken cancellationToken = default)
    {
        var tokenHash = ComputeHash(request.Token.Trim());
        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(
                t => t.TokenHash == tokenHash &&
                     t.ConsumedAtUtc == null &&
                     t.ExpiresAtUtc > DateTime.UtcNow,
                cancellationToken);

        if (resetToken?.User == null)
        {
            _auditService.Write("PasswordResetFailed", "Password reset token validation failed.");
            return (false, "The password reset token is invalid or expired.");
        }

        resetToken.User.Password = _passwordHasher.HashPassword(resetToken.User, request.NewPassword);
        resetToken.ConsumedAtUtc = DateTime.UtcNow;

        var siblingTokens = await _context.PasswordResetTokens
            .Where(t => t.UserId == resetToken.UserId && t.Id != resetToken.Id && t.ConsumedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var token in siblingTokens)
        {
            token.ConsumedAtUtc = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        _auditService.Write("PasswordResetCompleted", "Password reset completed.", new { resetToken.UserId });

        return (true, "Password has been updated successfully.");
    }

    private RequestPasswordResetResponseDto GenericResponse() =>
        new()
        {
            Message = "If the account exists, password reset instructions have been sent."
        };

    private string BuildResetUrl(string token)
    {
        if (string.IsNullOrWhiteSpace(_options.FrontendResetUrl))
        {
            return token;
        }

        var separator = _options.FrontendResetUrl.Contains('?') ? "&" : "?";
        return $"{_options.FrontendResetUrl}{separator}token={Uri.EscapeDataString(token)}";
    }

    private static string GenerateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    private static string ComputeHash(string value)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(bytes);
    }

    private static string Truncate(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
            return string.Empty;

        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
