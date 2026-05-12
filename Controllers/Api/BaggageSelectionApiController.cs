using FlightReservation.Data;
using FlightReservation.Dtos.Baggage;
using FlightReservation.Models;
using FlightReservation.Services.Pricing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaggageSelectionsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPricingService _pricingService;

        public BaggageSelectionsApiController(ApplicationDbContext context, IPricingService pricingService)
        {
            _context = context;
            _pricingService = pricingService;
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> SaveBaggage([FromBody] CreateBaggageSelectionRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var flightExists = await _context.Flights.AnyAsync(f => f.Id == request.FlightId);
            if (!flightExists)
                return BadRequest(new { message = "Flight not found." });

            var bag = new BaggageSelection
            {
                UserId = userId,
                FlightId = request.FlightId,
                BaggageCount = request.BaggageCount,
                Price = _pricingService.CalculateBaggagePrice(request.BaggageCount),
                CreatedAt = DateTime.UtcNow
            };

            _context.BaggageSelections.Add(bag);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Baggage saved.", bag.Id });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyBaggageSelections()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var items = await _context.BaggageSelections
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(items);
        }
    }
}
