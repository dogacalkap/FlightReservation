using FlightReservation.Dtos.Auth;

namespace FlightReservation.Services.Auth;

public interface IAuthService
{
    Task<(bool Succeeded, object Response, int StatusCode)> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
    Task<AuthResult> LoginAsync(LoginRequestDto request, bool requireAdmin, string? remoteIp, CancellationToken cancellationToken = default);
    Task<RequestPasswordResetResponseDto> RequestPasswordResetAsync(RequestPasswordResetRequestDto request, string? remoteIp, string? userAgent, CancellationToken cancellationToken = default);
    Task<(bool Succeeded, object Response, int StatusCode)> CompletePasswordResetAsync(CompletePasswordResetRequestDto request, CancellationToken cancellationToken = default);
}
