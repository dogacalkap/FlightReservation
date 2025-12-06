using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReservationsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReservationsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateReservation([FromBody] Reservation dto)
        {
            _context.Reservations.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reservation created.", id = dto.Id });
        }

        // Get user's all reservations
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetReservations(int userId)
        {
            var list = await _context.Reservations
                .Include(r => r.Flight)
                .ToListAsync();

            return Ok(list.Where(r => r.UserId == userId));
        }
    }
}
