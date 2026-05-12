using FlightReservation.Data;
using FlightReservation.Dtos.Seats;
using FlightReservation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
        [Authorize]
        [HttpPost("reserve")]
        public async Task<IActionResult> ReserveSeat([FromBody] ReserveSeatRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var seatNumber = request.SeatNumber.Trim().ToUpperInvariant();

            bool exists = await _context.SeatOccupations
                .AnyAsync(s => s.FlightId == request.FlightId && s.SeatNumber == seatNumber);

            if (exists)
                return BadRequest("Seat is already taken.");

            _context.SeatOccupations.Add(new SeatOccupation
            {
                FlightId = request.FlightId,
                SeatNumber = seatNumber,
                UserId = userId,
                IsReserved = true
            });
            await _context.SaveChangesAsync();

            return Ok(new { message = "Seat reserved successfully." });
        }
    }
}
