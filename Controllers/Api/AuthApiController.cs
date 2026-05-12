using FlightReservation.Data;
using FlightReservation.Dtos.Auth;
using FlightReservation.Models;
using FlightReservation.Services.Auth;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableRateLimiting("auth")]
    public class AuthApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuthService _authService;

        public AuthApiController(
            ApplicationDbContext context,
            IAuthService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var result = await _authService.RegisterAsync(request, HttpContext.RequestAborted);
            return StatusCode(result.StatusCode, result.Response);
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var result = await _authService.LoginAsync(request, requireAdmin: false, HttpContext.Connection.RemoteIpAddress?.ToString(), HttpContext.RequestAborted);
            return StatusCode(result.StatusCode, result.Response);
        }

        [HttpPost("admin/login")]
        public async Task<ActionResult<AuthResponseDto>> AdminLogin([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var result = await _authService.LoginAsync(request, requireAdmin: true, HttpContext.Connection.RemoteIpAddress?.ToString(), HttpContext.RequestAborted);
            return StatusCode(result.StatusCode, result.Response);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<AuthUserDto>> Me()
        {
            var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdValue, out var userId))
                return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return Unauthorized();

            return Ok(ToUserDto(user));
        }

        [HttpPost("reset-password/request")]
        public async Task<ActionResult<RequestPasswordResetResponseDto>> RequestPasswordReset([FromBody] RequestPasswordResetRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var response = await _authService.RequestPasswordResetAsync(
                request,
                HttpContext.Connection.RemoteIpAddress?.ToString(),
                Request.Headers.UserAgent.ToString(),
                HttpContext.RequestAborted);

            return Ok(response);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] CompletePasswordResetRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var result = await _authService.CompletePasswordResetAsync(request, HttpContext.RequestAborted);
            return StatusCode(result.StatusCode, result.Response);
        }

        private static AuthUserDto ToUserDto(User user)
        {
            return new AuthUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Tckn = user.TCKN,
                Email = user.Email,
                Role = user.IsAdmin ? "Admin" : "Customer"
            };
        }
    }
}
