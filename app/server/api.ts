import "server-only";

import { DateTime } from "luxon";
import {
  getAvailabilityCalendar as getAvailabilityCalendarData,
  getReservationById,
  getVehicleById,
  getVehicles,
} from "./data_helpers";
import type { Quote, SearchVehicleInput } from "./types";

const DEFAULT_AVAILABILITY_DAYS = 90;
const MAX_AVAILABILITY_DAYS = 180;

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

const parseSearchTimeRange = (pickup?: string, dropoff?: string) => {
  if (!pickup || !dropoff) {
    return undefined;
  }

  const start = DateTime.fromISO(pickup);
  const end = DateTime.fromISO(dropoff);

  if (!start.isValid || !end.isValid || end <= start) {
    return undefined;
  }

  return { start, end };
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

async function searchVehicles(input: SearchVehicleInput = {}) {
  const timeRange = parseSearchTimeRange(input.pickup, input.dropoff);

  return {
    vehicles: await getVehicles({
      startTime: timeRange?.start.toJSDate(),
      endTime: timeRange?.end.toJSDate(),
      passengers: input.passengers,
      classification: input.classification,
      maxHourlyRateCents: input.maxHourlyRateCents,
    }),
  };
}

async function getAvailabilityCalendar(
  input: {
    startDate?: string;
    days?: number;
    passengers?: number;
    classification?: SearchVehicleInput["classification"];
    maxHourlyRateCents?: number;
  } = {},
) {
  const requestedStart = input.startDate
    ? DateTime.fromISO(input.startDate)
    : undefined;
  const startDate =
    requestedStart?.isValid === true
      ? requestedStart.startOf("day")
      : DateTime.local().startOf("day");
  const days = Math.min(
    Math.max(input.days ?? DEFAULT_AVAILABILITY_DAYS, 1),
    MAX_AVAILABILITY_DAYS,
  );

  return getAvailabilityCalendarData({
    startDate: startDate.toJSDate(),
    days,
    filters: {
      passengers: input.passengers,
      classification: input.classification,
      maxHourlyRateCents: input.maxHourlyRateCents,
    },
  });
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
  getAvailabilityCalendar,
  getVehicle,
  getReservation,
  getQuote,
};
