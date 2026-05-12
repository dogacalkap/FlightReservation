using System.ComponentModel.DataAnnotations;

namespace FlightReservation.Dtos.Users
{
    public class CreateUserDto
    {
        [Required]
        [StringLength(150)]
        public string FullName { get; set; } = "";

        [Required]
        [StringLength(11, MinimumLength = 11)]
        [RegularExpression("^[0-9]{11}$")]
        public string Tckn { get; set; } = "";

        [Required]
        [EmailAddress]
        public string Email { get; set; } = "";

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = "";

        public bool IsAdmin { get; set; }
    }
}
