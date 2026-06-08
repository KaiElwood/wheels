"use client";

import { formatCents } from "@/lib/formatters";
import type { SearchFilterState, VehicleSearchResult } from "@/server/types";
import { useBase64Image } from "@/util/useBase64Image";
import { BadgePercent, Car, DoorOpen, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "../shared/ui/button";
import { Card } from "../shared/ui/card";

interface VehicleListItemProps {
  searchFilters: SearchFilterState;
  vehicle: VehicleSearchResult;
  reviewRange?: {
    start: string;
    end: string;
  };
}

export function VehicleListItem({
  reviewRange,
  searchFilters,
  vehicle,
}: VehicleListItemProps) {
  const imgData = useBase64Image(vehicle.thumbnail_url);
  const quote = vehicle.quote;
  const discount = quote?.discount;
  const specs = [
    { label: "Class", value: vehicle.classification, icon: Car },
    { label: "Seats", value: vehicle.max_passengers, icon: Users },
    { label: "Doors", value: vehicle.doors, icon: DoorOpen },
  ];
  const reviewHref = {
    pathname: "/review",
    query: {
      id: vehicle.id,
      pickup: searchFilters.pickup || undefined,
      dropoff: searchFilters.dropoff || undefined,
      passengers: searchFilters.passengers,
      class: searchFilters.class,
      price: searchFilters.price,
      ...(reviewRange
        ? {
            start: reviewRange.start,
            end: reviewRange.end,
          }
        : {}),
    },
  };

  return (
    <li className="h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted">
          {imgData ? (
            <img
              src={imgData}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-muted" />
          )}
          {discount ? (
            <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-primary shadow-sm">
              <BadgePercent className="h-3.5 w-3.5" />
              {discount.badgeLabel}
            </div>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-5 p-5">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{vehicle.year}</p>
            <h3 className="text-xl font-semibold text-foreground">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>

          <dl className="grid grid-cols-3 gap-2">
            {specs.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="min-w-0 rounded-lg border bg-background px-3 py-2"
              >
                <dt className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="min-w-0 truncate">{label}</span>
                </dt>
                <dd className="mt-1 min-w-0 break-words text-sm font-semibold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex items-end justify-between gap-4 border-t pt-4">
            <div className="min-w-0">
              <p className="text-2xl font-semibold text-foreground">
                {quote
                  ? formatCents(quote.totalPriceCents)
                  : formatCents(vehicle.hourly_rate_cents)}
                <span className="text-sm font-medium text-muted-foreground">
                  {quote ? "/trip" : "/hr"}
                </span>
              </p>
              {quote ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {discount ? (
                    <>
                      <span className="line-through">
                        {formatCents(quote.baseTotalPriceCents)}
                      </span>{" "}
                      <span className="font-medium text-primary">
                        save {formatCents(discount.amountOffCents)}
                      </span>
                    </>
                  ) : (
                    `${formatCents(vehicle.hourly_rate_cents)}/hr base`
                  )}
                </p>
              ) : null}
            </div>
            <Button asChild>
              <Link href={reviewHref}>Book now</Link>
            </Button>
          </div>
        </div>
      </Card>
    </li>
  );
}
