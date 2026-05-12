using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        // İlişkiler
        public int UserId { get; set; }
        public User? User { get; set; }

        public int FlightId { get; set; }
        public Flight? Flight { get; set; }

        // Seat seçimi
        [StringLength(10)]
        public string SeatNumber { get; set; } = string.Empty;

        [StringLength(200)]
        public string SeatNumbers { get; set; } = string.Empty; // Çoklu koltuk seçimi (virgül ile)
        public int PassengerCount { get; set; } = 1;

        // Extra ödül (Spin Wheel)
        public string? ExtraReward { get; set; }

        // Baggage seçimi
        public int BaggageCount { get; set; } = 0;

        // 🔥 Fiyat parçaları → DECIMAL OLMALI
        public decimal SeatPrice { get; set; }
        public decimal BaggagePrice { get; set; }
        public decimal ExtrasTotal { get; set; }

        // Final fiyat (discount + baggage + extras sonrası)
        public decimal FinalPrice { get; set; }

        // Oluşturulma tarihi
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
