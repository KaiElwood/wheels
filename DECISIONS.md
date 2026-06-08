# Decisions

## Persistence

I chose Postgres with Prisma for persistence. There a lot of options for persistence, including whether or not to use a ORM, which database to use, and how to host it. 

In my own work I usually default to Supabase because it's so easy to get something up an running with them. However, in this instance I elected to use Docker with Postgres -- I thought using Docker would be easier for reviewers to spin up on their own computers quickly. 

As far as an ORM, I think Drizzle and Prisma are the two that come to mind quickest. While not strictly needed, it does give us schema-as-code, migrations, seed scripts, and type-safe queries pretty easily. I chose Prisma because it's usually more simple for frontend developers and I like how they drastically slimmed it down it with version 7 (though I have not used it remotely).

Prisma access is isolated to server-side modules and server pages. UI components receive plain data objects rather than importing database code directly. Benefits to this are UI components stay easier to test because they just get props, DATABASE_URL and database credentials stay server-only, etc. Farily basic.

## Add-Ons Data Model

I modeled add-ons as a small catalog with stable IDs, display metadata, a price in cents, and a price model:

- `per_rental` for one-time charges.
- `per_day` for duration-based charges.

This keeps the checkout logic generic. New add-ons can be added by appending a catalog item instead of changing the pricing engine. Selected add-ons are represented by ID, then expanded into line items during quote calculation.

I did think about whether to persist this information in storage but decided that in most rental apps I've used in the past, add-ons are not persisted. So, I went with what I percieve to be the most common UI pattern.

## UI/UX

I thought about a myriad of options for how to display the different cars available. Ulitmately, I liked the grid option. It was then a question of what the grid should look like. I most commonly see rows where each row has one item, but I liked the idea of switching it up a bit and including multiple options per row. You could argue that it's a little overwhelming. I think I'd argue that it's more informative and feels more like what we would expect from a modern app -- options. I think the grid option with boxes also lends itself to cool highlighting and effects (which I didn't implement). One thing I thought about was having the car drive off the screen when selected. Maybe next time!

As far as libaries -- I used the existing Tailwind and shadcn/ui setup rather than introducing a new design system. Just seemed to be easier for me.

The filtering is designed around what I most comonly see on rentals sites: choose dates, filter available vehicles, compare prices, and move into checkout. The review page focuses on confirming the selected vehicle, showing the trip details, selecting optional add-ons, and displaying a live line-item price breakdown.

## Discounts And Pricing

I kept pricing logic in a dedicated module instead of embedding it in UI components. Seemed to be most reusable. The pricing function calculates the base rental, evaluates each eligible discount, chooses the discount that produces the lowest base price, then adds selected add-ons afterward.

This keeps search and checkout consistent -- the same pricing logic powers vehicle search preview and review page breakdown.

## Tradeoffs

I could have done database rows or a static catalog for the add-ons. I decided to keep add-ons as a static catalog because add-ons do not need admin editing or persistence beyond the review page. I figured a typed catalog would be simpler. In a production system where add-ons are managed by non-engineers, I would mvoe it into the database.

I thought about adding vehicle holds and more advanced features to the checkout process as well but just ran out of time. A hold would be modeled as a temporary reservation with a hold status and expires_at timestamp. Availability checks would expand to confirmed reservations and non-expired holds.

I also moved database-backed portions to server-based components instead of client-side, which I think better represents the functionality that Next wants us to be using and tracks with how Prisma works. The tradeoff is that filters cannot be purely local React state anymore -- changing filters needs to update the URL, call a server action, or request an API route. Interactive UI still uses Client Components where needed.

I also thought about adding price as a more interactive toggle like how Airbnb and many other sites do it but ran out of time as well -- I would probably change this given more time as well.