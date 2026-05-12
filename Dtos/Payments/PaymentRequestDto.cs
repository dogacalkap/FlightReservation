using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Payments
{
    public class PaymentRequestDto
    {
        [Required]
        public int FlightId { get; set; }

        [Range(1, 9)]
        public int PassengerCount { get; set; } = 1;

        [StringLength(10)]
        public string SeatNumber { get; set; } = string.Empty;

        public List<string> SeatNumbers { get; set; } = new();

        [StringLength(4)]
        public string Cvv { get; set; } = string.Empty;

        [Range(0, 9)]
        public int BaggageCount { get; set; }

        public List<PaymentExtraRequestDto> Extras { get; set; } = new();

        [StringLength(100)]
        public string ExtraReward { get; set; } = string.Empty;

        [StringLength(32)]
        public string CardNumber { get; set; } = string.Empty;

        [StringLength(150)]
        public string NameOnCard { get; set; } = string.Empty;

        [StringLength(2)]
        public string ExpiryMonth { get; set; } = string.Empty;

        [StringLength(4)]
        public string ExpiryYear { get; set; } = string.Empty;

        public bool SaveCard { get; set; }
    }

    public class PaymentExtraRequestDto
    {
        [StringLength(50)]
        public string ExtraCode { get; set; } = string.Empty;

        [StringLength(100)]
        public string ExtraName { get; set; } = string.Empty;
    }
}
