namespace FlightReservation.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = "";
        public string TCKN { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = ""; // şimdilik hash yapmadan (isteğe bağlı ekleriz)

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
