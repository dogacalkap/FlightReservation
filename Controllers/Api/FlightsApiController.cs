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

        // ------------------------------------------------------------
        // GET: api/FlightsApi
        // Şehir + Kod + Ad bilgileri ile uçuş listesi döner
        // ------------------------------------------------------------
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

                    // IDs
                    f.FromAirportId,
                    f.ToAirportId,

                    // Codes
                    FromAirportCode = f.FromAirport.Code,
                    ToAirportCode = f.ToAirport.Code,

                    // Names
                    FromAirportName = f.FromAirport.Name,
                    ToAirportName = f.ToAirport.Name,

                    // Cities
                    FromAirportCity = f.FromAirport.City,
                    ToAirportCity = f.ToAirport.City,

                    // Times
                    f.DepartureTime,
                    f.ArrivalTime,

                    // Price
                    f.Price
                })
                .ToListAsync();

            return Ok(flights);
        }

        // ------------------------------------------------------------
        // GET: api/FlightsApi/{id}
        // Tek uçuş detayını döner
        // ------------------------------------------------------------
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

                    FromAirportName = f.FromAirport.Name,
                    ToAirportName = f.ToAirport.Name,

                    FromAirportCity = f.FromAirport.City,
                    ToAirportCity = f.ToAirport.City,

                    f.DepartureTime,
                    f.ArrivalTime,
                    f.Price
                })
                .FirstOrDefaultAsync();

            if (flight == null)
                return NotFound();

            return Ok(flight);
        }

        // ------------------------------------------------------------
        // POST: api/FlightsApi
        // Admin – Create flight
        // ------------------------------------------------------------
        [HttpPost]
        public async Task<ActionResult<Flight>> CreateFlight([FromBody] Flight flight)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Flights.Add(flight);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFlight), new { id = flight.Id }, flight);
        }

        // ------------------------------------------------------------
        // PUT: api/FlightsApi/{id}
        // Admin – Update flight
        // ------------------------------------------------------------
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

        // ------------------------------------------------------------
        // DELETE: api/FlightsApi/{id}
        // Admin – Delete flight
        // ------------------------------------------------------------
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
