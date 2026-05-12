namespace FlightReservation.Options;

public class PasswordResetOptions
{
    public const string SectionName = "PasswordReset";

    public int TokenLifetimeMinutes { get; set; } = 15;
    public bool ExposeDebugTokenInDevelopment { get; set; } = true;
    public string FrontendResetUrl { get; set; } = string.Empty;
}
