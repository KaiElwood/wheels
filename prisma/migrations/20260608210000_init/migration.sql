CREATE TYPE "Classification" AS ENUM ('Compact', 'SUV', 'Sports', 'Subcompact', 'Minivan', 'Luxury');

CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "doors" INTEGER NOT NULL,
    "max_passengers" INTEGER NOT NULL,
    "classification" "Classification" NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "hourly_rate_cents" INTEGER NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "total_price_cents" INTEGER NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "vehicles_classification_idx" ON "vehicles"("classification");

CREATE INDEX "reservations_vehicle_id_start_time_end_time_idx" ON "reservations"("vehicle_id", "start_time", "end_time");

ALTER TABLE "reservations" ADD CONSTRAINT "reservations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
