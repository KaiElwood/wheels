"use client";

import {
  getReviewRange,
  SearchFilters,
} from "@/components/search/SearchFilters";
import { VehicleList } from "@/components/search/VehicleList.tsx";
import { ErrorFallback } from "@/components/shared/ErrorFallback";
import type {
  AvailabilityDay,
  SearchFilterState,
  Vehicle,
} from "@/server/types";
import { ErrorBoundary } from "react-error-boundary";

export function SearchPage({
  availability,
  filters,
  vehicles,
}: {
  availability: AvailabilityDay[];
  filters: SearchFilterState;
  vehicles: Vehicle[];
}) {
  const reviewRange = getReviewRange(filters);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Kaizen Wheels
            </p>
            <div className="max-w-2xl space-y-2">
              <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
                Find your next ride
              </h1>
              <p className="text-base leading-7 text-muted-foreground">
                Compare available vehicles by trip needs, comfort, and hourly
                rate.
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
            <span className="font-semibold text-foreground">Hourly</span>{" "}
            rentals
          </div>
        </header>

        <SearchFilters availability={availability} filters={filters} />

        <section className="space-y-4" aria-labelledby="available-vehicles">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2
                id="available-vehicles"
                className="text-xl font-semibold text-foreground"
              >
                Available vehicles
              </h2>
              <p className="text-sm text-muted-foreground">
                {vehicles.length === 1
                  ? "1 vehicle matches your filters"
                  : `${vehicles.length} vehicles match your filters`}
              </p>
            </div>
          </div>

          <ErrorBoundary
            fallback={<ErrorFallback message="Failed to load vehicles" />}
          >
            <VehicleList reviewRange={reviewRange} vehicles={vehicles} />
          </ErrorBoundary>
        </section>
      </div>
    </main>
  );
}
