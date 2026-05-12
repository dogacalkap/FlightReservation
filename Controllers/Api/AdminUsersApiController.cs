using FlightReservation.Data;
using FlightReservation.Dtos.Users;
using FlightReservation.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api.Admin
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminUsersApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AdminUsersApiController(ApplicationDbContext context, IPasswordHasher<User> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
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
                    Tckn = u.TCKN,
                    u.Email,
                    u.IsAdmin,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // ================= POST =================
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            if (await _context.Users.AnyAsync(u => u.Email == normalizedEmail))
                return Conflict(new { message = "This email is already in use." });

            var user = new User
            {
                FullName = dto.FullName.Trim(),
                TCKN = dto.Tckn.Trim(),
                Email = normalizedEmail,
                IsAdmin = dto.IsAdmin,
                CreatedAt = DateTime.UtcNow
            };
            user.Password = _passwordHasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        // ================= PUT =================
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();
            var emailInUse = await _context.Users.AnyAsync(u => u.Id != id && u.Email == normalizedEmail);
            if (emailInUse)
                return Conflict(new { message = "This email is already in use." });

            user.FullName = dto.FullName.Trim();
            user.TCKN = dto.Tckn.Trim();
            user.Email = normalizedEmail;
            user.IsAdmin = dto.IsAdmin;

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
