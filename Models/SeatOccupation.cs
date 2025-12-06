using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FlightReservation.Models
{
    public class SeatOccupation
    {
        public int Id { get; set; }

        // Hangi uçuşa ait?
        public int FlightId { get; set; }
        public Flight Flight { get; set; }

        // Örn: "12A"
        [Required]
        [MaxLength(4)]
        public string SeatNumber { get; set; } = "";

        // Koltuk dolu mu?
        public bool IsReserved { get; set; } = false;

        // Koltuğu hangi kullanıcı aldı?
        public int? UserId { get; set; }
        public User? User { get; set; }

        // OPTIONAL — Ne zaman rezerve edildi?
        public DateTime ReservedAt { get; set; } = DateTime.UtcNow;
    }
}
