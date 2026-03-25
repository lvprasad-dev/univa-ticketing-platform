"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

type EventRecord = {
  id: string
  title: string
  category: string
  city: string
  venue: string
  location_url?: string | null
  event_date: string
  price: number
  available_tickets: number
}

export default function MyEventsPage() {
  const [events, setEvents] = useState<EventRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentTime, setCurrentTime] = useState(() => new Date().getTime())
  const [activeTab, setActiveTab] = useState<"Live" | "Upcoming" | "Finished">("Live")

  useEffect(() => {
    let isMounted = true

    const loadEvents = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        if (isMounted) {
          setErrorMessage("Please login to view your event records.")
          setIsLoading(false)
        }
        return
      }

      const response = await fetch(`/api/events?organizerId=${session.user.id}`, {
        cache: "no-store",
      })
      const responseText = await response.text()
      const payload = responseText ? JSON.parse(responseText) : {}

      if (!response.ok) {
        if (isMounted) {
          setErrorMessage((payload as { error?: string }).error ?? "Failed to load your events.")
          setIsLoading(false)
        }
        return
      }

      if (isMounted) {
        setEvents((payload as { events?: EventRecord[] }).events ?? [])
        setIsLoading(false)
      }
    }

    loadEvents()

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

  const { liveEvents, upcomingEvents, finishedEvents } = useMemo(() => {
    const live: EventRecord[] = []
    const upcoming: EventRecord[] = []
    const finished: EventRecord[] = []

    for (const event of events) {
      const eventTime = new Date(event.event_date).getTime()
      const hoursDifference = eventTime - currentTime

      if (hoursDifference <= 0 && hoursDifference >= -4 * 60 * 60 * 1000) {
        live.push(event)
      } else if (hoursDifference > 0) {
        upcoming.push(event)
      } else {
        finished.push(event)
      }
    }

    return {
      liveEvents: live,
      upcomingEvents: upcoming,
      finishedEvents: finished,
    }
  }, [currentTime, events])

  const tabConfig = {
    Live: {
      events: liveEvents,
      emptyText: "There are no live events.",
    },
    Upcoming: {
      events: upcomingEvents,
      emptyText: "No upcoming events scheduled.",
    },
    Finished: {
      events: finishedEvents,
      emptyText: "No finished events yet.",
    },
  } as const

  const activeSection = tabConfig[activeTab]
  const headerMessage =
    activeTab === "Live" && activeSection.events.length === 0
      ? "No live events are running."
      : "Manage your live, upcoming, and finished events in one place."

  return (
    <main style={pageStyle}>
      <section style={tabBarWrapStyle}>
        <div style={tabBarStyle}>
          {(["Live", "Upcoming", "Finished"] as const).map((tab) => (
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

      <section style={headerCardStyle}>
        <div>
          <p style={subtitleStyle}>{headerMessage}</p>
        </div>

        <Link href="/organizer/create-event" style={primaryLinkStyle}>
          Create New Event
        </Link>
      </section>

      {isLoading && <p style={infoStyle}>Loading your events...</p>}
      {!isLoading && errorMessage && <p style={errorStyle}>{errorMessage}</p>}

      {!isLoading && !errorMessage && events.length === 0 && (
        <section style={emptyStateStyle}>
          <h2 style={emptyTitleStyle}>No events yet</h2>
          <p style={subtitleStyle}>
            Start by creating your first event. Once created, the record will appear
            here automatically.
          </p>
          <Link href="/organizer/create-event" style={primaryLinkStyle}>
            Create Event
          </Link>
        </section>
      )}

      {!isLoading && events.length > 0 && (
        <div style={sectionsWrapStyle}>
          <EventSection
            title={activeTab}
            events={activeSection.events}
            emptyText={activeSection.emptyText}
          />
        </div>
      )}
    </main>
  )
}

function EventSection({
  title,
  events,
  emptyText,
}: {
  title: string
  events: EventRecord[]
  emptyText: string
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>{title}</h2>
        <span style={countBadgeStyle}>{events.length}</span>
      </div>

      {events.length === 0 ? (
        <div style={emptySectionActionStyle}>
          <p style={emptySectionTextStyle}>{emptyText}</p>
          {title === "Live" && (
            <Link href="/organizer/create-event" style={emptySectionButtonStyle}>
              Create Event
            </Link>
          )}
        </div>
      ) : (
        <div style={gridStyle}>
          {events.map((event) => (
            <article key={event.id} style={cardStyle}>
              <p style={badgeStyle}>{event.category}</p>
              <h2 style={cardTitleStyle}>{event.title}</h2>
              <p style={metaStyle}>{event.venue}, {event.city}</p>
              <p style={metaStyle}>{new Date(event.event_date).toLocaleString()}</p>
              {event.location_url && (
                <a
                  href={event.location_url}
                  target="_blank"
                  rel="noreferrer"
                  style={locationLinkStyle}
                >
                  Open Venue Location
                </a>
              )}
              <p style={priceStyle}>Rs.{event.price}</p>
              <p style={ticketsStyle}>{event.available_tickets} tickets available</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

const pageStyle = {
  marginTop: "72px",
  minHeight: "100vh",
  padding: "15px 32px 32px",
  backgroundImage: "url('/univa-my-events-bg.png')",
  backgroundSize: "100% auto",
  backgroundPosition: "center top",
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
  minHeight: "15px",
  borderRadius: "18px",
  background: "transparent",
  boxShadow: "none",
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

const headerCardStyle = {
  maxWidth: "1120px",
  margin: "0 auto 24px",
  padding: "24px",
  borderRadius: "24px",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  boxShadow: "none",
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
  background: "transparent",
  boxShadow: "none",
  display: "grid",
  gap: "14px",
  justifyItems: "start",
}


const sectionsWrapStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  display: "grid",
  gap: "24px",
}

const sectionStyle = {
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

const emptySectionTextStyle = {
  margin: 0,
  color: "#7b5a4d",
}

const emptySectionActionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap" as const,
}

const emptySectionButtonStyle = {
  textDecoration: "none",
  padding: "10px 16px",
  borderRadius: "12px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "700",
}

const emptyTitleStyle = {
  margin: 0,
  color: "#2f1b14",
}

const gridStyle = {
  maxWidth: "1120px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
}

const cardStyle = {
  padding: "22px",
  borderRadius: "22px",
  background: "rgba(255, 255, 255, 0.82)",
  boxShadow: "0 18px 36px rgba(150,92,52,0.1)",
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

const locationLinkStyle = {
  display: "inline-block",
  marginBottom: "10px",
  color: "#5a4bff",
  fontWeight: "700",
  textDecoration: "none",
}

const priceStyle = {
  margin: "14px 0 8px",
  color: "#ff7a00",
  fontWeight: "700",
}

const ticketsStyle = {
  margin: 0,
  color: "#5a4bff",
  fontWeight: "700",
}



