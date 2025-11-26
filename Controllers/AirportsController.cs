using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FlightReservation.Data;
using FlightReservation.Models;

namespace FlightReservation.Controllers
{
    public class AirportsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AirportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: /Airports
        public async Task<IActionResult> Index()
        {
            var airports = await _context.Airports.ToListAsync();
            return View(airports);
        }

        // GET: /Airports/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: /Airports/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Airport airport)
        {
            if (!ModelState.IsValid)
            {
                return View(airport);
            }

            _context.Add(airport);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
    }
}
