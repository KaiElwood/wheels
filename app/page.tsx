import { SearchPage } from "@/components/search/SearchPage";
import { API } from "@/server/api";
import type {
  Classification,
  PassengerFilter,
  PriceFilter,
  SearchFilterState,
  SearchVehicleInput,
  VehicleClassFilter,
} from "@/server/types";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const CLASSIFICATIONS: Classification[] = [
  "Compact",
  "SUV",
  "Sports",
  "Subcompact",
  "Minivan",
  "Luxury",
];

const PASSENGER_FILTERS: PassengerFilter[] = ["2", "5", "7"];
const PRICE_FILTERS: PriceFilter[] = [
  "all",
  "under-50",
  "under-75",
  "under-125",
];
const PRICE_LIMIT_CENTS: Record<Exclude<PriceFilter, "all">, number> = {
  "under-50": 5000,
  "under-75": 7500,
  "under-125": 12500,
};

function getParam(params: SearchParams, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function getSearchFilters(params: SearchParams): SearchFilterState {
  const passengerParam = getParam(params, "passengers");
  const classParam = getParam(params, "class");
  const priceParam = getParam(params, "price");

  return {
    pickup: getParam(params, "pickup") ?? "",
    dropoff: getParam(params, "dropoff") ?? "",
    passengers: PASSENGER_FILTERS.includes(passengerParam as PassengerFilter)
      ? (passengerParam as PassengerFilter)
      : "any",
    class: CLASSIFICATIONS.includes(classParam as Classification)
      ? (classParam as VehicleClassFilter)
      : "all",
    price: PRICE_FILTERS.includes(priceParam as PriceFilter)
      ? (priceParam as PriceFilter)
      : "all",
  };
}

function toSearchInput(filters: SearchFilterState): SearchVehicleInput {
  return {
    pickup: filters.pickup || undefined,
    dropoff: filters.dropoff || undefined,
    passengers:
      filters.passengers === "any" ? undefined : Number(filters.passengers),
    classification: filters.class === "all" ? undefined : filters.class,
    maxHourlyRateCents:
      filters.price === "all" ? undefined : PRICE_LIMIT_CENTS[filters.price],
  };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams> | SearchParams;
}) {
  const params = await searchParams;
  const filters = getSearchFilters(params);
  const [{ vehicles }, availability] = await Promise.all([
    API.searchVehicles(toSearchInput(filters)),
    API.getAvailabilityCalendar({
      startDate: filters.pickup || undefined,
    }),
  ]);

  return (
    <SearchPage
      availability={availability}
      filters={filters}
      vehicles={vehicles}
    />
  );
}
