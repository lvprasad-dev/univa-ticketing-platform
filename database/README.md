# Database setup

This project already uses Supabase, which is backed by PostgreSQL.

Run the SQL in [schema.sql](/C:/Desktop/univa-ticketing/database/schema.sql) inside the Supabase SQL editor to create:

- `profiles` for user profile data synced from `auth.users`
- `events` for published events
- `bookings` for user ticket bookings

It also adds:

- a trigger to create/update `profiles` when a user signs up
- row-level security policies for basic access control

Suggested next step after applying the SQL:

1. Add typed data reads/writes for `events` and `bookings` from the app.
