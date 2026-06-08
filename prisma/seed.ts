import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Classification } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const vehicles = [
  {
    id: "1",
    make: "Toyota",
    model: "Corolla",
    year: 2020,
    doors: 4,
    maxPassengers: 5,
    classification: "Compact",
    thumbnailUrl: "/cars/corolla",
    hourlyRateCents: 4500,
  },
  {
    id: "2",
    make: "Honda",
    model: "Civic",
    year: 2021,
    doors: 4,
    maxPassengers: 5,
    classification: "Compact",
    thumbnailUrl: "/cars/civic",
    hourlyRateCents: 4200,
  },
  {
    id: "3",
    make: "Ford",
    model: "Mustang",
    year: 2022,
    doors: 2,
    maxPassengers: 4,
    classification: "Sports",
    thumbnailUrl: "/cars/mustang",
    hourlyRateCents: 16000,
  },
  {
    id: "4",
    make: "Chevrolet",
    model: "Spark",
    year: 2020,
    doors: 4,
    maxPassengers: 4,
    classification: "Subcompact",
    thumbnailUrl: "/cars/spark",
    hourlyRateCents: 3200,
  },
  {
    id: "5",
    make: "Nissan",
    model: "Rogue",
    year: 2021,
    doors: 5,
    maxPassengers: 5,
    classification: "SUV",
    thumbnailUrl: "/cars/rogue",
    hourlyRateCents: 5800,
  },
  {
    id: "6",
    make: "Hyundai",
    model: "Santa Fe",
    year: 2022,
    doors: 5,
    maxPassengers: 7,
    classification: "SUV",
    thumbnailUrl: "/cars/santafe",
    hourlyRateCents: 7200,
  },
  {
    id: "7",
    make: "Volkswagen",
    model: "Golf",
    year: 2023,
    doors: 5,
    maxPassengers: 5,
    classification: "Compact",
    thumbnailUrl: "/cars/golf",
    hourlyRateCents: 5600,
  },
  {
    id: "8",
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2024,
    doors: 4,
    maxPassengers: 5,
    classification: "Luxury",
    thumbnailUrl: "/cars/cclass",
    hourlyRateCents: 22000,
  },
  {
    id: "9",
    make: "BMW",
    model: "X5",
    year: 2024,
    doors: 4,
    maxPassengers: 5,
    classification: "SUV",
    thumbnailUrl: "/cars/x5",
    hourlyRateCents: 17000,
  },
  {
    id: "10",
    make: "Mazda",
    model: "CX-9",
    year: 2024,
    doors: 5,
    maxPassengers: 7,
    classification: "SUV",
    thumbnailUrl: "/cars/cx9",
    hourlyRateCents: 7000,
  },
  {
    id: "11",
    make: "Chrysler",
    model: "Pacifica",
    year: 2024,
    doors: 5,
    maxPassengers: 8,
    classification: "Minivan",
    thumbnailUrl: "/cars/pacifica",
    hourlyRateCents: 8000,
  },
  {
    id: "12",
    make: "Jeep",
    model: "Wrangler",
    year: 2021,
    doors: 4,
    maxPassengers: 5,
    classification: "SUV",
    thumbnailUrl: "/cars/wrangler",
    hourlyRateCents: 8500,
  },
] satisfies Array<{
  id: string;
  make: string;
  model: string;
  year: number;
  doors: number;
  maxPassengers: number;
  classification: Classification;
  thumbnailUrl: string;
  hourlyRateCents: number;
}>;

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

async function main() {
  const today = startOfToday();

  await prisma.reservation.deleteMany();
  await prisma.vehicle.deleteMany();

  await prisma.vehicle.createMany({
    data: vehicles.map((vehicle, index) => ({
      ...vehicle,
      displayOrder: index + 1,
    })),
  });

  await prisma.reservation.createMany({
    data: [
      {
        id: "1",
        vehicleId: "1",
        startTime: today,
        endTime: addDays(today, 2),
        totalPriceCents: 1000,
      },
      {
        id: "2",
        vehicleId: "2",
        startTime: addDays(today, 1),
        endTime: addDays(today, 4),
        totalPriceCents: 1500,
      },
      {
        id: "3",
        vehicleId: "3",
        startTime: addDays(today, 2),
        endTime: addDays(today, 5),
        totalPriceCents: 2000,
      },
      {
        id: "4",
        vehicleId: "4",
        startTime: addDays(today, -3),
        endTime: addDays(today, 2),
        totalPriceCents: 1200,
      },
      {
        id: "5",
        vehicleId: "6",
        startTime: addDays(today, 7),
        endTime: addDays(today, 9),
        totalPriceCents: 1800,
      },
      {
        id: "6",
        vehicleId: "4",
        startTime: addDays(today, 10),
        endTime: addDays(today, 12),
        totalPriceCents: 2200,
      },
      {
        id: "7",
        vehicleId: "3",
        startTime: addDays(today, 13),
        endTime: addDays(today, 15),
        totalPriceCents: 2600,
      },
      {
        id: "8",
        vehicleId: "9",
        startTime: today,
        endTime: addDays(today, 2),
        totalPriceCents: 3000,
      },
      {
        id: "9",
        vehicleId: "7",
        startTime: addDays(today, 10),
        endTime: addDays(today, 12),
        totalPriceCents: 3000,
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
