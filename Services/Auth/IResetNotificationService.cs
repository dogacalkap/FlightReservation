namespace FlightReservation.Services.Auth;

public interface IResetNotificationService
{
    Task SendPasswordResetAsync(string email, string resetUrl, DateTime expiresAtUtc, CancellationToken cancellationToken = default);
}
