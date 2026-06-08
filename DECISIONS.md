# Decisions

## Part 2: Persistence

Usually I go with Supabase for quick development, but in this instance I chose to just use Dockerized Postgres because I thought it would be easier to test and review -- it keeps the project self-contained and easy to start up. I included the path to using a hosted postgres provider by changing DATABASE_URL.

Because this project is on Prisma 7, the runtime client uses `@prisma/adapter-pg` instead of the older no-argument `new PrismaClient()` setup.

I decided to keep Vehicle classification as a Postgres enum because the current
set of cars is small and product-defined; if vehicle classes became user-configurable,
I would move that into a lookup table.

Prisma access is isolated to server-side modules and server pages, and I kept the DTOs in the existing snake-case style rather than updating to camelcase. Maybe I'll change this later.

## Part 3: Filters

I chose pickup/dropoff availability, passenger count, vehicle class, and hourly price because those are the highest-signal filters for a short car rental flow: time determines whether a vehicle can actually be booked, passengers determine minimum capacity, class captures the user's trip preference, and price keeps the comparison quick.

Filtering is URL-backed so searches are shareable and refresh-safe. The server page parses the query params, calls Prisma from the server layer, and passes plain DTOs into the client components.

Availability uses the standard interval overlap rule: a vehicle is unavailable when an existing reservation starts before the requested dropoff and ends after the requested pickup. The calendar shows a fleet-level availability summary for the current search window: available, limited, or unavailable, based on how many vehicles have overlapping reservations on each day.

I intentionally kept the passenger and price filters as simple buckets instead of building a more advanced faceted search. With more time, I would add per-vehicle availability calendars on the review page and inline validation for incomplete or inverted date ranges.
