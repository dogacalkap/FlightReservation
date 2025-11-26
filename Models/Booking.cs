using System;

namespace FlightReservation.Models
{
    public class Booking
    {
        public int Id { get; set; }

        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }

        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        // Flight ilişkisi
        public int FlightId { get; set; }
        public Flight Flight { get; set; }
    }
}
