import "server-only";

import { DateTime } from "luxon";
import type { AppliedDiscount, DiscountType, Quote } from "./types";

const HOLIDAY_DISCOUNT_PERCENT = 17;
const LONG_RENTAL_THRESHOLD_HOURS = 72;
const LONG_RENTAL_HOURLY_DISCOUNT_CENTS = 1000;

const HOLIDAYS = [
  { month: 1, day: 21 },
  { month: 2, day: 12 },
  { month: 3, day: 4 },
  { month: 5, day: 2 },
  { month: 6, day: 16 },
  { month: 7, day: 26 },
  { month: 8, day: 3 },
  { month: 9, day: 1 },
  { month: 11, day: 5 },
  { month: 12, day: 18 },
];

interface DiscountCandidate {
  type: DiscountType;
  label: string;
  badgeLabel: string;
  totalPriceCents: number;
}

function isHoliday(date: DateTime) {
  return HOLIDAYS.some(
    (holiday) => holiday.month === date.month && holiday.day === date.day,
  );
}

function includesInteriorHoliday(start: DateTime, end: DateTime) {
  if (isHoliday(start) || isHoliday(end)) {
    return false;
  }

  const startDay = start.startOf("day");
  const endDay = end.startOf("day");

  for (let year = start.year; year <= end.year; year += 1) {
    const hasInteriorHoliday = HOLIDAYS.some((holiday) => {
      const holidayDate = DateTime.local(year, holiday.month, holiday.day);

      return holidayDate > startDay && holidayDate < endDay;
    });

    if (hasInteriorHoliday) {
      return true;
    }
  }

  return false;
}

function toAppliedDiscount(
  candidate: DiscountCandidate,
  baseTotalPriceCents: number,
): AppliedDiscount {
  return {
    type: candidate.type,
    label: candidate.label,
    badgeLabel: candidate.badgeLabel,
    amountOffCents: Math.max(
      Math.round(baseTotalPriceCents - candidate.totalPriceCents),
      0,
    ),
  };
}

export function calculateQuote(
  start: DateTime,
  end: DateTime,
  hourlyRateCents: number,
): Quote {
  const durationInHours = end.diff(start, "hours").hours || 0;
  const baseTotalPriceCents = Math.round(hourlyRateCents * durationInHours);
  const candidates: DiscountCandidate[] = [];

  if (includesInteriorHoliday(start, end)) {
    candidates.push({
      type: "holiday",
      label: "Holiday discount",
      badgeLabel: `${HOLIDAY_DISCOUNT_PERCENT}% off`,
      totalPriceCents: Math.round(
        baseTotalPriceCents * (1 - HOLIDAY_DISCOUNT_PERCENT / 100),
      ),
    });
  }

  if (durationInHours > LONG_RENTAL_THRESHOLD_HOURS) {
    const effectiveHourlyRateCents = Math.max(
      hourlyRateCents - LONG_RENTAL_HOURLY_DISCOUNT_CENTS,
      0,
    );

    candidates.push({
      type: "long_rental",
      label: "Long trip discount",
      badgeLabel: "$10/hr off",
      totalPriceCents: Math.round(effectiveHourlyRateCents * durationInHours),
    });
  }

  const bestCandidate = candidates.sort(
    (first, second) => first.totalPriceCents - second.totalPriceCents,
  )[0];
  const totalPriceCents =
    bestCandidate?.totalPriceCents ?? baseTotalPriceCents;
  const effectiveHourlyRateCents =
    durationInHours > 0
      ? Math.round(totalPriceCents / durationInHours)
      : hourlyRateCents;

  return {
    baseTotalPriceCents,
    totalPriceCents,
    hourlyRateCents,
    effectiveHourlyRateCents,
    durationInHours,
    discount: bestCandidate
      ? toAppliedDiscount(bestCandidate, baseTotalPriceCents)
      : undefined,
  };
}
