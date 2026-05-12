using FlightReservation.Data;
using FlightReservation.Dtos.Rewards;
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
    public class ExtraRewardsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPricingService _pricingService;

        public ExtraRewardsApiController(ApplicationDbContext context, IPricingService pricingService)
        {
            _context = context;
            _pricingService = pricingService;
        }

        // POST → Save reward for a reservation
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> SaveReward([FromBody] CreateExtraRewardRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var flight = await _context.Flights.FindAsync(request.FlightId);
            if (flight == null)
                return BadRequest(new { message = "Flight not found." });

            var normalizedCode = request.RewardText.Trim().ToUpperInvariant();
            var discountAmount = _pricingService.CalculateExtraAdjustment(normalizedCode, flight.Price, 0m);

            var reward = new ExtraReward
            {
                UserId = userId,
                FlightId = request.FlightId,
                RewardText = normalizedCode,
                DiscountAmount = discountAmount,
                EarnedAt = DateTime.UtcNow
            };

            _context.ExtraRewards.Add(reward);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reward saved.", reward.Id });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMyReward()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var reward = await _context.ExtraRewards
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.Id)
                .FirstOrDefaultAsync();

            return Ok(reward);
        }
    }
}
