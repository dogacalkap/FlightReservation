using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Airports
{
    public class UpsertAirportRequestDto
    {
        [Required]
        [StringLength(10, MinimumLength = 3)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;
    }
}
