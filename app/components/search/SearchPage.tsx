"use client";

import { VehicleList } from "@/components/search/VehicleList.tsx";
import { ErrorFallback } from "@/components/shared/ErrorFallback";
import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import {
  CalendarDays,
  CarFront,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import type { Vehicle } from "@/server/types";

function FieldLabel({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-primary" />
      {children}
    </Label>
  );
}

function SearchFilters() {
  return (
    <Card className="p-4 shadow-sm sm:p-5">
      <form
        className="grid gap-4 lg:grid-cols-[1.15fr_1.15fr_.8fr_.9fr_.9fr_auto] lg:items-end"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="space-y-2">
          <FieldLabel icon={CalendarDays}>Pickup</FieldLabel>
          <Input type="datetime-local" aria-label="Pickup date and time" />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={CalendarDays}>Dropoff</FieldLabel>
          <Input type="datetime-local" aria-label="Dropoff date and time" />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={Users}>Passengers</FieldLabel>
          <Select defaultValue="any">
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="2">1-2</SelectItem>
              <SelectItem value="5">3-5</SelectItem>
              <SelectItem value="7">6+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel icon={CarFront}>Class</FieldLabel>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
              <SelectItem value="minivan">Minivan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel icon={SlidersHorizontal}>Price</FieldLabel>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="under-50">Under $50/hr</SelectItem>
              <SelectItem value="under-75">Under $75/hr</SelectItem>
              <SelectItem value="under-125">Under $125/hr</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="h-10 gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </form>
    </Card>
  );
}

export function SearchPage({ vehicles }: { vehicles: Vehicle[] }) {
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

        <SearchFilters />

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
                Sorted by recommended value
              </p>
            </div>
          </div>

          <ErrorBoundary
            fallback={<ErrorFallback message="Failed to load vehicles" />}
          >
            <VehicleList vehicles={vehicles} />
          </ErrorBoundary>
        </section>
      </div>
    </main>
  );
}
