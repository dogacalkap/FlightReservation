using System;

namespace FlightReservation.Models
{
    public class Airport
    {
        public int Id { get; set; }
        public string Code { get; set; }      // IST, ADB, SAW
        public string Name { get; set; }      // İstanbul Havalimanı
        public string City { get; set; }      // İstanbul
        public string Country { get; set; }   // Türkiye
    }
}
