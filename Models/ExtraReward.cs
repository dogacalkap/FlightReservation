namespace FlightReservation.Models
{
    public class ExtraReward
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int FlightId { get; set; }
        public Flight Flight { get; set; }

        public string RewardText { get; set; } = "";
        public decimal DiscountAmount { get; set; } = 0;

        public DateTime EarnedAt { get; set; } = DateTime.UtcNow;
    }
}
