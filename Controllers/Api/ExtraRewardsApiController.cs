using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExtraRewardsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExtraRewardsApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST → Save reward for a reservation
        [HttpPost]
        public async Task<IActionResult> SaveReward([FromBody] ExtraReward reward)
        {
            _context.ExtraRewards.Add(reward);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Reward saved.", reward });
        }

        // GET → Get reward by user
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserReward(int userId)
        {
            var reward = await _context.ExtraRewards
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.Id)
                .FirstOrDefaultAsync();

            return Ok(reward);
        }
    }
}
