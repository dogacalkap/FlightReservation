using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/Airportsapi")] 
    [ApiController]
    public class AirportsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AirportsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Airportsapi
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Airport>>> GetAirports()
        {
            var airports = await _context.Airports.ToListAsync();
            return Ok(airports);
        }

        // GET: api/Airportsapi/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Airport>> GetAirport(int id)
        {
            var airport = await _context.Airports.FindAsync(id);

            if (airport == null)
                return NotFound();

            return Ok(airport);
        }

        // POST: api/Airportsapi
        [HttpPost]
        public async Task<ActionResult<Airport>> CreateAirport([FromBody] Airport airport)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Airports.Add(airport);
            await _context.SaveChangesAsync();

            // 201 Created + Location header
            return CreatedAtAction(nameof(GetAirport), new { id = airport.Id }, airport);
        }

        // PUT: api/Airportsapi/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAirport(int id, [FromBody] Airport airport)
        {
            if (id != airport.Id)
                return BadRequest("Id uyuşmuyor.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Entry(airport).State = EntityState.Modified;

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

            // 204 NoContent
            return NoContent();
        }

        // DELETE: api/Airportsapi/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAirport(int id)
        {
            var airport = await _context.Airports.FindAsync(id);
            if (airport == null)
                return NotFound();

            _context.Airports.Remove(airport);
            await _context.SaveChangesAsync();

            // 204 NoContent
            return NoContent();
        }
    }
}
