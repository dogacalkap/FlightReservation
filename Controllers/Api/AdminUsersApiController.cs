using FlightReservation.Data;
using FlightReservation.Dtos.Users;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    public class AdminUsersApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminUsersApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ================= GET =================
        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // ================= POST =================
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // ================= PUT =================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.FullName = dto.FullName;
            user.Email = dto.Email;

            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // ================= DELETE =================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            var tickets = await _context.Tickets.Where(t => t.UserId == id).ToListAsync();
            var seats = await _context.SeatOccupations.Where(s => s.UserId == id).ToListAsync();
            var messages = await _context.ContactMessages.Where(m => m.Email == user.Email).ToListAsync();

            _context.SeatOccupations.RemoveRange(seats);
            _context.Tickets.RemoveRange(tickets);
            _context.ContactMessages.RemoveRange(messages);
            _context.Users.Remove(user);

            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
