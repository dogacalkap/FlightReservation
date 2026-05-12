using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Seats
{
    public class ReserveSeatRequestDto
    {
        [Required]
        public int FlightId { get; set; }

        [Required]
        [StringLength(10)]
        public string SeatNumber { get; set; } = string.Empty;
    }
}
