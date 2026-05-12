using FlightReservation.Options;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace FlightReservation.Services.Auth;

public class MemoryLoginAttemptService : ILoginAttemptService
{
    private readonly IMemoryCache _cache;
    private readonly AuthSecurityOptions _options;

    public MemoryLoginAttemptService(IMemoryCache cache, IOptions<AuthSecurityOptions> options)
    {
        _cache = cache;
        _options = options.Value;
    }

    public DateTimeOffset? GetLockoutUntil(string key)
    {
        return _cache.TryGetValue<LoginAttemptState>(GetCacheKey(key), out var state) && state?.LockoutUntil is not null
            ? state.LockoutUntil
            : null;
    }

    public void RegisterFailure(string key)
    {
        var cacheKey = GetCacheKey(key);
        var state = _cache.Get<LoginAttemptState>(cacheKey) ?? new LoginAttemptState();
        state.FailedCount++;

        if (state.FailedCount >= _options.MaxFailedLoginAttempts)
        {
            state.LockoutUntil = DateTimeOffset.UtcNow.AddMinutes(_options.LockoutMinutes);
            state.FailedCount = 0;
        }

        _cache.Set(cacheKey, state, TimeSpan.FromMinutes(_options.LockoutMinutes + 5));
    }

    public void Reset(string key)
    {
        _cache.Remove(GetCacheKey(key));
    }

    private static string GetCacheKey(string key) => $"login-attempt:{key}";

    private sealed class LoginAttemptState
    {
        public int FailedCount { get; set; }
        public DateTimeOffset? LockoutUntil { get; set; }
    }
}
