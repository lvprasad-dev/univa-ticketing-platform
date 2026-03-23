"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { pushNotification } from "@/lib/notifications"
import { supabase } from "@/lib/supabaseClient"

const initialForm = {
  title: "",
  category: "Movies",
  venue: "",
  city: "",
  locationUrl: "",
  eventDate: "",
  price: "",
  availableTickets: "",
  description: "",
}

export default function CreateEventPage() {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      setErrorMessage("Please login to create an event.")
      setIsSubmitting(false)
      return
    }

    const response = await fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        organizer_id: session.user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        city: form.city,
        venue: form.venue,
        location_url: form.locationUrl,
        event_date: form.eventDate,
        price: Number(form.price) || 0,
        available_tickets: Number(form.availableTickets) || 0,
      }),
    })

    const payload = await response.json()

    if (!response.ok) {
      setErrorMessage(payload.error ?? "Failed to create event.")
      setIsSubmitting(false)
      return
    }

    pushNotification({
      title: "Event Created",
      message: `${form.title} was created successfully for ${form.city} at ${form.venue}. Scheduled on ${new Date(form.eventDate).toLocaleString()}.`,
      href: "/my-events",
      source: "events",
    })

    router.push("/my-events")
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Create Event</h1>
            <p style={textStyle}>
              Add your event details and publish records that appear in My Events.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={fieldWrapperStyle}>
            <span style={labelStyle}>Event title</span>
            <input
              required
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              style={inputStyle}
            />
          </label>

          <label style={fieldWrapperStyle}>
            <span style={labelStyle}>Category</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({ ...current, category: event.target.value }))
              }
              style={inputStyle}
            >
              <option>Movies</option>
              <option>Travel</option>
              <option>Darshan</option>
              <option>Conferences</option>
              <option>Festivals</option>
            </select>
          </label>

          <label style={fieldWrapperStyle}>
            <span style={labelStyle}>Venue</span>
            <input
              required
              value={form.venue}
              onChange={(event) =>
                setForm((current) => ({ ...current, venue: event.target.value }))
              }
              style={inputStyle}
            />
          </label>

          <label style={fieldWrapperStyle}>
            <span style={labelStyle}>City</span>
            <input
              required
              value={form.city}
              onChange={(event) =>
                setForm((current) => ({ ...current, city: event.target.value }))
              }
              style={inputStyle}
            />
          </label>

          <label style={fullWidthFieldStyle}>
            <span style={labelStyle}>Venue Location Link</span>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              value={form.locationUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, locationUrl: event.target.value }))
              }
              style={inputStyle}
            />
          </label>

          <label style={fieldWrapperStyle}>
            <span style={labelStyle}>Date and time</span>
            <input
              required
              type="datetime-local"
              value={form.eventDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, eventDate: event.target.value }))
              }
              style={inputStyle}
            />
          </label>

          <label style={fieldWrapperStyle}>
            <span style={labelStyle}>Ticket price</span>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              style={inputStyle}
            />
          </label>

          <label style={fieldWrapperStyle}>
            <span style={labelStyle}>Available tickets</span>
            <input
              required
              type="number"
              min="1"
              value={form.availableTickets}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availableTickets: event.target.value,
                }))
              }
              style={inputStyle}
            />
          </label>

          <label style={fullWidthFieldStyle}>
            <span style={labelStyle}>Description</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              style={textareaStyle}
            />
          </label>

          {errorMessage && <p style={errorStyle}>{errorMessage}</p>}

          <div style={actionsStyle}>
            <button type="submit" style={submitButtonStyle} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

const pageStyle = {
  marginTop: "55px",
  minHeight: "100vh",
  padding: "40px 32px",
  background: "#fff8f2",
}

const cardStyle = {
  maxWidth: "920px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "22px",
  background: "white",
  boxShadow: "0 18px 36px rgba(150,92,52,0.08)",
}

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "24px",
}

const titleStyle = {
  marginBottom: "10px",
  color: "#3d2419",
}

const textStyle = {
  margin: 0,
  color: "#785344",
}

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
}

const fieldWrapperStyle = {
  display: "grid",
  gap: "8px",
}

const fullWidthFieldStyle = {
  display: "grid",
  gap: "8px",
  gridColumn: "1 / -1",
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

const textareaStyle = {
  ...inputStyle,
  resize: "vertical" as const,
}

const actionsStyle = {
  gridColumn: "1 / -1",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap" as const,
}

const submitButtonStyle = {
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
}

const errorStyle = {
  gridColumn: "1 / -1",
  margin: 0,
  color: "#d14343",
  fontWeight: "600",
}
