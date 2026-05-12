using FlightReservation.Data;
using FlightReservation.Dtos.Contact;
using FlightReservation.Models;
using Microsoft.AspNetCore.Authorization;
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
        public async Task<IActionResult> SendMessage([FromBody] ContactMessageCreateRequestDto request)
        {
            if (!ModelState.IsValid)
                return ValidationProblem(ModelState);

            var message = new ContactMessage
            {
                FullName = request.FullName.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _context.ContactMessages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Mesajınız başarıyla gönderildi." });
        }

        // 🟠 TÜM MESAJLARI GETİRME (ADMIN)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMessages()
        {
            var list = await _context.ContactMessages
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }
    }
}
