import "server-only";

import type {
  Reservation as PrismaReservation,
  Vehicle as PrismaVehicle,
} from "@prisma/client";
import { getDb } from "./db";
import type { Reservation, Vehicle } from "./types";

function toVehicleDto(vehicle: PrismaVehicle): Vehicle {
  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    doors: vehicle.doors,
    max_passengers: vehicle.maxPassengers,
    classification: vehicle.classification,
    thumbnail_url: vehicle.thumbnailUrl,
    hourly_rate_cents: vehicle.hourlyRateCents,
  };
}

function toReservationDto(reservation: PrismaReservation): Reservation {
  return {
    id: reservation.id,
    vehicle_id: reservation.vehicleId,
    start_time: reservation.startTime,
    end_time: reservation.endTime,
    total_price_cents: reservation.totalPriceCents,
  };
}

export const getVehicleById = async (id: string): Promise<Vehicle | null> => {
  const vehicle = await getDb().vehicle.findUnique({
    where: { id },
  });

  return vehicle ? toVehicleDto(vehicle) : null;
};

export const getReservationById = async (
  id: string,
): Promise<Reservation | null> => {
  const reservation = await getDb().reservation.findUnique({
    where: { id },
  });

  return reservation ? toReservationDto(reservation) : null;
};

export const getVehicles = async (): Promise<Vehicle[]> => {
  const vehicles = await getDb().vehicle.findMany({
    orderBy: { displayOrder: "asc" },
  });

  return vehicles.map(toVehicleDto);
};
