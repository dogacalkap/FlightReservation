namespace FlightReservation.Dtos.Auth;

public class RequestPasswordResetResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string? DebugResetToken { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
}
