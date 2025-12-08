using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] PaymentDto dto)
        {
            var flight = await _context.Flights.FindAsync(dto.FlightId);
            if (flight == null)
                return BadRequest("Flight not found.");

            decimal finalPrice = flight.Price;

            // 🎁 EXTRA REWARD
            if (!string.IsNullOrWhiteSpace(dto.ExtraReward))
            {
                switch (dto.ExtraReward)
                {
                    case "%5 Discount":
                        finalPrice *= 0.95m;
                        break;
                    case "%10 Discount":
                        finalPrice *= 0.90m;
                        break;
                    case "Free Flight":
                        finalPrice = 0;
                        break;
                }
            }

            // 🧳 BAGGAGE PRICE
            if (dto.BaggageCount > 0)
                finalPrice += dto.BaggageCount * 299;

            // 💳 CARD SAVE (Optional)
            if (dto.SaveCard)
            {
                var masked = MaskCardNumber(dto.CardNumber);

                var card = new PaymentCard
                {
                    UserId = dto.UserId,
                    CardHolderName = dto.NameOnCard,
                    CardNumberMasked = masked,       // **** **** **** 1234
                    ExpiryMonth = dto.ExpiryMonth,   // DTO’dan geliyor
                    ExpiryYear = dto.ExpiryYear,
                    SavedAt = DateTime.UtcNow
                };

                _context.PaymentCards.Add(card);
            }
            // -------------------------------------------
// ✔ KOLTUK REZERVASYONU (FlightSeat tablosuna kayıt)
// -------------------------------------------
        var seat = await _context.SeatOccupations
        .FirstOrDefaultAsync(s => s.FlightId == dto.FlightId && s.SeatNumber == dto.SeatNumber);

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



            // 🎫 TICKET CREATE
            var ticket = new Ticket
            {
                UserId = dto.UserId,
                FlightId = dto.FlightId,
                SeatNumber = dto.SeatNumber,
                ExtraReward = dto.ExtraReward,
                BaggageCount = dto.BaggageCount,
                FinalPrice = finalPrice,
                CreatedAt = DateTime.UtcNow
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Payment successful",
                ticketId = ticket.Id,
                finalPrice = finalPrice
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

    // ================= DTO =================
    public class PaymentDto
    {
        public int UserId { get; set; }
        
        public int FlightId { get; set; }
        public string SeatNumber { get; set; }
        public int BaggageCount { get; set; }
        public string ExtraReward { get; set; }

        public string CardNumber { get; set; }
        public string NameOnCard { get; set; }

        public string ExpiryMonth { get; set; }   // ÖRN: "06"
        public string ExpiryYear { get; set; }     // ÖRN: "28"

        public bool SaveCard { get; set; }
    }
}
