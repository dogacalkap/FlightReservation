export interface Airport {
  id: number;
  name: string;
  city: string;
  code: string;      // IATA code
  latitude: number;
  longitude: number;
  country?: string;
}
