using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaggageSelectionsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BaggageSelectionsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> SaveBaggage([FromBody] BaggageSelection bag)
        {
            _context.BaggageSelections.Add(bag);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Baggage saved.", bag });
        }
    }
}
