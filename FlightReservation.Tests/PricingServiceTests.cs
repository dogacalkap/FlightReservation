using FlightReservation.Services.Pricing;

namespace FlightReservation.Tests;

public class PricingServiceTests
{
    private readonly PricingService _service = new();

    [Theory]
    [InlineData("1A", 200)]
    [InlineData("10C", 100)]
    [InlineData("20F", 0)]
    public void CalculateSeatPrice_ReturnsExpectedPrice(string seatNumber, decimal expectedPrice)
    {
        var result = _service.CalculateSeatPrice(seatNumber);

        Assert.Equal(expectedPrice, result);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(1, 299)]
    [InlineData(2, 598)]
    public void CalculateBaggagePrice_ReturnsExpectedPrice(int baggageCount, decimal expectedPrice)
    {
        var result = _service.CalculateBaggagePrice(baggageCount);

        Assert.Equal(expectedPrice, result);
    }

    [Theory]
    [InlineData("DISC10", 1000, 299, -100)]
    [InlineData("BAG50", 1000, 598, -299)]
    [InlineData("MEAL", 1000, 299, 49)]
    public void CalculateExtraAdjustment_ReturnsExpectedAdjustment(string code, decimal baseTotal, decimal baggagePrice, decimal expectedAdjustment)
    {
        var result = _service.CalculateExtraAdjustment(code, baseTotal, baggagePrice);

        Assert.Equal(expectedAdjustment, result);
    }
}
