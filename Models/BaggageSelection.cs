namespace FlightReservation.Models
{
    public class BaggageSelection
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User? User { get; set; }

        public int FlightId { get; set; }
        public Flight? Flight { get; set; }

        public int BaggageCount { get; set; }   // 0,1,2...
        public decimal Price { get; set; }      // Örneğin 0, 299, 598

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
