# Decisions

## Part 2: Persistence

Usually I go with Supabase for quick development, but in this instance I chose to just use Dockerized Postgres because I thought it would be easier to test and review -- it keeps the project self-contained and easy to start up. I included the path to using a hosted postgres provider by changing DATABASE_URL.

Because this project is on Prisma 7, the runtime client uses `@prisma/adapter-pg` instead of the older no-argument `new PrismaClient()` setup.

I decided to keep Vehicle classification as a Postgres enum because the current
set of cars is small and product-defined; if vehicle classes became user-configurable,
I would move that into a lookup table.

Prisma access is isolated to server-side modules and server pages, and I kept the DTOs in the existing snake-case style rather than updating to camelcase. Maybe I'll change this later.

## Part 3: Filters

I chose pickup/dropoff availability, passenger count, vehicle class, and hourly price because those are the most common filters that I've interacted with on various car rental sites. We're not looking to reinvent the wheel here, just provide users with a reliable UI they can count on.

Filtering is URL-backed so searches are shareable and refresh-safe. The server page parses the query params, calls Prisma from the server layer, and passes plain DTOs into the client components.

Availability uses the standard interval overlap rule: a vehicle is unavailable when an existing reservation starts before the requested dropoff and ends after the requested pickup. The calendar first applies the passenger, class, and price filters, then shows each day as available or unavailable based on whether at least one matching vehicle is free. I initially showed the number of vehicles available but then decided this made the UI omre confusing so removed it.

Something to add in the future could be helpful filters like gas mileage. I just didn't really have the time to do that this time around.


