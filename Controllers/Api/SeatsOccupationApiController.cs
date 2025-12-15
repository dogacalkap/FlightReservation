using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    // Explicit route name to align with the frontend URL: /api/SeatOccupation
    [Route("api/SeatOccupation")]
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
        public async Task<IActionResult> GetOccupiedSeats(string flightId)
        {
            // Bazı isteklerde "<9>" gibi karakterler gelebiliyor; yalnızca rakamları alıp parse edelim
            var digitsOnly = new string(flightId.Where(char.IsDigit).ToArray());

            if (!int.TryParse(digitsOnly, out var flightIdInt))
                return BadRequest("Geçersiz flightId");

            var seats = await _context.SeatOccupations
                .Where(s => s.FlightId == flightIdInt)
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
