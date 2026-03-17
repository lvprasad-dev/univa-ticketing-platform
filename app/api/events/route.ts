import { NextRequest, NextResponse } from "next/server"
import { createSupabaseHeaders, getSupabaseRestUrl } from "@/lib/supabaseRest"

const parseJsonResponse = async (response: Response) => {
  const responseText = await response.text()

  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const organizerId = request.nextUrl.searchParams.get("organizerId")
  const query = organizerId
    ? `events?select=*&organizer_id=eq.${organizerId}&order=event_date.asc`
    : "events?select=*&order=event_date.asc"

  const response = await fetch(getSupabaseRestUrl(query), {
    headers: createSupabaseHeaders(),
    cache: "no-store",
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    return NextResponse.json(
      { error: (data as { message?: string } | null)?.message ?? "Failed to fetch events" },
      { status: response.status }
    )
  }

  return NextResponse.json({ events: Array.isArray(data) ? data : [] })
}

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const requiredFields = [
    "organizer_id",
    "title",
    "category",
    "city",
    "venue",
    "event_date",
    "available_tickets",
  ]

  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }

  const response = await fetch(getSupabaseRestUrl("events"), {
    method: "POST",
    headers: {
      ...createSupabaseHeaders(accessToken),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      organizer_id: body.organizer_id,
      title: body.title,
      description: body.description ?? "",
      category: body.category,
      city: body.city,
      venue: body.venue,
      location_url: body.location_url ?? null,
      event_date: body.event_date,
      price: body.price ?? 0,
      available_tickets: body.available_tickets,
      banner_url: body.banner_url ?? null,
    }),
  })

  const data = await parseJsonResponse(response)

  if (!response.ok) {
    return NextResponse.json(
      { error: (data as { message?: string } | null)?.message ?? "Failed to create event" },
      { status: response.status }
    )
  }

  return NextResponse.json(
    { event: Array.isArray(data) ? data[0] ?? null : null },
    { status: 201 }
  )
}
