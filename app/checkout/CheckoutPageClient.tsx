"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { pushNotification } from "@/lib/notifications"
import { supabase } from "@/lib/supabaseClient"

type EventRecord = {
  id: string
  title: string
  category: string
  city: string
  venue: string
  event_date: string
  price: number
  available_tickets: number
}

const PLATFORM_FEE = 11

export default function CheckoutPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("eventId")
  const fallbackTitle = searchParams.get("title") || "Selected Ticket"
  const fallbackCategory = searchParams.get("category") || "Tickets"
  const fallbackVenue = searchParams.get("venue") || "Venue unavailable"
  const fallbackCity = searchParams.get("city") || ""
  const fallbackPrice = Number(searchParams.get("price") || "0")
  const fallbackAvailableTickets = Number(searchParams.get("availableTickets") || "0")
  const fallbackEventDate = searchParams.get("eventDate") || ""
  const isLiveEvent = searchParams.get("isLive") === "true"

  const [event, setEvent] = useState<EventRecord | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadEvent = async () => {
      if (!eventId) {
        setIsLoading(false)
        return
      }

      const response = await fetch(`/api/events/${eventId}`, {
        cache: "no-store",
      })
      const payload = (await response.json()) as { event?: EventRecord; error?: string }

      if (!isMounted) {
        return
      }

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Failed to load checkout details.")
        setIsLoading(false)
        return
      }

      setEvent(payload.event ?? null)
      setIsLoading(false)
    }

    loadEvent()

    return () => {
      isMounted = false
    }
  }, [eventId])

  const resolvedEvent = event ?? {
    id: "",
    title: fallbackTitle,
    category: fallbackCategory,
    city: fallbackCity,
    venue: fallbackVenue,
    event_date: fallbackEventDate,
    price: fallbackPrice,
    available_tickets: fallbackAvailableTickets,
  }

  const ticketSubtotal = resolvedEvent.price * quantity
  const platformFee = resolvedEvent.price > 0 ? PLATFORM_FEE : 0
  const totalAmount = ticketSubtotal + platformFee
  const isFreeEvent = resolvedEvent.price === 0

  const handleBooking = async () => {
    setErrorMessage("")
    setSuccessMessage("")

    if (!event || !isLiveEvent) {
      setErrorMessage("This card is only a preview. Booking works only for live events added by the organizer.")
      return
    }

    if (quantity < 1) {
      setErrorMessage("Choose at least 1 ticket.")
      return
    }

    if (quantity > event.available_tickets) {
      setErrorMessage("Requested quantity is higher than available tickets.")
      return
    }

    setIsSubmitting(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setErrorMessage("Please login before booking tickets.")
      setIsSubmitting(false)
      router.push("/login?message=Login%20to%20continue%20your%20booking")
      return
    }

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        event_id: event.id,
        user_id: session.user.id,
        quantity,
        total_amount: totalAmount,
        booking_status: "confirmed",
      }),
    })

    const payload = (await response.json()) as {
      booking?: { id: string }
      event?: EventRecord
      error?: string
    }

    if (!response.ok) {
      setErrorMessage(payload.error ?? "Failed to complete booking.")
      setIsSubmitting(false)
      return
    }

    if (payload.event) {
      setEvent(payload.event)
    }

    pushNotification({
      title: isFreeEvent ? "Free Ticket Confirmed" : "Booking Confirmed",
      message: `${event.title} booking is confirmed for ${quantity} ticket(s) at ${event.venue}, ${event.city}. Event time: ${new Date(event.event_date).toLocaleString()}. ${
        isFreeEvent ? "No payment was required." : `Total paid: Rs.${totalAmount}.`
      }`,
      href: "/my-tickets",
      source: "bookings",
    })

    setSuccessMessage("Booking confirmed. Redirecting to My Tickets...")
    window.dispatchEvent(new Event("univa-booking-completed"))

    window.setTimeout(() => {
      router.push("/my-tickets")
    }, 900)
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Checkout</h1>
            <p style={textStyle}>
              Review the event, choose quantity, and confirm the booking in one flow.
            </p>
          </div>

          <Link href={`/${fallbackCategory.toLowerCase()}`} style={backLinkStyle}>
            Back to events
          </Link>
        </div>

        {isLoading && <p style={infoStyle}>Loading checkout details...</p>}
        {!isLoading && errorMessage && <p style={errorStyle}>{errorMessage}</p>}
        {!isLoading && successMessage && <p style={successStyle}>{successMessage}</p>}

        {!isLoading && (resolvedEvent.price > 0 || isFreeEvent) && (
          <div style={contentGridStyle}>
            <section style={summaryStyle}>
              <p style={badgeStyle}>{resolvedEvent.category}</p>
              <h2 style={eventTitleStyle}>{resolvedEvent.title}</h2>
              <p style={metaStyle}>
                {resolvedEvent.venue}, {resolvedEvent.city}
              </p>
              <p style={metaStyle}>
                {resolvedEvent.event_date
                  ? new Date(resolvedEvent.event_date).toLocaleString()
                  : "Schedule will be shown for live events"}
              </p>
              <p style={availabilityStyle}>
                {isLiveEvent
                  ? `${resolvedEvent.available_tickets} tickets available now`
                  : "Preview mode. This is sample pricing only."}
              </p>
            </section>

            <section style={checkoutPanelStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>Ticket quantity</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(resolvedEvent.available_tickets, 1)}
                  value={quantity}
                  onChange={(inputEvent) =>
                    setQuantity(
                      Math.max(
                        1,
                        Math.min(
                          Number(inputEvent.target.value) || 1,
                          Math.max(resolvedEvent.available_tickets, 1)
                        )
                      )
                    )
                  }
                  style={inputStyle}
                />
              </label>

              <div style={fareBoxStyle}>
                <div style={rowStyle}>
                  <span>Ticket price</span>
                  <strong>{isFreeEvent ? "Free" : `Rs.${resolvedEvent.price}`}</strong>
                </div>
                <div style={rowStyle}>
                  <span>Quantity</span>
                  <strong>{quantity}</strong>
                </div>
                <div style={rowStyle}>
                  <span>Subtotal</span>
                  <strong>{isFreeEvent ? "Free" : `Rs.${ticketSubtotal}`}</strong>
                </div>
                <div style={rowStyle}>
                  <span>Platform fee</span>
                  <strong>{platformFee === 0 ? "Rs.0" : `Rs.${platformFee}`}</strong>
                </div>
                <div style={totalRowStyle}>
                  <span>Total amount</span>
                  <strong>{totalAmount === 0 ? "Free" : `Rs.${totalAmount}`}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBooking}
                disabled={isSubmitting || !isLiveEvent || resolvedEvent.available_tickets === 0}
                style={submitButtonStyle}
              >
                {isSubmitting
                  ? isFreeEvent
                    ? "Creating Free Ticket..."
                    : "Booking..."
                  : !isLiveEvent
                    ? "Live Booking Unavailable"
                    : resolvedEvent.available_tickets === 0
                      ? "Sold Out"
                      : isFreeEvent
                        ? "Get Free Ticket"
                        : "Confirm Booking"}
              </button>
            </section>
          </div>
        )}
      </section>
    </main>
  )
}

const pageStyle = {
  marginTop: "72px",
  minHeight: "100vh",
  padding: "40px 32px",
  background: "#faf7ff",
}

const cardStyle = {
  maxWidth: "980px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "22px",
  background: "white",
  boxShadow: "0 18px 36px rgba(80,52,145,0.08)",
}

const headerStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "24px",
}

const titleStyle = {
  marginBottom: "10px",
  color: "#241c3e",
}

const textStyle = {
  margin: 0,
  color: "#5d547e",
}

const backLinkStyle = {
  textDecoration: "none",
  color: "#5a4bff",
  fontWeight: "700",
}

const infoStyle = {
  margin: 0,
  color: "#5d547e",
}

const errorStyle = {
  margin: "0 0 18px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "#ffe5e5",
  color: "#9f1d1d",
  fontWeight: "600",
}

const successStyle = {
  margin: "0 0 18px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "#e8f7eb",
  color: "#216e39",
  fontWeight: "600",
}

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "22px",
}

const summaryStyle = {
  padding: "22px",
  borderRadius: "20px",
  background: "#f7f2ff",
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

const eventTitleStyle = {
  margin: "0 0 10px",
  color: "#241c3e",
}

const metaStyle = {
  margin: "0 0 8px",
  color: "#5d547e",
}

const availabilityStyle = {
  margin: "16px 0 0",
  color: "#216e39",
  fontWeight: "700",
}

const checkoutPanelStyle = {
  padding: "22px",
  borderRadius: "20px",
  background: "#fff8f2",
  display: "grid",
  gap: "18px",
}

const fieldStyle = {
  display: "grid",
  gap: "8px",
}

const labelStyle = {
  color: "#5f4032",
  fontWeight: "700",
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #f0c7b2",
  background: "#fffaf7",
}

const fareBoxStyle = {
  display: "grid",
  gap: "12px",
  padding: "18px",
  borderRadius: "18px",
  background: "white",
}

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#2d2550",
}

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: "12px",
  borderTop: "1px solid rgba(90,75,255,0.18)",
  color: "#241c3e",
}

const submitButtonStyle = {
  border: "none",
  padding: "14px 18px",
  borderRadius: "14px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
}
