using FlightReservation.Options;
using FlightReservation.Services.Auth;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace FlightReservation.Tests;

public class MemoryLoginAttemptServiceTests
{
    [Fact]
    public void RegisterFailure_LocksOutAfterThreshold()
    {
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var options = Options.Create(new AuthSecurityOptions
        {
            MaxFailedLoginAttempts = 3,
            LockoutMinutes = 10
        });
        var service = new MemoryLoginAttemptService(memoryCache, options);

        service.RegisterFailure("user@example.com:ip:customer");
        service.RegisterFailure("user@example.com:ip:customer");
        service.RegisterFailure("user@example.com:ip:customer");

        var lockoutUntil = service.GetLockoutUntil("user@example.com:ip:customer");

        Assert.NotNull(lockoutUntil);
        Assert.True(lockoutUntil > DateTimeOffset.UtcNow);
    }

    [Fact]
    public void Reset_ClearsLockoutState()
    {
        var memoryCache = new MemoryCache(new MemoryCacheOptions());
        var options = Options.Create(new AuthSecurityOptions
        {
            MaxFailedLoginAttempts = 1,
            LockoutMinutes = 10
        });
        var service = new MemoryLoginAttemptService(memoryCache, options);

        service.RegisterFailure("user@example.com:ip:customer");
        service.Reset("user@example.com:ip:customer");

        var lockoutUntil = service.GetLockoutUntil("user@example.com:ip:customer");

        Assert.Null(lockoutUntil);
    }
}
