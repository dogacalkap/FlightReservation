using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminAuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminAuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var admin = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Password == dto.Password);

            if (admin == null || !admin.IsAdmin)
                return Unauthorized("Admin bilgileri yanlış.");

            return Ok(new
            {
                token = Guid.NewGuid().ToString(),
                admin = new
                {
                    admin.Id,
                    admin.FullName,
                    admin.Email
                }
            });
        }
    }
}
