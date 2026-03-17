# API routes

Current API routes added for the app:

- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:eventId`
- `GET /api/profile?userId=<uuid>`
- `GET /api/bookings?userId=<uuid>`
- `POST /api/bookings`

Notes:

- Public event reads use the Supabase anon key.
- Protected routes expect an `Authorization: Bearer <access_token>` header from a signed-in Supabase user.
- These APIs align with the PostgreSQL schema in [database/schema.sql](/C:/Desktop/univa-ticketing/database/schema.sql).
