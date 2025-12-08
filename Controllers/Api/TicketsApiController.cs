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

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserTickets(int userId)
        {
            var tickets = await _context.Tickets
                .Include(t => t.Flight)
                .Where(t => t.UserId == userId)
                .ToListAsync();

            return Ok(tickets);
        }


    }
}
