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

  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      )
    }
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
      quantity: body.quantity,
      total_amount: body.total_amount,
      booking_status: body.booking_status ?? "confirmed",
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message ?? "Failed to create booking" },
      { status: response.status }
    )
  }

  return NextResponse.json({ booking: data[0] }, { status: 201 })
}
