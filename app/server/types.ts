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
  baseTotalPriceCents: number;
  totalPriceCents: number;
  hourlyRateCents: number;
  effectiveHourlyRateCents: number;
  durationInHours: number;
  discount?: AppliedDiscount;
}

export type DiscountType = "holiday" | "long_rental";

export interface AppliedDiscount {
  type: DiscountType;
  label: string;
  badgeLabel: string;
  amountOffCents: number;
}

export interface VehicleSearchResult extends Vehicle {
  quote?: Quote;
}

export type AddOnPriceModel = "per_rental" | "per_day";

export interface AddOn {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  priceModel: AddOnPriceModel;
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
