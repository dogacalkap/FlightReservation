using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using FlightReservation.Data;
using FlightReservation.Models;

namespace FlightReservation.Controllers
{
    public class FlightsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FlightsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Flights
        public async Task<IActionResult> Index()
        {
            var flights = await _context.Flights
                .Include(f => f.FromAirport)
                .Include(f => f.ToAirport)
                .ToListAsync();

            return View(flights);
        }

        // GET: /Flights/Create
        public async Task<IActionResult> Create()
        {
            // Havalimanlarını veritabanından çek
            var airports = await _context.Airports
                .Select(a => new { a.Id, a.Code })
                .ToListAsync();

            // Dropdown için listeyi ViewData'ya koy
            ViewData["Airports"] = new SelectList(airports, "Id", "Code");

            return View();
        }

        // POST: /Flights/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Flight flight)
        {
            if (!ModelState.IsValid)
            {
                // Hata olursa dropdown tekrar dolu gelsin diye
                var airports = await _context.Airports
                    .Select(a => new { a.Id, a.Code })
                    .ToListAsync();

                ViewData["Airports"] = new SelectList(airports, "Id", "Code");

                return View(flight);
            }

            // Her şey yolundaysa flight kaydını ekle
            _context.Add(flight);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
    }
}
