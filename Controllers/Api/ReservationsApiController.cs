using FlightReservation.Data;
using FlightReservation.Dtos.Reservations;
using FlightReservation.Models;
using FlightReservation.Services.Pricing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPricingService _pricingService;

        public ReservationsApiController(ApplicationDbContext context, IPricingService pricingService)
        {
            _context = context;
            _pricingService = pricingService;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var flight = await _context.Flights.FindAsync(request.FlightId);
            if (flight == null)
                return BadRequest(new { message = "Flight not found." });

            var passengerCount = request.PassengerCount > 0 ? request.PassengerCount : 1;
            var seatList = request.SeatNumbers.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(s => s.ToUpperInvariant())
                .ToList();

            if (!string.IsNullOrWhiteSpace(request.SeatNumber) && seatList.Count == 0)
                seatList.Add(request.SeatNumber.Trim().ToUpperInvariant());

            if (seatList.Count == 0)
                return BadRequest(new { message = "Seat list cannot be empty." });

            if (seatList.Count != passengerCount)
                return BadRequest(new { message = "Selected seat count must match passenger count." });

            var baggagePrice = _pricingService.CalculateBaggagePrice(request.BaggageCount);
            var seatPrice = seatList.Sum(_pricingService.CalculateSeatPrice);
            var extraCode = request.ExtraReward.Trim().ToUpperInvariant();
            var extraDiscountAmount = _pricingService.CalculateExtraAdjustment(extraCode, flight.Price * passengerCount, baggagePrice);
            var totalPrice = (flight.Price * passengerCount) + seatPrice + baggagePrice + extraDiscountAmount;

            var reservation = new Reservation
            {
                UserId = userId,
                FlightId = request.FlightId,
                SeatNumber = seatList.FirstOrDefault() ?? string.Empty,
                SeatNumbers = string.Join(",", seatList),
                PassengerCount = passengerCount,
                BaggageCount = request.BaggageCount,
                BaggagePrice = baggagePrice,
                ExtraReward = extraCode,
                ExtraDiscountAmount = extraDiscountAmount,
                TotalPrice = totalPrice,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reservation created.", id = reservation.Id });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetReservations()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var list = await _context.Reservations
                .Where(r => r.UserId == userId)
                .Include(r => r.Flight)
                .ThenInclude(f => f!.FromAirport)
                .Include(r => r.Flight)
                .ThenInclude(f => f!.ToAirport)
                .Select(r => new
                {
                    r.Id,
                    r.FlightId,
                    r.SeatNumber,
                    r.SeatNumbers,
                    r.PassengerCount,
                    r.BaggageCount,
                    r.BaggagePrice,
                    r.ExtraReward,
                    r.ExtraDiscountAmount,
                    r.TotalPrice,
                    r.CreatedAt,
                    Flight = r.Flight == null ? null : new
                    {
                        r.Flight.Id,
                        r.Flight.FlightNumber,
                        r.Flight.DepartureTime,
                        r.Flight.ArrivalTime,
                        FromAirportCode = r.Flight.FromAirport != null ? r.Flight.FromAirport.Code : string.Empty,
                        ToAirportCode = r.Flight.ToAirport != null ? r.Flight.ToAirport.Code : string.Empty,
                        FromAirportCity = r.Flight.FromAirport != null ? r.Flight.FromAirport.City : string.Empty,
                        ToAirportCity = r.Flight.ToAirport != null ? r.Flight.ToAirport.City : string.Empty
                    }
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}
