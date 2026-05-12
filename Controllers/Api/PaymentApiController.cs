using FlightReservation.Data;
using FlightReservation.Dtos.Payments;
using FlightReservation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using FlightReservation.Services.Pricing;
using FlightReservation.Services.Auth;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPricingService _pricingService;
        private readonly IAuditService _auditService;

        public PaymentApiController(ApplicationDbContext context, IPricingService pricingService, IAuditService auditService)
        {
            _context = context;
            _pricingService = pricingService;
            _auditService = auditService;
        }

        [Authorize]
        [HttpPost("pay")]
        public async Task<IActionResult> Pay([FromBody] PaymentRequestDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized(new { message = "Invalid user context." });

            var flight = await _context.Flights.FindAsync(dto.FlightId);
            if (flight == null)
                return BadRequest(new { message = "Flight not found." });

            var passengerCount = dto.PassengerCount > 0 ? dto.PassengerCount : 1;
            var seatList = dto.SeatNumbers?.Any() == true
                ? dto.SeatNumbers.Select(s => s.Trim().ToUpperInvariant()).ToList()
                : (string.IsNullOrWhiteSpace(dto.SeatNumber)
                    ? new List<string>()
                    : new List<string> { dto.SeatNumber.Trim().ToUpperInvariant() });

            if (seatList.Count == 0)
                return BadRequest(new { message = "Seat list cannot be empty." });

            if (seatList.Count != passengerCount)
                return BadRequest(new { message = "Selected seat count must match passenger count." });

            if (seatList.Count != seatList.Distinct(StringComparer.OrdinalIgnoreCase).Count())
                return BadRequest(new { message = "Duplicate seat numbers are not allowed." });

            decimal baseFlightTotal = flight.Price * passengerCount;
            decimal calculatedSeatPrice = seatList.Sum(_pricingService.CalculateSeatPrice);
            decimal calculatedBaggagePrice = _pricingService.CalculateBaggagePrice(dto.BaggageCount);
            var calculatedExtras = CalculateExtras(dto.Extras, baseFlightTotal, calculatedBaggagePrice);

            decimal finalPrice = baseFlightTotal
                + calculatedSeatPrice
                + calculatedBaggagePrice
                + calculatedExtras.Sum(e => e.Price);

            if (dto.SaveCard)
            {
                var masked = MaskCardNumber(dto.CardNumber);

                var card = new PaymentCard
                {
                    UserId = userId,
                    CardHolderName = dto.NameOnCard,
                    CardNumberMasked = masked,
                    ExpiryMonth = dto.ExpiryMonth,
                    ExpiryYear = dto.ExpiryYear,
                    SavedAt = DateTime.UtcNow
                };

                _context.PaymentCards.Add(card);
            }

            var existingSeats = await _context.SeatOccupations
                .Where(s => s.FlightId == dto.FlightId && seatList.Contains(s.SeatNumber))
                .Select(s => s.SeatNumber)
                .ToListAsync();

            if (existingSeats.Any())
                return BadRequest(new { message = $"Seats already taken: {string.Join(",", existingSeats)}" });

            foreach (var seatNo in seatList)
            {
                var seat = await _context.SeatOccupations
                    .FirstOrDefaultAsync(s => s.FlightId == dto.FlightId && s.SeatNumber == seatNo);

                if (seat == null)
                {
                    seat = new SeatOccupation
                    {
                        FlightId = dto.FlightId,
                        SeatNumber = seatNo,
                        IsReserved = true,
                        UserId = userId
                    };

                    _context.SeatOccupations.Add(seat);
                }
                else
                {
                    seat.IsReserved = true;
                    seat.UserId = userId;
                }
            }

            var ticket = new Ticket
            {
                UserId = userId,
                FlightId = dto.FlightId,
                SeatNumber = seatList.FirstOrDefault() ?? string.Empty,
                SeatNumbers = string.Join(",", seatList),
                PassengerCount = passengerCount,
                ExtraReward = calculatedExtras.FirstOrDefault(e => e.Price < 0)?.Name ?? string.Empty,
                BaggageCount = dto.BaggageCount,
                FinalPrice = finalPrice,
                CreatedAt = DateTime.UtcNow,
                SeatPrice = calculatedSeatPrice,
                BaggagePrice = calculatedBaggagePrice,
                ExtrasTotal = calculatedExtras.Sum(e => e.Price)
            };

            _context.Tickets.Add(ticket);
            await _context.SaveChangesAsync();
            _auditService.Write("PaymentCompleted", "Payment completed and ticket created.", new { userId, dto.FlightId, ticket.Id, finalPrice });

            return Ok(new
            {
                message = "Payment successful",
                ticketId = ticket.Id,
                finalPrice
            });
        }

        private List<CalculatedExtra> CalculateExtras(
            IEnumerable<PaymentExtraRequestDto> extras,
            decimal baseFlightTotal,
            decimal baggagePrice)
        {
            var calculated = new List<CalculatedExtra>();

            foreach (var extra in extras ?? Enumerable.Empty<PaymentExtraRequestDto>())
            {
                var code = extra.ExtraCode?.Trim().ToUpperInvariant();
                if (string.IsNullOrWhiteSpace(code))
                    continue;

                switch (code)
                {
                    case "INSURANCE":
                        calculated.Add(new CalculatedExtra(code, "Travel Insurance", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "MEAL":
                        calculated.Add(new CalculatedExtra(code, "Meal", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "FAST_TRACK":
                        calculated.Add(new CalculatedExtra(code, "Fast Track", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "DISC10":
                        calculated.Add(new CalculatedExtra(code, "%10 Discount", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "DISC15":
                        calculated.Add(new CalculatedExtra(code, "%15 Discount", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "FREE_BAG":
                        calculated.Add(new CalculatedExtra(code, "Free Cabin Bag", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "BAG50":
                        calculated.Add(new CalculatedExtra(code, "Baggage 50% Discount", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "FREE_TICKET":
                        calculated.Add(new CalculatedExtra(code, "Next Ticket Free", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                    case "NONE":
                        calculated.Add(new CalculatedExtra(code, "No Reward", _pricingService.CalculateExtraAdjustment(code, baseFlightTotal, baggagePrice)));
                        break;
                }
            }

            return calculated;
        }

        private static string MaskCardNumber(string number)
        {
            if (number.Length < 4)
                return "****";

            string last4 = number.Substring(number.Length - 4);
            return "**** **** **** " + last4;
        }

        private sealed record CalculatedExtra(string Code, string Name, decimal Price);
    }
}
