using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace FlightReservation.Models
{
    public class Flight
    {
        public int Id { get; set; }

        [Required]
        public string FlightNumber { get; set; } = string.Empty;

        [Required]
        public int FromAirportId { get; set; }

        [Required]
        public int ToAirportId { get; set; }

        public DateTime DepartureTime { get; set; }
        public DateTime ArrivalTime { get; set; }

        public decimal Price { get; set; }

        // 🔽 Bunlar navigation property, formdan gelmeyecek.
        // Bu yüzden nullable + ValidateNever yapıyoruz.
        [ValidateNever]
        public Airport? FromAirport { get; set; }

        [ValidateNever]
        public Airport? ToAirport { get; set; }
    }
}
