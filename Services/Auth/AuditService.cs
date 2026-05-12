namespace FlightReservation.Services.Auth;

public interface IAuditService
{
    void Write(string eventType, string message, object? metadata = null);
}

public class AuditService : IAuditService
{
    private readonly ILogger<AuditService> _logger;

    public AuditService(ILogger<AuditService> logger)
    {
        _logger = logger;
    }

    public void Write(string eventType, string message, object? metadata = null)
    {
        _logger.LogInformation("AuditEvent {EventType}: {Message} {@Metadata}", eventType, message, metadata);
    }
}
