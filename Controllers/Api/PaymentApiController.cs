using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ============================================
        //                   PAY
        // ============================================
        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] PaymentDto dto)
        {
            var flight = await _context.Flights.FindAsync(dto.FlightId);
            if (flight == null)
                return BadRequest("Flight not found.");

            // -------------------------------------------------------
            // 🔥 1) BASE PRICE (Flight price)
            // -------------------------------------------------------
            decimal finalPrice = flight.Price; 

            // -------------------------------------------------------
            // 🔥 2) SEAT PRICE & 3) BAGGAGE PRICE
            // Angular'dan gelen ücretleri doğrudan ekliyoruz.
            // -------------------------------------------------------
            if (dto.SeatPrice > 0)
                finalPrice += dto.SeatPrice;

            if (dto.BaggagePrice > 0)
                finalPrice += dto.BaggagePrice;

            // -------------------------------------------------------
            // 🔥 4) EXTRAS (Hizmetler ve Çark İndirimleri)
            // -------------------------------------------------------
            if (dto.Extras != null && dto.Extras.Any())
            {
                foreach (var extra in dto.Extras)
                {
                    // ExtraPrice pozitif (ücret) veya negatif (indirim) olabilir.
                    finalPrice += extra.ExtraPrice; 
                }
            }

            // -------------------------------------------------------
            // 💥 DİKKAT: C# API'sinde tekrar hesaplama/indirim yapmıyoruz.
            // Zaten Angular'dan gelen ExtraPrice değerleri (çark dahil) 
            // doğru hesaplanmıştır.
            // -------------------------------------------------------
            
            // -------------------------------------------------------
            // 🔥 5) KART KAYIT MANTIĞI
            // -------------------------------------------------------
            if (dto.SaveCard)
            {
                // ... (Kart maskeleme ve kaydetme mantığı aynı kalır)
                var masked = MaskCardNumber(dto.CardNumber);

                var card = new PaymentCard
                {
                    UserId = dto.UserId,
                    CardHolderName = dto.NameOnCard,
                    CardNumberMasked = masked,
                    ExpiryMonth = dto.ExpiryMonth,
                    ExpiryYear = dto.ExpiryYear,
                    SavedAt = DateTime.UtcNow
                };

                

                _context.PaymentCards.Add(card);
            }

            // -------------------------------------------------------
            // 🔥 6) KOLTUK REZERVASYONU
            // -------------------------------------------------------
            var seat = await _context.SeatOccupations
                .FirstOrDefaultAsync(s =>
                    s.FlightId == dto.FlightId &&
                    s.SeatNumber == dto.SeatNumber);

            if (seat == null)
            {
                seat = new SeatOccupation
                {
                    FlightId = dto.FlightId,
                    SeatNumber = dto.SeatNumber,
                    IsReserved = true,
                    UserId = dto.UserId
                };

                _context.SeatOccupations.Add(seat);
            }
            else
            {
                seat.IsReserved = true;
                seat.UserId = dto.UserId;
            }

            // -------------------------------------------------------
            // 🔥 7) TICKET CREATE
            // -------------------------------------------------------
            var ticket = new Ticket
            {
                UserId = dto.UserId,
                FlightId = dto.FlightId,
                SeatNumber = dto.SeatNumber,
                // ExtraReward: İndirim adını alıyoruz
                ExtraReward = dto.Extras.FirstOrDefault(e => e.ExtraPrice < 0)?.ExtraName ?? "", 
                BaggageCount = dto.BaggageCount,
                FinalPrice = finalPrice, // 🔥 Doğru hesaplanan fiyatı kaydet
                CreatedAt = DateTime.UtcNow
            };

                ticket.SeatPrice = dto.SeatPrice;
                ticket.BaggagePrice = dto.BaggagePrice;
                ticket.ExtrasTotal = dto.Extras.Sum(e => e.ExtraPrice);

            _context.Tickets.Add(ticket);

            // KAYDET
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment successful",
                ticketId = ticket.Id,
                finalPrice = finalPrice // API'den dönen fiyat da doğru olmalı
            });
        }

        // KART MASKELEME
        private string MaskCardNumber(string number)
        {
            if (number.Length < 4)
                return "****";

            string last4 = number.Substring(number.Length - 4);
            return "**** **** **** " + last4;
        }
    }

    // =============================================================
    //                         DTOs
    // =============================================================

    public class PaymentDto
    {
        public int UserId { get; set; }
        public int FlightId { get; set; }

        public string SeatNumber { get; set; }
        public decimal SeatPrice { get; set; } // 💥 DÜZELTİLDİ: Decimal
        public string Cvv { get; set; } // Eksik Cvv alanı
        
        public int BaggageCount { get; set; }
        public decimal BaggagePrice { get; set; } // 💥 DÜZELTİLDİ: Decimal

        public List<ExtraDto> Extras { get; set; } = new();

        public string ExtraReward { get; set; } // Bu alanın varlığını koruyoruz, ancak kullanılmıyor.

        // ... (Kart bilgileri aynı kalır)
        public string CardNumber { get; set; }
        public string NameOnCard { get; set; }
        public string ExpiryMonth { get; set; }
        public string ExpiryYear { get; set; }
        public bool SaveCard { get; set; }
    }

    public class ExtraDto
    {
        public string ExtraCode { get; set; }
        public string ExtraName { get; set; }
        public decimal ExtraPrice { get; set; } // 💥 DÜZELTİLDİ: Decimal
    }
}