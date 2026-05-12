using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Baggage;

public class CreateBaggageSelectionRequestDto
{
    [Required]
    public int FlightId { get; set; }

    [Range(0, 9)]
    public int BaggageCount { get; set; }

    [Range(0, 1000000)]
    public decimal Price { get; set; }
}
