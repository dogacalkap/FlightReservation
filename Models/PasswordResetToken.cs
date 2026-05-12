using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Models;

public class PasswordResetToken
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [StringLength(128)]
    public string TokenHash { get; set; } = string.Empty;

    [StringLength(64)]
    public string RequestedByIp { get; set; } = string.Empty;

    [StringLength(512)]
    public string UserAgent { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime? ConsumedAtUtc { get; set; }

    public User? User { get; set; }
}
