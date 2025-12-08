export interface Flight {
  id: number;
  flightNumber: string;

  fromAirportId: number;
  fromAirportCode: string;
  fromAirportName: string;
  fromAirportCity: string;

  toAirportId: number;
  toAirportCode: string;
  toAirportName: string;
  toAirportCity: string;

  departureTime: string;
  arrivalTime: string;
  price: number;
}
