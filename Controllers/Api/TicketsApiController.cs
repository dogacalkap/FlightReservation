using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class TicketsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TicketsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetUserTickets()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var tickets = await _context.Tickets
                .Where(t => t.UserId == userId)
                .Include(t => t.Flight)
                    .ThenInclude(f => f!.FromAirport)
                .Include(t => t.Flight)
                    .ThenInclude(f => f!.ToAirport)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.SeatNumber,
                    t.SeatNumbers,
                    t.PassengerCount,
                    t.BaggageCount,
                    t.SeatPrice,
                    t.BaggagePrice,
                    t.ExtrasTotal,
                    t.FinalPrice,
                    t.ExtraReward,
                    t.CreatedAt,
                    Flight = t.Flight == null ? null : new
                    {
                        t.Flight.Id,
                        t.Flight.FlightNumber,
                        t.Flight.DepartureTime,
                        t.Flight.ArrivalTime,
                        t.Flight.Price,
                        t.Flight.FromAirportId,
                        t.Flight.ToAirportId,
                        FromAirportCode = t.Flight.FromAirport != null ? t.Flight.FromAirport.Code : string.Empty,
                        ToAirportCode = t.Flight.ToAirport != null ? t.Flight.ToAirport.Code : string.Empty,
                        FromAirportName = t.Flight.FromAirport != null ? t.Flight.FromAirport.Name : string.Empty,
                        ToAirportName = t.Flight.ToAirport != null ? t.Flight.ToAirport.Name : string.Empty,
                        FromAirportCity = t.Flight.FromAirport != null ? t.Flight.FromAirport.City : string.Empty,
                        ToAirportCity = t.Flight.ToAirport != null ? t.Flight.ToAirport.City : string.Empty
                    }
                })
                .ToListAsync();

            return Ok(tickets);
        }

        [Authorize]
        [HttpDelete("{ticketId}")]
        public async Task<IActionResult> CancelTicket(int ticketId)
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound();

            if (ticket.UserId != userId)
                return Forbid();

            // İlgili koltuk rezervasyonunu da serbest bırak
            var seat = await _context.SeatOccupations
                .FirstOrDefaultAsync(s =>
                    s.FlightId == ticket.FlightId &&
                    s.SeatNumber == ticket.SeatNumber &&
                    (s.UserId == null || s.UserId == ticket.UserId));

            if (seat != null)
            {
                _context.SeatOccupations.Remove(seat);
            }

            _context.Tickets.Remove(ticket);
            await _context.SaveChangesAsync();

            return NoContent(); // 204
        }
    }
}
