using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Reservations;

public class CreateReservationRequestDto
{
    [Required]
    public int FlightId { get; set; }

    [StringLength(10)]
    public string SeatNumber { get; set; } = string.Empty;

    [StringLength(200)]
    public string SeatNumbers { get; set; } = string.Empty;

    [Range(1, 9)]
    public int PassengerCount { get; set; } = 1;

    [Range(0, 9)]
    public int BaggageCount { get; set; }

    [Range(0, 1000000)]
    public decimal BaggagePrice { get; set; }

    [StringLength(200)]
    public string ExtraReward { get; set; } = "None";

    [Range(-1000000, 0)]
    public decimal ExtraDiscountAmount { get; set; }

    [Range(0, 100000000)]
    public decimal TotalPrice { get; set; }
}
