export type Classification =
  | "Compact"
  | "SUV"
  | "Sports"
  | "Subcompact"
  | "Minivan"
  | "Luxury";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  doors: number;
  max_passengers: number;
  classification: Classification;
  thumbnail_url: string;
  hourly_rate_cents: number;
}

export interface Reservation {
  id: string;
  vehicle_id: string;
  start_time: Date;
  end_time: Date;
  total_price_cents: number;
}

export interface Quote {
  totalPriceCents: number;
  hourlyRateCents: number;
  durationInHours: number;
}
