import { NextResponse } from "next/server"
import { createSupabaseHeaders, getSupabaseRestUrl } from "@/lib/supabaseRest"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params

  const response = await fetch(
    getSupabaseRestUrl(`events?id=eq.${eventId}&select=*`),
    {
      headers: createSupabaseHeaders(),
      cache: "no-store",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message ?? "Failed to fetch event" },
      { status: response.status }
    )
  }

  if (!data.length) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 })
  }

  return NextResponse.json({ event: data[0] })
}
