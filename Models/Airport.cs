using System;
using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Models
{
    public class Airport
    {
        public int Id { get; set; }

        [Required]
        [StringLength(10)]
        public string Code { get; set; } = string.Empty;      // IST, ADB, SAW

        [Required]
        [StringLength(150)]
        public string Name { get; set; } = string.Empty;      // İstanbul Havalimanı

        [Required]
        [StringLength(100)]
        public string City { get; set; } = string.Empty;      // İstanbul

        [Required]
        [StringLength(100)]
        public string Country { get; set; } = string.Empty;   // Türkiye
    }
}
