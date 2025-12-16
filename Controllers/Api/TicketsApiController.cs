using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        // GET: api/TicketsApi/user/7 → kullanıcının biletleri
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserTickets(int userId)
        {
            var tickets = await _context.Tickets
                .Where(t => t.UserId == userId)
                .Include(t => t.Flight)
                    .ThenInclude(f => f.FromAirport)
                .Include(t => t.Flight)
                    .ThenInclude(f => f.ToAirport)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new
                {
                    t.Id,
                    t.SeatNumber,
                    t.BaggageCount,
                    t.SeatPrice,
                    t.BaggagePrice,
                    t.ExtrasTotal,
                    t.FinalPrice,
                    t.ExtraReward,
                    t.CreatedAt,
                    Flight = new
                    {
                        t.Flight.Id,
                        t.Flight.FlightNumber,
                        t.Flight.DepartureTime,
                        t.Flight.ArrivalTime,
                        t.Flight.Price,
                        t.Flight.FromAirportId,
                        t.Flight.ToAirportId,
                        FromAirportCode = t.Flight.FromAirport!.Code,
                        ToAirportCode = t.Flight.ToAirport!.Code,
                        FromAirportName = t.Flight.FromAirport.Name,
                        ToAirportName = t.Flight.ToAirport.Name,
                        FromAirportCity = t.Flight.FromAirport.City,
                        ToAirportCity = t.Flight.ToAirport.City
                    }
                })
                .ToListAsync();

            return Ok(tickets);
        }

        // DELETE: api/TicketsApi/8 → bileti iptal et
        [HttpDelete("{ticketId}")]
        public async Task<IActionResult> CancelTicket(int ticketId)
        {
            var ticket = await _context.Tickets.FindAsync(ticketId);
            if (ticket == null)
                return NotFound();

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
