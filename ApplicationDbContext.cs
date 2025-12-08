using Microsoft.EntityFrameworkCore;
using FlightReservation.Models;

namespace FlightReservation.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Airport> Airports { get; set; }
        public DbSet<Flight> Flights { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<PaymentCard> PaymentCards { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<SeatOccupation> SeatOccupations { get; set; }
        public DbSet<ExtraReward> ExtraRewards { get; set; }
        public DbSet<BaggageSelection> BaggageSelections { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<ContactMessage> ContactMessages { get; set; }
        public DbSet<Message> Messages { get; set; }





    }
}
