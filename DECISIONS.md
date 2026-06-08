# Decisions

## Part 2: Persistence

Usually I go with Supabase for quick development, but in this instance I chose to just use Dockerized Postgres because I thought it would be easier to test and review -- it keeps the project self-contained and easy to start up. I included the path to using a hosted postgres provider by changing DATABASE_URL.

Because this project is on Prisma 7, the runtime client uses `@prisma/adapter-pg` instead of the older no-argument `new PrismaClient()` setup.

I decided to keep Vehicle classification as a Postgres enum because the current
set of cars is small and product-defined; if vehicle classes became user-configurable,
I would move that into a lookup table.

Prisma access is isolated to server-side modules and server pages, and I kept the DTOs in the existing snake-case style rather than updating to camelcase. Maybe I'll change this later.
