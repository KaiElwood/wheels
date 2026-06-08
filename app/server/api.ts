import "server-only";

import { DateTime } from "luxon";
import {
  getReservationById,
  getVehicleById,
  getVehicles,
} from "./data_helpers";
import type { Quote } from "./types";

const parseAndValidateTimeRange = (startTime: string, endTime: string) => {
  const start = DateTime.fromISO(startTime);
  const end = DateTime.fromISO(endTime);

  if (
    start.toString() === "Invalid Date" ||
    end.toString() === "Invalid Date"
  ) {
    throw new Error(
      "BAD REQUEST: Invalid date format. Please use ISO 8601 format.",
    );
  }

  if (end <= start) {
    throw new Error("BAD REQUEST: end_time must be after start_time");
  }
  return { start, end };
};

const calculateTotalPrice = (
  start: DateTime,
  end: DateTime,
  hourlyRateCents: number,
): Quote => {
  const durationInHours = end.diff(start, "hours").hours || 0;

  return {
    totalPriceCents: hourlyRateCents * durationInHours,
    hourlyRateCents,
    durationInHours,
  };
};

const validateReservationTimeRange = (input: {
  vehicleId: string;
  startTime: string;
  endTime: string;
}) => {
  const { vehicleId, startTime, endTime } = input;
  const { start, end } = parseAndValidateTimeRange(startTime, endTime);

  return { vehicleId, start, end };
};

async function validateReservationAndGetVehicle(input: {
  vehicleId: string;
  startTime: string;
  endTime: string;
}) {
  const { vehicleId, start, end } = validateReservationTimeRange(input);
  const vehicle = await getVehicleById(vehicleId);

  if (!vehicle) {
    throw new Error("NOT_FOUND: Vehicle not found");
  }

  return { vehicle, start, end };
}

async function searchVehicles() {
  return {
    vehicles: await getVehicles(),
  };
}

async function getVehicle(id: string) {
  const vehicle = await getVehicleById(id);

  if (!vehicle) {
    throw new Error("NOT_FOUND: Vehicle not found");
  }

  return vehicle;
}

async function getReservation(id: string) {
  const reservation = await getReservationById(id);
  if (!reservation) {
    throw new Error("NOT_FOUND: Reservation not found");
  }
  return reservation;
}

async function getQuote(input: {
  vehicleId: string;
  startTime: string;
  endTime: string;
}) {
  const { vehicle, start, end } = await validateReservationAndGetVehicle(input);
  return calculateTotalPrice(start, end, vehicle.hourly_rate_cents);
}

export const API = {
  searchVehicles,
  getVehicle,
  getReservation,
  getQuote,
};
