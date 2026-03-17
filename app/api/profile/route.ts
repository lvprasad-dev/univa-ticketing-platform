import { NextRequest, NextResponse } from "next/server"
import { createSupabaseHeaders, getSupabaseRestUrl } from "@/lib/supabaseRest"

export async function GET(request: NextRequest) {
  const accessToken = request.headers.get("authorization")?.replace("Bearer ", "")
  const userId = request.nextUrl.searchParams.get("userId")

  if (!accessToken || !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const response = await fetch(
    getSupabaseRestUrl(`profiles?id=eq.${userId}&select=*`),
    {
      headers: createSupabaseHeaders(accessToken),
      cache: "no-store",
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json(
      { error: data.message ?? "Failed to fetch profile" },
      { status: response.status }
    )
  }

  return NextResponse.json({ profile: data[0] ?? null })
}
