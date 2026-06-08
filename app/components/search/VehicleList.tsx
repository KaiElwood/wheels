import type { SearchFilterState, VehicleSearchResult } from "@/server/types";
import { Card } from "../shared/ui/card";
import { VehicleListItem } from "./VehicleListItem";

interface VehicleListProps {
  searchFilters: SearchFilterState;
  vehicles: VehicleSearchResult[];
  reviewRange?: {
    start: string;
    end: string;
  };
}

export function VehicleList({
  reviewRange,
  searchFilters,
  vehicles,
}: VehicleListProps) {
  if (vehicles.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm font-medium text-muted-foreground">
          No vehicles found.
        </p>
      </Card>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleListItem
          key={vehicle.id}
          reviewRange={reviewRange}
          searchFilters={searchFilters}
          vehicle={vehicle}
        />
      ))}
    </ul>
  );
}
