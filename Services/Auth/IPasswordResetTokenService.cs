using FlightReservation.Dtos.Auth;

namespace FlightReservation.Services.Auth;

public interface IPasswordResetTokenService
{
    Task<RequestPasswordResetResponseDto> CreateTokenAsync(string email, string? remoteIp, string? userAgent, CancellationToken cancellationToken = default);
    Task<(bool Succeeded, string Message)> ResetPasswordAsync(CompletePasswordResetRequestDto request, CancellationToken cancellationToken = default);
}
