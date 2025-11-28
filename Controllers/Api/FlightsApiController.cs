using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class FlightsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FlightsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/FlightsApi
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetFlights()
        {
            var flights = await _context.Flights
                .Include(f => f.FromAirport)
                .Include(f => f.ToAirport)
                .Select(f => new
                {
                    f.Id,
                    f.FlightNumber,
                    f.FromAirportId,
                    f.ToAirportId,
                    FromAirportCode = f.FromAirport.Code,
                    ToAirportCode = f.ToAirport.Code,
                    f.DepartureTime,
                    f.ArrivalTime,
                    f.Price
                })
                .ToListAsync();

            return Ok(flights);
        }

        // GET: api/FlightsApi/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetFlight(int id)
        {
            var flight = await _context.Flights
                .Include(f => f.FromAirport)
                .Include(f => f.ToAirport)
                .Where(f => f.Id == id)
                .Select(f => new
                {
                    f.Id,
                    f.FlightNumber,
                    f.FromAirportId,
                    f.ToAirportId,
                    FromAirportCode = f.FromAirport.Code,
                    ToAirportCode = f.ToAirport.Code,
                    f.DepartureTime,
                    f.ArrivalTime,
                    f.Price
                })
                .FirstOrDefaultAsync();

            if (flight == null)
                return NotFound();

            return Ok(flight);
        }

        // POST: api/FlightsApi
        [HttpPost]
        public async Task<ActionResult<Flight>> CreateFlight([FromBody] Flight flight)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Flights.Add(flight);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFlight), new { id = flight.Id }, flight);
        }

        // PUT: api/FlightsApi/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFlight(int id, [FromBody] Flight flight)
        {
            if (id != flight.Id)
                return BadRequest("Id uyuşmuyor.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Entry(flight).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await _context.Flights.AnyAsync(f => f.Id == id);
                if (!exists)
                    return NotFound();

                throw;
            }

            return NoContent();
        }

        // DELETE: api/FlightsApi/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFlight(int id)
        {
            var flight = await _context.Flights.FindAsync(id);
            if (flight == null)
                return NotFound();

            _context.Flights.Remove(flight);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
