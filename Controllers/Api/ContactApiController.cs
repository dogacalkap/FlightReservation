using FlightReservation.Data;
using FlightReservation.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlightReservation.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ContactApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        // 🟢 MESAJ GÖNDERME (CLIENT)
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ContactMessage dto)
        {
            dto.CreatedAt = DateTime.UtcNow;

            _context.ContactMessages.Add(dto);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mesajınız başarıyla gönderildi." });
        }

        // 🟠 TÜM MESAJLARI GETİRME (ADMIN)
        [HttpGet]
        public async Task<IActionResult> GetMessages()
        {
            var list = await _context.ContactMessages
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }
    }
}
