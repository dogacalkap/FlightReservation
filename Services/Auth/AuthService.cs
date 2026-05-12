using FlightReservation.Data;
using FlightReservation.Dtos.Auth;
using FlightReservation.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Services.Auth;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly ILoginAttemptService _loginAttemptService;
    private readonly IPasswordResetTokenService _passwordResetTokenService;
    private readonly IAuditService _auditService;

    public AuthService(
        ApplicationDbContext context,
        IPasswordHasher<User> passwordHasher,
        ITokenService tokenService,
        ILoginAttemptService loginAttemptService,
        IPasswordResetTokenService passwordResetTokenService,
        IAuditService auditService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _loginAttemptService = loginAttemptService;
        _passwordResetTokenService = passwordResetTokenService;
        _auditService = auditService;
    }

    public async Task<(bool Succeeded, object Response, int StatusCode)> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();

        if (await _context.Users.AnyAsync(u => u.Email == email, cancellationToken))
            return (false, new { message = "This email is already registered." }, StatusCodes.Status409Conflict);

        if (await _context.Users.AnyAsync(u => u.TCKN == request.Tckn, cancellationToken))
            return (false, new { message = "This national identity number is already registered." }, StatusCodes.Status409Conflict);

        var user = new User
        {
            FullName = request.FullName.Trim(),
            TCKN = request.Tckn.Trim(),
            Email = email,
            IsAdmin = false,
            CreatedAt = DateTime.UtcNow
        };
        user.Password = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);
        _auditService.Write("UserRegistered", "Customer account registered.", new { user.Id, user.Email });

        return (true, new
        {
            message = "Registration successful.",
            user = ToUserDto(user)
        }, StatusCodes.Status201Created);
    }

    public async Task<AuthResult> LoginAsync(LoginRequestDto request, bool requireAdmin, string? remoteIp, CancellationToken cancellationToken = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var attemptKey = $"{email}:{remoteIp ?? "unknown"}:{(requireAdmin ? "admin" : "customer")}";
        var lockoutUntil = _loginAttemptService.GetLockoutUntil(attemptKey);

        if (lockoutUntil.HasValue && lockoutUntil.Value > DateTimeOffset.UtcNow)
        {
            _auditService.Write("LoginLockedOut", "Login blocked due to lockout.", new { Email = email, LockoutUntil = lockoutUntil.Value.UtcDateTime, RemoteIp = remoteIp, requireAdmin });
            return AuthResult.Failure(StatusCodes.Status429TooManyRequests, new
            {
                message = $"Too many failed attempts. Try again after {lockoutUntil.Value.UtcDateTime:O}."
            });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
        if (user == null || user.IsAdmin != requireAdmin)
        {
            _loginAttemptService.RegisterFailure(attemptKey);
            _auditService.Write("LoginFailed", "Login failed because account was not found or role did not match.", new { Email = email, RemoteIp = remoteIp, requireAdmin });
            return AuthResult.Failure(StatusCodes.Status401Unauthorized, new { message = "Invalid credentials." });
        }

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.Password, request.Password);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            _loginAttemptService.RegisterFailure(attemptKey);
            _auditService.Write("LoginFailed", "Login failed because password verification did not pass.", new { user.Id, user.Email, RemoteIp = remoteIp, requireAdmin });
            return AuthResult.Failure(StatusCodes.Status401Unauthorized, new { message = "Invalid credentials." });
        }

        _loginAttemptService.Reset(attemptKey);
        _auditService.Write("LoginSucceeded", "Login succeeded.", new { user.Id, user.Email, RemoteIp = remoteIp, requireAdmin });
        return AuthResult.Success(_tokenService.CreateToken(user));
    }

    public Task<RequestPasswordResetResponseDto> RequestPasswordResetAsync(RequestPasswordResetRequestDto request, string? remoteIp, string? userAgent, CancellationToken cancellationToken = default)
        => _passwordResetTokenService.CreateTokenAsync(request.Email, remoteIp, userAgent, cancellationToken);

    public async Task<(bool Succeeded, object Response, int StatusCode)> CompletePasswordResetAsync(CompletePasswordResetRequestDto request, CancellationToken cancellationToken = default)
    {
        var result = await _passwordResetTokenService.ResetPasswordAsync(request, cancellationToken);
        return result.Succeeded
            ? (true, new { message = result.Message }, StatusCodes.Status200OK)
            : (false, new { message = result.Message }, StatusCodes.Status400BadRequest);
    }

    private static AuthUserDto ToUserDto(User user)
    {
        return new AuthUserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Tckn = user.TCKN,
            Email = user.Email,
            Role = user.IsAdmin ? "Admin" : "Customer"
        };
    }
}
