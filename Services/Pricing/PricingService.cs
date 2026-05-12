namespace FlightReservation.Services.Pricing;

public class PricingService : IPricingService
{
    public decimal CalculateSeatPrice(string seatNumber)
    {
        var rowDigits = new string(seatNumber.TakeWhile(char.IsDigit).ToArray());
        if (!int.TryParse(rowDigits, out var row))
            return 0m;

        if (row <= 5) return 200m;
        if (row <= 15) return 100m;
        return 0m;
    }

    public decimal CalculateBaggagePrice(int baggageCount)
    {
        if (baggageCount <= 0)
            return 0m;

        return baggageCount * 299m;
    }

    public decimal CalculateExtraAdjustment(string extraCode, decimal baseFlightTotal, decimal baggagePrice)
    {
        return extraCode switch
        {
            "INSURANCE" => 99m,
            "MEAL" => 49m,
            "FAST_TRACK" => 129m,
            "DISC10" => -(baseFlightTotal * 0.10m),
            "DISC15" => -(baseFlightTotal * 0.15m),
            "FREE_BAG" => -299m,
            "BAG50" => -(baggagePrice * 0.5m),
            "FREE_TICKET" => 0m,
            "NONE" => 0m,
            _ => 0m
        };
    }
}
