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

export type PriceFilter = "all" | "under-50" | "under-75" | "under-125";

export type VehicleClassFilter = Classification | "all";

export type PassengerFilter = "any" | "2" | "5" | "7";

export interface SearchFilterState {
  pickup: string;
  dropoff: string;
  passengers: PassengerFilter;
  class: VehicleClassFilter;
  price: PriceFilter;
}

export interface SearchVehicleInput {
  pickup?: string;
  dropoff?: string;
  passengers?: number;
  classification?: Classification;
  maxHourlyRateCents?: number;
}

export type AvailabilityStatus = "available" | "unavailable";

export interface AvailabilityDay {
  date: string;
  availableVehicleCount: number;
  totalVehicleCount: number;
  status: AvailabilityStatus;
}
