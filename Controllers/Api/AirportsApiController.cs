using FlightReservation.Data;
using FlightReservation.Dtos.Airports;
using FlightReservation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")] 
    [ApiController]
    public class AirportsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AirportsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/AirportsApi
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Airport>>> GetAirports()
     {
            var airports = await _context.Airports
            .OrderBy(a => a.City)  
            .ThenBy(a => a.Name)    
            .ToListAsync();

            return Ok(airports);
    }


        // GET: api/AirportsApi/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Airport>> GetAirport(int id)
        {
            var airport = await _context.Airports.FindAsync(id);

            if (airport == null)
                return NotFound();

            return Ok(airport);
        }

        // POST: api/AirportsApi
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Airport>> CreateAirport([FromBody] UpsertAirportRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var airport = new Airport
            {
                Code = request.Code.Trim().ToUpperInvariant(),
                Name = request.Name.Trim(),
                City = request.City.Trim(),
                Country = request.Country.Trim()
            };

            _context.Airports.Add(airport);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAirport), new { id = airport.Id }, airport);
        }

        // PUT: api/AirportsApi/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAirport(int id, [FromBody] UpsertAirportRequestDto request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var airport = await _context.Airports.FindAsync(id);
            if (airport == null)
                return NotFound();

            airport.Code = request.Code.Trim().ToUpperInvariant();
            airport.Name = request.Name.Trim();
            airport.City = request.City.Trim();
            airport.Country = request.Country.Trim();

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                var exists = await _context.Airports.AnyAsync(a => a.Id == id);
                if (!exists)
                    return NotFound();

                throw; // başka bir concurrency hatasıysa patlasın, görürüz
            }

            return NoContent();
        }

        // DELETE: api/AirportsApi/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAirport(int id)
        {
            var airport = await _context.Airports.FindAsync(id);
            if (airport == null)
                return NotFound();

            _context.Airports.Remove(airport);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
