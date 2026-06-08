import "server-only";

import type {
  Prisma,
  Reservation as PrismaReservation,
  Vehicle as PrismaVehicle,
} from "@prisma/client";
import { DateTime } from "luxon";
import { getDb } from "./db";
import type {
  AvailabilityDay,
  Classification,
  Reservation,
  Vehicle,
} from "./types";

interface VehicleQueryFilters {
  startTime?: Date;
  endTime?: Date;
  passengers?: number;
  classification?: Classification;
  maxHourlyRateCents?: number;
}

interface AvailabilityCalendarInput {
  startDate: Date;
  days: number;
  filters?: Omit<VehicleQueryFilters, "startTime" | "endTime">;
}

function getVehicleWhere(filters: VehicleQueryFilters = {}) {
  const where: Prisma.VehicleWhereInput = {};

  if (filters.passengers) {
    where.maxPassengers = { gte: filters.passengers };
  }

  if (filters.classification) {
    where.classification = filters.classification;
  }

  if (filters.maxHourlyRateCents) {
    where.hourlyRateCents = { lte: filters.maxHourlyRateCents };
  }

  if (filters.startTime && filters.endTime) {
    where.reservations = {
      none: {
        startTime: { lt: filters.endTime },
        endTime: { gt: filters.startTime },
      },
    };
  }

  return where;
}

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

export const getVehicles = async (
  filters: VehicleQueryFilters = {},
): Promise<Vehicle[]> => {
  const vehicles = await getDb().vehicle.findMany({
    where: getVehicleWhere(filters),
    orderBy: { displayOrder: "asc" },
  });

  return vehicles.map(toVehicleDto);
};

export const getAvailabilityCalendar = async ({
  startDate,
  days,
  filters = {},
}: AvailabilityCalendarInput): Promise<AvailabilityDay[]> => {
  const calendarStart = DateTime.fromJSDate(startDate).startOf("day");
  const calendarEnd = calendarStart.plus({ days });
  const db = getDb();
  const matchingVehicles = await db.vehicle.findMany({
    where: getVehicleWhere(filters),
    select: { id: true },
  });
  const matchingVehicleIds = matchingVehicles.map((vehicle) => vehicle.id);
  const totalVehicleCount = matchingVehicleIds.length;

  const reservations =
    totalVehicleCount === 0
      ? []
      : await db.reservation.findMany({
          where: {
            vehicleId: { in: matchingVehicleIds },
            startTime: { lt: calendarEnd.toJSDate() },
            endTime: { gt: calendarStart.toJSDate() },
          },
          select: {
            vehicleId: true,
            startTime: true,
            endTime: true,
          },
        });

  return Array.from({ length: days }, (_, index) => {
    const dayStart = calendarStart.plus({ days: index });
    const dayEnd = dayStart.plus({ days: 1 });
    const reservedVehicleIds = new Set<string>();

    reservations.forEach((reservation) => {
      const startsBeforeDayEnds =
        DateTime.fromJSDate(reservation.startTime) < dayEnd;
      const endsAfterDayStarts =
        DateTime.fromJSDate(reservation.endTime) > dayStart;

      if (startsBeforeDayEnds && endsAfterDayStarts) {
        reservedVehicleIds.add(reservation.vehicleId);
      }
    });

    const availableVehicleCount = Math.max(
      totalVehicleCount - reservedVehicleIds.size,
      0,
    );
    const status = availableVehicleCount > 0 ? "available" : "unavailable";

    return {
      date: dayStart.toISODate() ?? "",
      availableVehicleCount,
      totalVehicleCount,
      status,
    };
  });
};
