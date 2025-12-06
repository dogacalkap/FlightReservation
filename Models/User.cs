using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required]
        public string FullName { get; set; } = "";

        [Required]
        public string TCKN { get; set; } = "";

        [Required]
        [EmailAddress(ErrorMessage = "Geçerli bir email girin.")]
        public string Email { get; set; } = "";

        [Required]
        [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
        public string Password { get; set; } = "";

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
