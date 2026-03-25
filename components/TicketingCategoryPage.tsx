"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useSyncExternalStore } from "react"

type Listing = {
  id?: string
  title: string
  category?: string
  city: string
  venue: string
  area: string
  price: string
  lat: number
  lon: number
  meta: string
  availableTickets?: number
  eventDate?: string
  locationUrl?: string | null
}

type Coordinates = {
  lat: number
  lon: number
}

type TicketingCategoryPageProps = {
  category: string
  heading: string
  description: string
  icon: string
  listings: Listing[]
  backgroundImage?: string
}

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

const selectedLocationKey = "univa-selected-location"
const selectedLocationEvent = "univa-location-change"

const getStoredLocation = () => {
  if (typeof window === "undefined") {
    return "your location"
  }

  try {
    return window.localStorage.getItem(selectedLocationKey) || "your location"
  } catch {
    return "your location"
  }
}

const toRadians = (value: number) => (value * Math.PI) / 180

const getDistance = (
  firstLat: number,
  firstLon: number,
  secondLat: number,
  secondLon: number
) => {
  const earthRadiusKm = 6371
  const deltaLat = toRadians(secondLat - firstLat)
  const deltaLon = toRadians(secondLon - firstLon)
  const originLat = toRadians(firstLat)
  const targetLat = toRadians(secondLat)

  const haversine =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(originLat) *
      Math.cos(targetLat) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2)

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
}

const getCityFromLocation = (location: string) => {
  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)

  return parts[parts.length - 1] || location
}

export default function TicketingCategoryPage({
  category,
  heading,
  description,
  icon,
  listings,
  backgroundImage,
}: TicketingCategoryPageProps) {
  const [currentCoordinates, setCurrentCoordinates] = useState<Coordinates | null>(null)
  const [liveListings, setLiveListings] = useState<Listing[]>([])
  const [isLoadingLiveListings, setIsLoadingLiveListings] = useState(true)
  const locationLabel = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => undefined
      }

      const handleLocationChange = () => onStoreChange()

      window.addEventListener("storage", handleLocationChange)
      window.addEventListener(selectedLocationEvent, handleLocationChange)

      return () => {
        window.removeEventListener("storage", handleLocationChange)
        window.removeEventListener(selectedLocationEvent, handleLocationChange)
      }
    },
    () => getStoredLocation(),
    () => "your location"
  )

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      },
      () => {
        setCurrentCoordinates(null)
      }
    )
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadLiveListings = async () => {
      const response = await fetch(`/api/events?category=${encodeURIComponent(category)}`, {
        cache: "no-store",
      })
      const payload = (await response.json()) as { events?: EventRecord[]; error?: string }

      if (!isMounted) {
        return
      }

      if (!response.ok) {
        setLiveListings([])
        setIsLoadingLiveListings(false)
        return
      }

      const normalizedListings = (payload.events ?? []).map((event) => ({
        id: event.id,
        title: event.title,
        category: event.category,
        city: event.city,
        venue: event.venue,
        area: event.city,
        price: `Rs.${event.price}`,
        lat: 0,
        lon: 0,
        meta: new Date(event.event_date).toLocaleString(),
        availableTickets: event.available_tickets,
        eventDate: event.event_date,
        locationUrl: event.location_url ?? null,
      }))

      setLiveListings(normalizedListings)
      setIsLoadingLiveListings(false)
    }

    loadLiveListings()

    return () => {
      isMounted = false
    }
  }, [category])

  const selectedCity = useMemo(
    () => getCityFromLocation(locationLabel),
    [locationLabel]
  )

  const sourceListings = liveListings.length > 0 ? liveListings : listings

  const cityListings = useMemo(() => {
    const filteredListings = sourceListings.filter((listing) => listing.city === selectedCity)

    if (!currentCoordinates) {
      return filteredListings
    }

    return [...filteredListings].sort((firstListing, secondListing) => {
      if (!firstListing.lat || !firstListing.lon || !secondListing.lat || !secondListing.lon) {
        return 0
      }

      const firstDistance = getDistance(
        currentCoordinates.lat,
        currentCoordinates.lon,
        firstListing.lat,
        firstListing.lon
      )
      const secondDistance = getDistance(
        currentCoordinates.lat,
        currentCoordinates.lon,
        secondListing.lat,
        secondListing.lon
      )

      return firstDistance - secondDistance
    })
  }, [currentCoordinates, selectedCity, sourceListings])

  const visibleListings = cityListings.length > 0 ? cityListings : sourceListings

  return (
    <main
      style={{
        ...pageStyle,
        ...(backgroundImage
          ? {
              backgroundImage: `url('${backgroundImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              backgroundRepeat: "no-repeat",
            }
          : {}),
      }}
    >
      <section style={heroStyle}>
        <p style={eyebrowStyle}>{category}</p>
        <h1 style={titleStyle}>{heading}</h1>
        <p style={textStyle}>{description}</p>
        <p style={locationTextStyle}>
          Showing options for <strong>{locationLabel}</strong>
          {cityListings.length === 0 ? " with other cities as fallback." : "."}
        </p>
      </section>

      <section style={gridStyle}>
        {isLoadingLiveListings && (
          <p style={statusTextStyle}>Loading live ticket availability...</p>
        )}

        {visibleListings.map((listing) => {
          const distance =
            currentCoordinates &&
            listing.lat &&
            listing.lon &&
            getDistance(
              currentCoordinates.lat,
              currentCoordinates.lon,
              listing.lat,
              listing.lon
            )

          return (
            <article key={`${listing.title}-${listing.venue}-${listing.area}`} style={cardStyle}>
              <div style={posterStyle}>
                <span style={posterIconStyle}>{icon}</span>
              </div>
              <h2 style={cardTitleStyle}>{listing.venue}</h2>
              <p style={cardMetaStyle}>
                {listing.area}, {listing.city}
              </p>
              <p style={cardMetaStyle}>{listing.title}</p>
              <p style={cardMetaStyle}>{listing.meta}</p>
              <p style={listingModeStyle(listing.id)}>
                {listing.id ? "Live booking available" : "Sample preview only"}
              </p>
              {typeof listing.availableTickets === "number" && (
                <p style={availabilityStyle}>{listing.availableTickets} tickets left</p>
              )}
              {listing.eventDate && (
                <p style={cardMetaStyle}>{new Date(listing.eventDate).toLocaleString()}</p>
              )}
              <p style={distanceStyle}>
                {distance ? `${distance.toFixed(1)} km away` : "Distance unavailable"}
              </p>
              <p style={priceStyle}>{listing.price}</p>
              <Link
                href={
                  {
                    pathname: "/checkout",
                    query: {
                      eventId: listing.id ?? "",
                      category,
                      title: listing.title,
                      venue: listing.venue,
                      city: listing.city,
                      price: listing.price.replace(/[^\d]/g, ""),
                      availableTickets:
                        typeof listing.availableTickets === "number"
                          ? String(listing.availableTickets)
                          : "",
                      eventDate: listing.eventDate ?? "",
                      isLive: listing.id ? "true" : "false",
                    },
                  }
                }
                className="primary-cta"
                style={actionStyle}
              >
                {listing.id ? "Book Now" : "Preview Price"}
              </Link>
            </article>
          )
        })}
      </section>
    </main>
  )
}

const pageStyle = {
  marginTop: "55px",
  minHeight: "100vh",
  padding: "120px 32px 56px",
  background: "transparent",
}

const heroStyle = {
  maxWidth: "840px",
  margin: "0 auto 28px",
  textAlign: "center" as const,
}

const eyebrowStyle = {
  marginBottom: "10px",
  color: "#ff7a00",
  fontWeight: "700",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
}

const titleStyle = {
  marginBottom: "10px",
  color: "#171127",
  fontSize: "40px",
}

const textStyle = {
  color: "#5d6475",
  fontSize: "18px",
  lineHeight: 1.6,
}

const locationTextStyle = {
  marginTop: "12px",
  color: "#3f3a56",
  fontSize: "16px",
}

const gridStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
}

const cardStyle = {
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(207, 229, 255, 0.88)",
  boxShadow: "0 18px 36px rgba(45, 88, 160, 0.18)",
  backdropFilter: "blur(4px)",
}

const posterStyle = {
  height: "140px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "16px",
  marginBottom: "14px",
  background: "rgba(162, 203, 255, 0.82)",
}

const posterIconStyle = {
  fontSize: "46px",
}

const cardTitleStyle = {
  marginBottom: "8px",
  color: "#171127",
  fontSize: "20px",
}

const cardMetaStyle = {
  marginBottom: "6px",
  color: "#5d6475",
}

const distanceStyle = {
  marginBottom: "6px",
  color: "#5a4bff",
  fontWeight: "700",
}

const availabilityStyle = {
  marginBottom: "6px",
  color: "#1f7a45",
  fontWeight: "700",
}

const listingModeStyle = (isLive?: string) => ({
  display: "inline-block",
  marginBottom: "8px",
  padding: "6px 10px",
  borderRadius: "999px",
  background: isLive ? "#e8f7eb" : "#fff0e3",
  color: isLive ? "#216e39" : "#d76a00",
  fontWeight: "700",
  fontSize: "12px",
})

const priceStyle = {
  margin: "12px 0 14px",
  color: "#ff7a00",
  fontWeight: "700",
  fontSize: "16px",
}

const statusTextStyle = {
  gridColumn: "1 / -1",
  margin: 0,
  color: "#5d6475",
}

const actionStyle = {
  display: "inline-block",
  textDecoration: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "#5a4bff",
  color: "white",
  fontWeight: "700",
}
