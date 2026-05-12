using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Rewards;

public class CreateExtraRewardRequestDto
{
    [Required]
    public int FlightId { get; set; }

    [Required]
    [StringLength(200)]
    public string RewardText { get; set; } = string.Empty;

    [Range(-1000000, 1000000)]
    public decimal DiscountAmount { get; set; }
}
