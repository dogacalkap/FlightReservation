using System;

namespace FlightReservation.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        // İlişkiler
        public int UserId { get; set; }
        public User User { get; set; }

        public int FlightId { get; set; }
        public Flight Flight { get; set; }

        // Seat seçimi
        public string SeatNumber { get; set; } = "";

        // Extra ödül (Spin Wheel)
        public string? ExtraReward { get; set; }

        // Baggage seçimi
        public int BaggageCount { get; set; } = 0;

        // Final fiyat (discount + baggage sonrası)
        public decimal FinalPrice { get; set; }

        // Oluşturulma tarihi
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
