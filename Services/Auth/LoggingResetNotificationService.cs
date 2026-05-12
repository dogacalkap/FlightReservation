namespace FlightReservation.Services.Auth;

public class LoggingResetNotificationService : IResetNotificationService
{
    private readonly ILogger<LoggingResetNotificationService> _logger;

    public LoggingResetNotificationService(ILogger<LoggingResetNotificationService> logger)
    {
        _logger = logger;
    }

    public Task SendPasswordResetAsync(string email, string resetUrl, DateTime expiresAtUtc, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Password reset requested for {Email}. Reset URL: {ResetUrl}. ExpiresAtUtc: {ExpiresAtUtc}",
            email,
            resetUrl,
            expiresAtUtc);

        return Task.CompletedTask;
    }
}
