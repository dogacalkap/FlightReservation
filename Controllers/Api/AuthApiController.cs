using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ------------------------------------------------------
        // REGISTER
        // ------------------------------------------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.Password))
                return BadRequest("Email and password cannot be empty.");

            if (user.Password.Length < 6)
                return BadRequest(new { error = "Şifre en az 6 karakter olmalıdır." });

            if (string.IsNullOrWhiteSpace(user.TCKN) || user.TCKN.Length != 11)
                return BadRequest(new { error = "TCKN 11 haneli olmalıdır." });

            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("This email is already registered.");

            // Şifreyi hashle
            user.Password = HashPassword(user.Password);

            user.IsAdmin = false; // kayıt olan herkes müşteri
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful.", user });
        }

        // ------------------------------------------------------
        // LOGIN
        // ------------------------------------------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email cannot be empty.");

            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Password cannot be empty.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

            if (user == null || user.IsAdmin)
                return Unauthorized("Email not found.");

            var hashedInput = HashPassword(dto.Password);

            if (user.Password != hashedInput)
                return Unauthorized("Incorrect password.");

            return Ok(new { 
            userId = user.Id,
            email = user.Email,
            fullName = user.FullName
            });

        }

        // ------------------------------------------------------
        // STEP 1 — VERIFY EMAIL + TCKN FOR RESET PASSWORD
        // ------------------------------------------------------
        [HttpPost("reset-password/check")]
        public async Task<IActionResult> ResetPasswordCheck([FromBody] ResetPasswordCheckDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.TCKN))
                return BadRequest("Email and TCKN cannot be empty.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.TCKN == dto.TCKN);

            if (user == null)
                return Unauthorized("Email or TCKN is incorrect.");

            return Ok(new { message = "Identity verified." });
        }

        // ------------------------------------------------------
        // STEP 2 — SAVE NEW PASSWORD
        // ------------------------------------------------------
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.TCKN))
                return BadRequest("Email and TCKN cannot be empty.");

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest("New password cannot be empty.");

            if (dto.NewPassword.Length < 6)
                return BadRequest(new { error = "Yeni şifre en az 6 karakter olmalıdır." });

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.TCKN == dto.TCKN);

            if (user == null)
                return Unauthorized("Email or TCKN is incorrect.");

            user.Password = HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password has been updated successfully." });
        }

        private static string HashPassword(string password)
        {
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

    }

    // DTOs
    public class LoginDto
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class ResetPasswordCheckDto
    {
        public string Email { get; set; } = "";
        public string TCKN { get; set; } = "";
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = "";
        public string TCKN { get; set; } = "";
        public string NewPassword { get; set; } = "";
    }
}
