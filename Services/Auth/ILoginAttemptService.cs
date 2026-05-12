namespace FlightReservation.Services.Auth;

public interface ILoginAttemptService
{
    DateTimeOffset? GetLockoutUntil(string key);
    void RegisterFailure(string key);
    void Reset(string key);
}
