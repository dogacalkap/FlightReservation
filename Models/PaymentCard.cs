namespace FlightReservation.Models
{
    public class PaymentCard
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public string CardHolderName { get; set; } = "";
        public string CardNumberMasked { get; set; } = "";    // **** **** **** 1234
        public string ExpiryMonth { get; set; } = "";
        public string ExpiryYear { get; set; } = "";

        public DateTime SavedAt { get; set; } = DateTime.UtcNow;
    }
}
