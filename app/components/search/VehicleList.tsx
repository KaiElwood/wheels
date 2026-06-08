import { API } from "@/server/api";
import { Card } from "../shared/ui/card";
import { VehicleListItem } from "./VehicleListItem";

export function VehicleList() {
  const searchResponse = API.searchVehicles();

  if (searchResponse.vehicles.length === 0) {
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
      {searchResponse.vehicles.map((vehicle) => (
        <VehicleListItem key={vehicle.id} vehicle={vehicle} />
      ))}
    </ul>
  );
}
