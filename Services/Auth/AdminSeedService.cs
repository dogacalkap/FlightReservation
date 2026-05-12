using FlightReservation.Data;
using FlightReservation.Models;
using FlightReservation.Options;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace FlightReservation.Services.Auth;

public class AdminSeedService
{
    private readonly ApplicationDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly AdminSeedOptions _options;

    public AdminSeedService(
        ApplicationDbContext context,
        IPasswordHasher<User> passwordHasher,
        IOptions<AdminSeedOptions> options)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _options = options.Value;
    }

    public async Task SeedAsync()
    {
        if (!_options.Enabled)
        {
            return;
        }

        var email = _options.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(_options.Password))
        {
            return;
        }

        var existingAdmin = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (existingAdmin is not null)
        {
            existingAdmin.IsAdmin = true;
            existingAdmin.FullName = string.IsNullOrWhiteSpace(existingAdmin.FullName)
                ? _options.FullName
                : existingAdmin.FullName;
            existingAdmin.TCKN = string.IsNullOrWhiteSpace(existingAdmin.TCKN)
                ? _options.Tckn
                : existingAdmin.TCKN;
            existingAdmin.Password = _passwordHasher.HashPassword(existingAdmin, _options.Password);

            await _context.SaveChangesAsync();
            return;
        }

        var admin = new User
        {
            FullName = _options.FullName,
            TCKN = _options.Tckn,
            Email = email,
            IsAdmin = true,
            CreatedAt = DateTime.UtcNow
        };

        admin.Password = _passwordHasher.HashPassword(admin, _options.Password);

        _context.Users.Add(admin);
        await _context.SaveChangesAsync();
    }
}
