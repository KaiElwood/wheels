"use client";

import type { Vehicle } from "@/server/types";
import { useBase64Image } from "@/util/useBase64Image";
import { Car, DoorOpen, Users } from "lucide-react";
import { Card } from "../shared/ui/card";

export interface VehicleDetailsProps {
  vehicle: Vehicle;
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  const imgData = useBase64Image(vehicle.thumbnail_url);
  const specs = [
    { label: "Year", value: vehicle.year, icon: Car },
    { label: "Seats", value: vehicle.max_passengers, icon: Users },
    { label: "Class", value: vehicle.classification, icon: Car },
    { label: "Doors", value: vehicle.doors, icon: DoorOpen },
  ];

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="aspect-[4/3] bg-muted md:aspect-auto">
          {imgData ? (
            <img
              src={imgData}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-muted" />
          )}
        </div>
        <div className="min-w-0 space-y-6 p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">
              {vehicle.classification}
            </p>
            <h2 className="break-words text-2xl font-semibold text-foreground">
              {vehicle.make} {vehicle.model}
            </h2>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {specs.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="min-w-0 rounded-lg border bg-background px-3 py-3"
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
        </div>
      </div>
    </Card>
  );
}
