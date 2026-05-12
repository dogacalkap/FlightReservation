using FlightReservation.Dtos.Auth;

namespace FlightReservation.Services.Auth;

public class AuthResult
{
    public bool Succeeded { get; init; }
    public int StatusCode { get; init; }
    public object Response { get; init; } = new();

    public static AuthResult Success(AuthResponseDto response) =>
        new() { Succeeded = true, StatusCode = StatusCodes.Status200OK, Response = response };

    public static AuthResult Failure(int statusCode, object response) =>
        new() { Succeeded = false, StatusCode = statusCode, Response = response };
}
