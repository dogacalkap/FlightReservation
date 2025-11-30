using Microsoft.AspNetCore.Mvc;

namespace FlightAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            // Geçici kullanıcı doğrulama
            if (dto.Username == "admin" && dto.Password == "1234")
            {
                return Ok(new { token = "admintoken123" });
            }

            return Unauthorized(new { message = "Invalid credentials" });
        }
    }

    public class LoginDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
