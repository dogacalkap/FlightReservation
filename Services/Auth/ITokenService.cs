using FlightReservation.Dtos.Auth;
using FlightReservation.Models;

namespace FlightReservation.Services.Auth;

public interface ITokenService
{
    AuthResponseDto CreateToken(User user);
}
