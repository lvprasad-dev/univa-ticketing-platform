"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type BookingRecord = {
  id: string
  quantity: number
  total_amount: number
  booking_status: string
  booked_at: string
  events?: {
    title: string
    city: string
    venue: string
    event_date: string
  } | null
}

const getTicketLifecycleStatus = (booking: BookingRecord, currentTime: number) => {
  const eventTime = booking.events?.event_date
    ? new Date(booking.events.event_date).getTime()
    : 0

  if (booking.booking_status !== "confirmed") {
    return "Inactive"
  }

  if (eventTime !== 0 && eventTime < currentTime) {
    return "Disconnected"
  }

  return "Active"
}

export default function MyTicketsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeTab, setActiveTab] = useState<"Active" | "History">("Active")
  const [currentTime, setCurrentTime] = useState(() => new Date().getTime())

  useEffect(() => {
    let isMounted = true

    const loadBookings = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        if (isMounted) {
          setErrorMessage("Please login to view your booked tickets.")
          setIsLoading(false)
        }
        return
      }

      const {
        data: { session: refreshedSession },
      } = await supabase.auth.getSession()
      const accessToken = refreshedSession?.access_token

      if (!accessToken) {
        if (isMounted) {
          setErrorMessage("Your session expired. Please login again.")
          setIsLoading(false)
        }
        return
      }

      const response = await fetch(`/api/bookings?userId=${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      })
      const responseText = await response.text()
      const payload = responseText ? JSON.parse(responseText) : {}

      if (!response.ok) {
        if (isMounted) {
          setErrorMessage(
            (payload as { error?: string }).error ?? "Failed to load your tickets."
          )
          setIsLoading(false)
        }
        return
      }

      if (isMounted) {
        const nextBookings = (payload as { bookings?: BookingRecord[] }).bookings ?? []
        setBookings(nextBookings)
        setIsLoading(false)
      }
    }

    loadBookings()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date().getTime())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  const { activeTickets, historyTickets } = useMemo(() => {
    const active: BookingRecord[] = []
    const history: BookingRecord[] = []

    for (const booking of bookings) {
      const lifecycleStatus = getTicketLifecycleStatus(booking, currentTime)

      if (lifecycleStatus === "Active") {
        active.push(booking)
      } else {
        history.push(booking)
      }
    }

    return { activeTickets: active, historyTickets: history }
  }, [bookings, currentTime])

  const activeSection =
    activeTab === "Active"
      ? {
          tickets: activeTickets,
          emptyText: "There are No Active tickets",
          headerText: "Your upcoming booked tickets appear here.",
        }
      : {
          tickets: historyTickets,
          emptyText: "No ticket history yet.",
          headerText: "Past, expired, and inactive bookings stay here for your records.",
        }

  return (
    <main style={pageStyle}>
      <section style={tabBarWrapStyle}>
        <div style={tabBarStyle}>
          {(["Active", "History"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={activeTab === tab ? activeTabButtonStyle : tabButtonStyle}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {isLoading && <p style={infoStyle}>Loading your booked tickets...</p>}
      {!isLoading && errorMessage && <p style={errorStyle}>{errorMessage}</p>}

      {!isLoading && !errorMessage && bookings.length === 0 && (
        <section style={emptyStateStyle}>
          <h2 style={emptyTitleStyle}>No tickets booked yet</h2>
          <p style={subtitleStyle}>
            Once you book a ticket, it will appear here with event details and status.
          </p>
          <Link href="/movies" style={primaryLinkStyle}>
            Explore Tickets
          </Link>
        </section>
      )}

      {!isLoading && bookings.length > 0 && (
        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>{activeTab} Tickets</h2>
            <span style={countBadgeStyle}>{activeSection.tickets.length}</span>
          </div>

          {activeSection.tickets.length === 0 ? (
            activeTab === "History" ? (
              <section style={emptyStateStyle}>
                <h2 style={emptyTitleStyle}>No ticket history yet</h2>
                <p style={subtitleStyle}>
                  Completed, expired, and inactive bookings will appear here once you have ticket history.
                </p>
                <Link href="/movies" style={primaryLinkStyle}>
                  Explore Tickets
                </Link>
              </section>
            ) : (
              <div style={emptySectionActionStyle}>
                <p style={emptySectionTextStyle}>{activeSection.emptyText}</p>
                <Link href="/movies" style={emptySectionButtonStyle}>
                  Explore Events
                </Link>
              </div>
            )
          ) : (
            <div style={gridStyle}>
              {activeSection.tickets.map((booking) => (
                <article key={booking.id} style={cardStyle}>
                  <p style={badgeStyle}>
                    {getTicketLifecycleStatus(booking, currentTime)} Ticket
                  </p>
                  <h3 style={cardTitleStyle}>
                    {booking.events?.title ?? "Booked Event"}
                  </h3>
                  <p style={metaStyle}>
                    {booking.events?.venue ?? "Venue unavailable"}
                    {booking.events?.city ? `, ${booking.events.city}` : ""}
                  </p>
                  <p style={metaStyle}>
                    {booking.events?.event_date
                      ? new Date(booking.events.event_date).toLocaleString()
                      : "Event date unavailable"}
                  </p>
                  <p style={priceStyle}>Rs.{booking.total_amount}</p>
                  <p style={ticketsStyle}>{booking.quantity} ticket(s) booked</p>
                  <p style={statusStyle}>
                    Status: {getTicketLifecycleStatus(booking, currentTime)}
                  </p>
                  <p style={bookedAtStyle}>
                    Booked on {new Date(booking.booked_at).toLocaleDateString()}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  )
}

const pageStyle = {
  marginTop: "72px",
  minHeight: "100vh",
  padding: "15px 32px 32px",
  backgroundImage:
    "linear-gradient(rgba(34, 22, 16, 0.2), rgba(34, 22, 16, 0.2)), url('/my-tickets-bg.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
}

const tabBarWrapStyle = {
  maxWidth: "1120px",
  margin: "0 auto 18px",
}

const tabBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "8px 10px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "0 12px 24px rgba(30,18,12,0.12)",
}

const tabButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#7b5a4d",
  padding: "8px 16px",
  borderRadius: "999px",
  fontWeight: "700",
  cursor: "pointer",
}

const activeTabButtonStyle = {
  ...tabButtonStyle,
  background: "#ff7a00",
  color: "white",
}



const subtitleStyle = {
  margin: 0,
  color: "#7b5a4d",
  lineHeight: 1.6,
}

const primaryLinkStyle = {
  textDecoration: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "700",
}

const infoStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  color: "#6a564f",
}

const errorStyle = {
  ...infoStyle,
  color: "#d14343",
  fontWeight: "700",
}

const emptyStateStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "0 18px 36px rgba(30,18,12,0.14)",
  display: "grid",
  gap: "14px",
  justifyItems: "start",
}

const emptyTitleStyle = {
  margin: 0,
  color: "#2f1b14",
}

const sectionStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  display: "grid",
  gap: "16px",
}

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
}

const sectionTitleStyle = {
  margin: 0,
  color: "#2f1b14",
}

const countBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "32px",
  height: "32px",
  padding: "0 10px",
  borderRadius: "999px",
  background: "#fff0e3",
  color: "#d76a00",
  fontWeight: "700",
}

const emptySectionActionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap" as const,
}

const emptySectionTextStyle = {
  margin: 0,
  color: "#7b5a4d",
}

const emptySectionButtonStyle = {
  textDecoration: "none",
  padding: "10px 16px",
  borderRadius: "12px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "700",
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
}

const cardStyle = {
  padding: "22px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.92)",
  boxShadow: "0 18px 36px rgba(30,18,12,0.14)",
}

const badgeStyle = {
  display: "inline-block",
  margin: "0 0 12px",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "#fff0e3",
  color: "#d76a00",
  fontWeight: "700",
  fontSize: "12px",
}

const cardTitleStyle = {
  margin: "0 0 10px",
  color: "#2f1b14",
}

const metaStyle = {
  margin: "0 0 8px",
  color: "#6a564f",
}

const priceStyle = {
  margin: "14px 0 8px",
  color: "#ff7a00",
  fontWeight: "700",
}

const ticketsStyle = {
  margin: "0 0 8px",
  color: "#5a4bff",
  fontWeight: "700",
}

const statusStyle = {
  margin: "0 0 8px",
  color: "#2f1b14",
  fontWeight: "600",
}

const bookedAtStyle = {
  margin: 0,
  color: "#7b5a4d",
}



