using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeatOccupationApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SeatOccupationApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET → Belirli uçuşun dolu koltukları
        [HttpGet("{flightId}")]
        public async Task<IActionResult> GetOccupiedSeats(int flightId)
        {
            var seats = await _context.SeatOccupations
                .Where(s => s.FlightId == flightId)
                .Select(s => s.SeatNumber)
                .ToListAsync();

            return Ok(seats);
        }

        // POST → Yeni koltuk rezerve et
        [HttpPost("reserve")]
        public async Task<IActionResult> ReserveSeat([FromBody] SeatOccupation dto)
        {
            // Önce kontrol et koltuk alınmış mı
            bool exists = await _context.SeatOccupations
                .AnyAsync(s => s.FlightId == dto.FlightId && s.SeatNumber == dto.SeatNumber);

            if (exists)
                return BadRequest("Seat is already taken.");

            _context.SeatOccupations.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Seat reserved successfully." });
        }
    }
}
