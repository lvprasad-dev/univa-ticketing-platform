import { NextRequest, NextResponse } from "next/server"
import { createSupabaseHeaders, getSupabaseRestUrl } from "@/lib/supabaseRest"

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "")
  const userId = request.nextUrl.searchParams.get("userId")

  if (!accessToken || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const response = await fetch(
    getSupabaseRestUrl(
      `bookings?user_id=eq.${userId}&select=*,events(title,city,venue,event_date)&order=booked_at.desc`
    ),
    {
      headers: createSupabaseHeaders(accessToken),
      cache: "no-store",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message ?? "Failed to fetch bookings" },
      { status: response.status }
    )
  }

  return NextResponse.json({ bookings: data })
}

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "")

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const requiredFields = ["event_id", "user_id", "quantity", "total_amount"]
  const quantity = Number(body.quantity)

  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Quantity must be at least 1" }, { status: 400 })
  }

  const eventResponse = await fetch(
    getSupabaseRestUrl(`events?id=eq.${body.event_id}&select=id,title,available_tickets`),
    {
      headers: createSupabaseHeaders(accessToken),
      cache: "no-store",
    }
  )

  const eventData = await eventResponse.json()

  if (!eventResponse.ok) {
    return NextResponse.json(
      { error: eventData.message ?? "Failed to load event details" },
      { status: eventResponse.status }
    )
  }

  const eventRecord = Array.isArray(eventData) ? eventData[0] : null

  if (!eventRecord) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  if (eventRecord.available_tickets < quantity) {
    return NextResponse.json(
      { error: "Requested ticket quantity is not available" },
      { status: 400 }
    )
  }

  const updateResponse = await fetch(
    getSupabaseRestUrl(
      `events?id=eq.${body.event_id}&available_tickets=eq.${eventRecord.available_tickets}`
    ),
    {
      method: "PATCH",
      headers: {
        ...createSupabaseHeaders(accessToken),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        available_tickets: eventRecord.available_tickets - quantity,
      }),
    }
  )

  const updatedEvents = await updateResponse.json()

  if (!updateResponse.ok || !Array.isArray(updatedEvents) || updatedEvents.length === 0) {
    return NextResponse.json(
      { error: "Tickets changed just now. Please try booking again." },
      { status: 409 }
    )
  }

  const response = await fetch(getSupabaseRestUrl("bookings"), {
    method: "POST",
    headers: {
      ...createSupabaseHeaders(accessToken),
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      event_id: body.event_id,
      user_id: body.user_id,
      quantity,
      total_amount: body.total_amount,
      booking_status: body.booking_status ?? "confirmed",
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    await fetch(getSupabaseRestUrl(`events?id=eq.${body.event_id}`), {
      method: "PATCH",
      headers: createSupabaseHeaders(accessToken),
      body: JSON.stringify({
        available_tickets: eventRecord.available_tickets,
      }),
    })

    return NextResponse.json(
      { error: data.message ?? "Failed to create booking" },
      { status: response.status }
    )
  }

  return NextResponse.json(
    {
      booking: data[0],
      event: {
        ...eventRecord,
        available_tickets: eventRecord.available_tickets - quantity,
      },
    },
    { status: 201 }
  )
}
