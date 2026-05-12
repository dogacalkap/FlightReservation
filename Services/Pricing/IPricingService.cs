namespace FlightReservation.Services.Pricing;

public interface IPricingService
{
    decimal CalculateSeatPrice(string seatNumber);
    decimal CalculateBaggagePrice(int baggageCount);
    decimal CalculateExtraAdjustment(string extraCode, decimal baseFlightTotal, decimal baggagePrice);
}
