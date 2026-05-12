using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Auth;

public class RequestPasswordResetRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
