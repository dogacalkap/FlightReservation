using System;

namespace FlightReservation.Models
{
    public class Reservation
    {
        public int Id { get; set; }

        // User (giriş yapan)
        public int UserId { get; set; }
        public User User { get; set; }

        // Flight
        public int FlightId { get; set; }
        public Flight Flight { get; set; }

        // Seat
        public string SeatNumber { get; set; } = "";

        // Baggage kg veya parça sayısı
        public int BaggageCount { get; set; } = 0;
        public decimal BaggagePrice { get; set; } = 0;

        // Extras → Çark ödülü
        public string ExtraReward { get; set; } = "None";
        public decimal ExtraDiscountAmount { get; set; } = 0;

        // Total (bilet ücreti + bagaj - indirim)
        public decimal TotalPrice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
