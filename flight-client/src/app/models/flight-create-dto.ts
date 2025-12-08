export interface FlightCreateDto {
  id: number;
  flightNumber: string;
  fromAirportId: number;
  toAirportId: number;
  departureTime: string;
  arrivalTime: string;   // <-- EKLENDİ
  price: number;
}
