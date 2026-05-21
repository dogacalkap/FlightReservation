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

            var calculatedPrice = _pricingService.CalculateBaggagePrice(request.BaggageCount);
            var bag = await _context.BaggageSelections
                .SingleOrDefaultAsync(x => x.UserId == userId && x.FlightId == request.FlightId);

            var isNewRecord = bag is null;

            if (isNewRecord)
            {
                bag = new BaggageSelection
                {
                    UserId = userId,
                    FlightId = request.FlightId
                };
                _context.BaggageSelections.Add(bag);
            }

            bag!.BaggageCount = request.BaggageCount;
            bag.Price = calculatedPrice;
            bag.CreatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = isNewRecord ? "Baggage saved." : "Baggage updated.",
                bag.Id,
                bag.BaggageCount,
                bag.Price
            });
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
