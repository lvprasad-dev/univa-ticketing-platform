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
            <span style={labelStyle}>Venue Location Link (Optional)</span>
            <input
              type="url"
              placeholder="https://maps.google.com/..."
              value={form.locationUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, locationUrl: event.target.value }))
              }
              style={inputStyle}
            />
            <span style={helperTextStyle}>
              Add a map link if you have one. You can leave this empty.
            </span>
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
  minHeight: "calc(100vh - 55px)",
  height: "calc(100vh - 55px)",
  padding: "16px 20px 14px",
  backgroundImage:
    "linear-gradient(rgba(34, 22, 16, 0.18), rgba(34, 22, 16, 0.18)), url('/univa-create-event.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  overflow: "hidden" as const,
}

const cardStyle = {
  width: "min(960px, 100%)",
  height: "100%",
  margin: "0 auto",
  padding: "22px 18px",
  borderRadius: "0",
  background: "transparent",
  boxShadow: "none",
  overflow: "hidden" as const,
  display: "flex",
  flexDirection: "column" as const,
}

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "16px",
}

const titleStyle = {
  margin: "0 0 4px",
  color: "#20120d",
  fontSize: "28px",
}

const textStyle = {
  margin: 0,
  color: "#3f281d",
  fontSize: "15px",
}

const formStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 420px))",
  gap: "10px 14px",
  flex: 1,
  alignContent: "start",
  justifyContent: "start",
}

const fieldWrapperStyle = {
  display: "grid",
  gap: "6px",
}

const fullWidthFieldStyle = {
  display: "grid",
  gap: "6px",
  gridColumn: "1 / -1",
}

const labelStyle = {
  color: "#251711",
  fontWeight: "700",
  fontSize: "14px",
}

const helperTextStyle = {
  marginTop: "0",
  color: "#5e463b",
  fontSize: "13px",
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(99, 69, 54, 0.2)",
  background: "rgba(255, 255, 255, 0.96)",
  fontSize: "15px",
  color: "#20120d",
  boxShadow: "0 8px 18px rgba(34, 22, 16, 0.08)",
}

const textareaStyle = {
  ...inputStyle,
  minHeight: "56px",
  maxHeight: "56px",
  resize: "none" as const,
}

const actionsStyle = {
  gridColumn: "1 / -1",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap" as const,
  justifyContent: "flex-end",
}

const submitButtonStyle = {
  border: "none",
  padding: "10px 18px",
  borderRadius: "10px",
  background: "rgba(255, 122, 0, 0.88)",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(255, 122, 0, 0.22)",
}

const errorStyle = {
  gridColumn: "1 / -1",
  margin: 0,
  color: "#9f1d1d",
  fontWeight: "600",
}
