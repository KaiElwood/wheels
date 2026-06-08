"use client";

import { VehicleDetails } from "@/components/review/VehicleDetails";
import { ErrorFallback } from "@/components/shared/ErrorFallback";
import { Button } from "@/components/shared/ui/button";
import { Card } from "@/components/shared/ui/card";
import { Checkbox } from "@/components/shared/ui/checkbox";
import { Label } from "@/components/shared/ui/label";
import { Separator } from "@/components/shared/ui/separator";
import { formatCents } from "@/lib/formatters";
import type { AddOn, Quote, Vehicle } from "@/server/types";
import { format, formatDuration, intervalToDuration } from "date-fns";
import {
  Baby,
  CalendarCheck,
  CarFront,
  Clock,
  Fuel,
  Map,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MiniPageLayout } from "../shared/MiniPageLayout";

type ReviewAddOn = AddOn & {
  icon: React.ComponentType<{ className?: string }>;
};

interface AddOnLineItem {
  id: string;
  name: string;
  description: string;
  totalPriceCents: number;
}

const ADD_ONS = [
  {
    id: "gps",
    name: "GPS Navigation",
    description: "Suction-mount GPS unit",
    priceCents: 500,
    priceModel: "per_rental",
    icon: Map,
  },
  {
    id: "child-seat",
    name: "Child seat",
    description: "Forward-facing booster",
    priceCents: 800,
    priceModel: "per_day",
    icon: Baby,
  },
  {
    id: "additional-driver",
    name: "Additional driver",
    description: "Allow a second registered driver",
    priceCents: 1200,
    priceModel: "per_day",
    icon: UserPlus,
  },
  {
    id: "prepaid-fuel",
    name: "Pre-paid fuel",
    description: "Return the car empty",
    priceCents: 4000,
    priceModel: "per_rental",
    icon: Fuel,
  },
  {
    id: "roadside",
    name: "Roadside assistance",
    description: "24/7 emergency support",
    priceCents: 400,
    priceModel: "per_day",
    icon: ShieldCheck,
  },
] satisfies ReviewAddOn[];

function getChargeableDays(durationInHours: number) {
  return Math.max(Math.ceil(durationInHours / 24), 1);
}

function getAddOnPriceLabel(addOn: AddOn) {
  return `${formatCents(addOn.priceCents)} ${
    addOn.priceModel === "per_day" ? "per day" : "per rental"
  }`;
}

function getAddOnLineItems(
  addOns: AddOn[],
  chargeableDays: number,
): AddOnLineItem[] {
  return addOns.map((addOn) => {
    const unitCount = addOn.priceModel === "per_day" ? chargeableDays : 1;

    return {
      id: addOn.id,
      name: addOn.name,
      description:
        addOn.priceModel === "per_day"
          ? `${formatCents(addOn.priceCents)}/day x ${chargeableDays} day${
              chargeableDays === 1 ? "" : "s"
            }`
          : "per rental",
      totalPriceCents: addOn.priceCents * unitCount,
    };
  });
}

function TimelinePoint({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 font-semibold text-foreground">{value}</dd>
      </div>
    </div>
  );
}

function Timeline({
  startDate,
  endDate,
  duration,
}: {
  startDate?: Date;
  endDate?: Date;
  duration?: string;
}) {
  return (
    <Card className="p-6">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Trip timeline
          </h3>
          <p className="text-sm text-muted-foreground">
            Pickup, rental period, and return details.
          </p>
        </div>
        <dl className="grid gap-5 md:grid-cols-3">
          <TimelinePoint
            icon={CalendarCheck}
            label="Pick-up"
            value={startDate ? format(startDate, "PPp") : "Select pickup time"}
          />
          <TimelinePoint
            icon={Clock}
            label="Rental period"
            value={duration || "Pending"}
          />
          <TimelinePoint
            icon={CarFront}
            label="Drop-off"
            value={endDate ? format(endDate, "PPp") : "Select drop-off time"}
          />
        </dl>
      </div>
    </Card>
  );
}

function AddOnsPanel({
  onToggleAddOn,
  selectedAddOnIds,
}: {
  onToggleAddOn: (id: string, checked: boolean) => void;
  selectedAddOnIds: string[];
}) {
  return (
    <Card className="p-6">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Add-ons</h3>
          <p className="text-sm text-muted-foreground">
            Choose extras for comfort, safety, and convenience.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ADD_ONS.map((addOn) => {
            const Icon = addOn.icon;

            return (
              <Label
                key={addOn.id}
                htmlFor={addOn.id}
                className="flex min-h-28 cursor-pointer gap-3 rounded-lg border bg-background p-4 transition-colors hover:bg-accent/50"
              >
                <Checkbox
                  id={addOn.id}
                  checked={selectedAddOnIds.includes(addOn.id)}
                  className="mt-1"
                  onCheckedChange={(checked) =>
                    onToggleAddOn(addOn.id, checked === true)
                  }
                />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Icon className="h-4 w-4 text-primary" />
                    {addOn.name}
                  </span>
                  <span className="text-sm font-normal leading-6 text-muted-foreground">
                    {addOn.description}
                  </span>
                  <span className="mt-auto text-sm font-semibold text-primary">
                    {getAddOnPriceLabel(addOn)}
                  </span>
                </span>
              </Label>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function PriceBreakdown({
  addOnLineItems,
  hourlyRateCents,
  duration,
  quote,
}: {
  addOnLineItems: AddOnLineItem[];
  hourlyRateCents: number;
  duration?: string;
  quote?: Quote;
}) {
  const addOnTotalPriceCents = addOnLineItems.reduce(
    (total, item) => total + item.totalPriceCents,
    0,
  );
  const totalPriceCents =
    quote?.totalPriceCents === undefined
      ? undefined
      : quote.totalPriceCents + addOnTotalPriceCents;

  return (
    <Card className="p-6 shadow-sm lg:sticky lg:top-8">
      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Price breakdown
          </h3>
          <p className="text-sm text-muted-foreground">
            Base rental before add-ons.
          </p>
        </div>

        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Hourly rate</dt>
            <dd className="font-medium text-foreground">
              {formatCents(hourlyRateCents)}/hr
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Duration</dt>
            <dd className="text-right font-medium text-foreground">
              {duration || "Pending"}
            </dd>
          </div>
          {quote ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Base rental</dt>
              <dd className="font-medium text-foreground">
                {formatCents(quote.baseTotalPriceCents)}
              </dd>
            </div>
          ) : null}
          {quote?.discount ? (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{quote.discount.label}</dt>
              <dd className="font-medium text-primary">
                -{formatCents(quote.discount.amountOffCents)}
              </dd>
            </div>
          ) : null}
          {addOnLineItems.length > 0 ? (
            addOnLineItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4"
              >
                <dt className="text-muted-foreground">
                  <span className="block">{item.name}</span>
                  <span className="text-xs">{item.description}</span>
                </dt>
                <dd className="font-medium text-foreground">
                  {formatCents(item.totalPriceCents)}
                </dd>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Add-ons</dt>
              <dd className="font-medium text-foreground">$0</dd>
            </div>
          )}
        </dl>

        <Separator />

        <div className="flex items-end justify-between gap-4">
          <p className="font-medium text-muted-foreground">Total</p>
          <p className="text-3xl font-semibold text-foreground">
            {totalPriceCents !== undefined
              ? formatCents(totalPriceCents)
              : "--"}
          </p>
        </div>

        <Button className="w-full" disabled={totalPriceCents === undefined}>
          Confirm reservation
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">Back to search</Link>
        </Button>
      </div>
    </Card>
  );
}

function Content({
  vehicle,
  start,
  end,
  quote,
}: {
  vehicle: Vehicle;
  start?: string;
  end?: string;
  quote?: Quote;
}) {
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const selectedAddOns = useMemo(
    () => ADD_ONS.filter((addOn) => selectedAddOnIds.includes(addOn.id)),
    [selectedAddOnIds],
  );
  const addOnLineItems = useMemo(
    () =>
      quote
        ? getAddOnLineItems(
            selectedAddOns,
            getChargeableDays(quote.durationInHours),
          )
        : [],
    [quote, selectedAddOns],
  );
  const handleToggleAddOn = (id: string, checked: boolean) => {
    setSelectedAddOnIds((currentIds) =>
      checked
        ? Array.from(new Set([...currentIds, id]))
        : currentIds.filter((currentId) => currentId !== id),
    );
  };

  if (!start || !end) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="space-y-6">
          <VehicleDetails vehicle={vehicle} />
          <Timeline />
          <AddOnsPanel
            onToggleAddOn={handleToggleAddOn}
            selectedAddOnIds={selectedAddOnIds}
          />
        </div>
        <PriceBreakdown
          addOnLineItems={addOnLineItems}
          hourlyRateCents={vehicle.hourly_rate_cents}
        />
      </div>
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  const formattedDuration = formatDuration(
    intervalToDuration({
      start: startDate,
      end: endDate,
    }),
    { delimiter: ", " },
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="space-y-6">
        <VehicleDetails vehicle={vehicle} />
        <Timeline
          startDate={startDate}
          endDate={endDate}
          duration={formattedDuration}
        />
        <AddOnsPanel
          onToggleAddOn={handleToggleAddOn}
          selectedAddOnIds={selectedAddOnIds}
        />
      </div>

      <PriceBreakdown
        addOnLineItems={addOnLineItems}
        hourlyRateCents={vehicle.hourly_rate_cents}
        duration={formattedDuration}
        quote={quote}
      />
    </div>
  );
}

export function ReviewPage({
  vehicle,
  start,
  end,
  quote,
}: {
  vehicle: Vehicle;
  start?: string;
  end?: string;
  quote?: Quote;
}) {
  return (
    <MiniPageLayout
      title="Almost there"
      subtitle="Your adventure is about to begin! Please confirm your reservation below."
    >
      <ErrorBoundary
        fallback={<ErrorFallback message="Failed to load reservation" />}
      >
        <Content vehicle={vehicle} start={start} end={end} quote={quote} />
      </ErrorBoundary>
    </MiniPageLayout>
  );
}
