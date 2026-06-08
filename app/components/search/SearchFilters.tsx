"use client";

import { Button } from "@/components/shared/ui/button";
import { Calendar } from "@/components/shared/ui/calendar";
import { Card } from "@/components/shared/ui/card";
import { Input } from "@/components/shared/ui/input";
import { Label } from "@/components/shared/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shared/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/ui/select";
import { cn } from "@/lib/classnames";
import type {
  AvailabilityDay,
  PassengerFilter,
  PriceFilter,
  SearchFilterState,
  VehicleClassFilter,
} from "@/server/types";
import { format } from "date-fns";
import {
  CalendarDays,
  CarFront,
  Clock3,
  Search,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const DEFAULT_TIME = "09:00";

const PASSENGER_OPTIONS: Array<{ value: PassengerFilter; label: string }> = [
  { value: "any", label: "Any" },
  { value: "2", label: "1-2" },
  { value: "5", label: "3-5" },
  { value: "7", label: "6+" },
];

const CLASS_OPTIONS: Array<{ value: VehicleClassFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "Compact", label: "Compact" },
  { value: "SUV", label: "SUV" },
  { value: "Sports", label: "Sports" },
  { value: "Subcompact", label: "Subcompact" },
  { value: "Minivan", label: "Minivan" },
  { value: "Luxury", label: "Luxury" },
];

const PRICE_OPTIONS: Array<{ value: PriceFilter; label: string }> = [
  { value: "all", label: "Any" },
  { value: "under-50", label: "Under $50/hr" },
  { value: "under-75", label: "Under $75/hr" },
  { value: "under-125", label: "Under $125/hr" },
];

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function parseLocalDateTime(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);

  if (!match) {
    return undefined;
  }

  const [, year, month, day, hour, minute] = match;
  const dateTime = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  if (Number.isNaN(dateTime.getTime())) {
    return undefined;
  }

  return {
    date: new Date(Number(year), Number(month) - 1, Number(day)),
    dateTime,
    time: `${hour}:${minute}`,
  };
}

function combineLocalDateTime(date: Date | undefined, time: string) {
  if (!date || !time) {
    return "";
  }

  return `${formatDateKey(date)}T${time}`;
}

export function getReviewRange(filters: SearchFilterState) {
  const pickup = parseLocalDateTime(filters.pickup);
  const dropoff = parseLocalDateTime(filters.dropoff);

  if (!pickup || !dropoff || dropoff.dateTime <= pickup.dateTime) {
    return undefined;
  }

  return {
    start: filters.pickup,
    end: filters.dropoff,
  };
}

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

function AvailabilityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        Available
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
        Unavailable
      </span>
    </div>
  );
}

function DatePickerField({
  label,
  date,
  time,
  availabilityByDate,
  unavailableDates,
  onDateChange,
  onTimeChange,
}: {
  label: string;
  date: Date | undefined;
  time: string;
  availabilityByDate: Map<string, AvailabilityDay>;
  unavailableDates: Date[];
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}) {
  const selectedAvailability = date
    ? availabilityByDate.get(formatDateKey(date))
    : undefined;

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[minmax(0,1fr)_6.75rem]">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 min-w-0 justify-start gap-2 px-3 font-normal"
          >
            <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
            <span
              className={cn(
                "min-w-0 truncate",
                !date && "text-muted-foreground",
              )}
            >
              {date ? format(date, "MMM d, yyyy") : "Select date"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={onDateChange}
            disabled={(day) =>
              availabilityByDate.get(formatDateKey(day))?.status ===
              "unavailable"
            }
            modifiers={{
              unavailable: unavailableDates,
            }}
            modifiersClassNames={{
              unavailable: "line-through",
            }}
          />
          <div className="border-t px-3 py-2 text-xs text-muted-foreground">
            {selectedAvailability
              ? selectedAvailability.status === "available"
                ? "Available"
                : "Unavailable"
              : "Availability not loaded"}
          </div>
        </PopoverContent>
      </Popover>
      <div className="relative">
        <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
        <Input
          aria-label={`${label} time`}
          className="pl-9"
          type="time"
          value={time}
          onChange={(event) => onTimeChange(event.target.value)}
        />
      </div>
    </div>
  );
}

export function SearchFilters({
  availability,
  filters,
}: {
  availability: AvailabilityDay[];
  filters: SearchFilterState;
}) {
  const initialPickup = parseLocalDateTime(filters.pickup);
  const initialDropoff = parseLocalDateTime(filters.dropoff);
  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    () => initialPickup?.date,
  );
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(
    () => initialDropoff?.date,
  );
  const [pickupTime, setPickupTime] = useState(
    () => initialPickup?.time ?? DEFAULT_TIME,
  );
  const [dropoffTime, setDropoffTime] = useState(
    () => initialDropoff?.time ?? DEFAULT_TIME,
  );
  const [passengers, setPassengers] = useState<PassengerFilter>(
    filters.passengers,
  );
  const [vehicleClass, setVehicleClass] = useState<VehicleClassFilter>(
    filters.class,
  );
  const [price, setPrice] = useState<PriceFilter>(filters.price);
  const availabilityByDate = useMemo(
    () => new Map(availability.map((day) => [day.date, day])),
    [availability],
  );
  const unavailableDates = useMemo(
    () =>
      availability
        .filter((day) => day.status === "unavailable")
        .map((day) => parseDateKey(day.date))
        .filter((date): date is Date => Boolean(date)),
    [availability],
  );
  const pickupValue = combineLocalDateTime(pickupDate, pickupTime);
  const dropoffValue = combineLocalDateTime(dropoffDate, dropoffTime);

  return (
    <Card className="p-4 shadow-sm sm:p-5">
      <form
        className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1.25fr)_minmax(8.5rem,.7fr)_minmax(9rem,.85fr)_minmax(10rem,.9fr)_auto] xl:items-end"
        method="get"
      >
        <input name="pickup" type="hidden" value={pickupValue} />
        <input name="dropoff" type="hidden" value={dropoffValue} />
        <input name="passengers" type="hidden" value={passengers} />
        <input name="class" type="hidden" value={vehicleClass} />
        <input name="price" type="hidden" value={price} />

        <div className="space-y-2">
          <FieldLabel icon={CalendarDays}>Pickup</FieldLabel>
          <DatePickerField
            label="Pickup"
            date={pickupDate}
            time={pickupTime}
            availabilityByDate={availabilityByDate}
            unavailableDates={unavailableDates}
            onDateChange={setPickupDate}
            onTimeChange={setPickupTime}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={CalendarDays}>Dropoff</FieldLabel>
          <DatePickerField
            label="Dropoff"
            date={dropoffDate}
            time={dropoffTime}
            availabilityByDate={availabilityByDate}
            unavailableDates={unavailableDates}
            onDateChange={setDropoffDate}
            onTimeChange={setDropoffTime}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel icon={Users}>Passengers</FieldLabel>
          <Select
            value={passengers}
            onValueChange={(value) => setPassengers(value as PassengerFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {PASSENGER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel icon={CarFront}>Class</FieldLabel>
          <Select
            value={vehicleClass}
            onValueChange={(value) =>
              setVehicleClass(value as VehicleClassFilter)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <FieldLabel icon={SlidersHorizontal}>Price</FieldLabel>
          <Select
            value={price}
            onValueChange={(value) => setPrice(value as PriceFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {PRICE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="h-10 gap-2 lg:self-end">
          <Search className="h-4 w-4" />
          Search
        </Button>
        <div className="lg:col-span-2 xl:col-span-6">
          <AvailabilityLegend />
        </div>
      </form>
    </Card>
  );
}
