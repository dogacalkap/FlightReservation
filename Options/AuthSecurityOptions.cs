namespace FlightReservation.Options;

public class AuthSecurityOptions
{
    public const string SectionName = "AuthSecurity";

    public int MaxFailedLoginAttempts { get; set; } = 5;
    public int LockoutMinutes { get; set; } = 15;
}
