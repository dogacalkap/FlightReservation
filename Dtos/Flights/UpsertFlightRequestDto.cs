using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Flights
{
    public class UpsertFlightRequestDto
    {
        [Required]
        [StringLength(20)]
        public string FlightNumber { get; set; } = string.Empty;

        [Required]
        public int FromAirportId { get; set; }

        [Required]
        public int ToAirportId { get; set; }

        [Required]
        public DateTime DepartureTime { get; set; }

        [Required]
        public DateTime ArrivalTime { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }
    }
}
