using FlightReservation.Data;
using FlightReservation.Dtos.Flights;
using FlightReservation.Models;
using Microsoft.AspNetCore.Authorization;
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
                    FromAirportCode = f.FromAirport != null ? f.FromAirport.Code : string.Empty,
                    ToAirportCode = f.ToAirport != null ? f.ToAirport.Code : string.Empty,

                    // Names
                    FromAirportName = f.FromAirport != null ? f.FromAirport.Name : string.Empty,
                    ToAirportName = f.ToAirport != null ? f.ToAirport.Name : string.Empty,

                    // Cities
                    FromAirportCity = f.FromAirport != null ? f.FromAirport.City : string.Empty,
                    ToAirportCity = f.ToAirport != null ? f.ToAirport.City : string.Empty,

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

                    FromAirportCode = f.FromAirport != null ? f.FromAirport.Code : string.Empty,
                    ToAirportCode = f.ToAirport != null ? f.ToAirport.Code : string.Empty,

                    FromAirportName = f.FromAirport != null ? f.FromAirport.Name : string.Empty,
                    ToAirportName = f.ToAirport != null ? f.ToAirport.Name : string.Empty,

                    FromAirportCity = f.FromAirport != null ? f.FromAirport.City : string.Empty,
                    ToAirportCity = f.ToAirport != null ? f.ToAirport.City : string.Empty,

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
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Flight>> CreateFlight([FromBody] UpsertFlightRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (request.FromAirportId == request.ToAirportId)
                return BadRequest(new { message = "Departure and arrival airports cannot be the same." });

            if (request.ArrivalTime <= request.DepartureTime)
                return BadRequest(new { message = "Arrival time must be later than departure time." });

            var airportsExist = await _context.Airports
                .Where(a => a.Id == request.FromAirportId || a.Id == request.ToAirportId)
                .CountAsync();

            if (airportsExist != 2)
                return BadRequest(new { message = "One or more airport references are invalid." });

            var flight = new Flight
            {
                FlightNumber = request.FlightNumber.Trim().ToUpperInvariant(),
                FromAirportId = request.FromAirportId,
                ToAirportId = request.ToAirportId,
                DepartureTime = request.DepartureTime,
                ArrivalTime = request.ArrivalTime,
                Price = request.Price
            };

            _context.Flights.Add(flight);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFlight), new { id = flight.Id }, flight);
        }

        // ------------------------------------------------------------
        // PUT: api/FlightsApi/{id}
        // Admin – Update flight
        // ------------------------------------------------------------
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateFlight(int id, [FromBody] UpsertFlightRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (request.FromAirportId == request.ToAirportId)
                return BadRequest(new { message = "Departure and arrival airports cannot be the same." });

            if (request.ArrivalTime <= request.DepartureTime)
                return BadRequest(new { message = "Arrival time must be later than departure time." });

            var flight = await _context.Flights.FindAsync(id);
            if (flight == null)
                return NotFound();

            var airportsExist = await _context.Airports
                .Where(a => a.Id == request.FromAirportId || a.Id == request.ToAirportId)
                .CountAsync();

            if (airportsExist != 2)
                return BadRequest(new { message = "One or more airport references are invalid." });

            flight.FlightNumber = request.FlightNumber.Trim().ToUpperInvariant();
            flight.FromAirportId = request.FromAirportId;
            flight.ToAirportId = request.ToAirportId;
            flight.DepartureTime = request.DepartureTime;
            flight.ArrivalTime = request.ArrivalTime;
            flight.Price = request.Price;

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
        [Authorize(Roles = "Admin")]
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
