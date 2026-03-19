"use client"

import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import Link from "next/link"
import Image from "next/image"
import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type City = {
  name: string
  lat: number
  lon: number
}

type LocationAddress = Partial<
  Record<
    "suburb" | "neighbourhood" | "hamlet" | "village" | "city_district" |
    "city" | "town" | "county" | "state_district" | "state",
    string
  >
>

type NavbarNotification = {
  id: string
  message: string
}

const cities = [
  { name: "Guntur", lat: 16.3067, lon: 80.4365 },
  { name: "Vijayawada", lat: 16.5062, lon: 80.648 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
] satisfies City[]

const DEFAULT_CITY = cities[0].name
const profilePhotoKey = "univa-profile-photo"
const sidebarOpenKey = "univa-sidebar-open"
const selectedLocationKey = "univa-selected-location"
const selectedLocationEvent = "univa-location-change"
const hasLoggedInBeforeKey = "univa-has-logged-in-before"
const loginHandledKey = "univa-login-handled"
const seededNotificationsKey = "univa-seeded-notifications-v2"
const notificationsStorageKey = "univa-navbar-notifications"
const ticketingLinks = [
  { href: "/movies", label: "Movies" },
  { href: "/travel", label: "Travel" },
  { href: "/darshan", label: "Darshan" },
  { href: "/conferences", label: "Conferences" },
  { href: "/festivals", label: "Festivals" },
]
const headerLinks = [
  { href: "/", label: "Home" },
  { href: "/organizer/create-event", label: "Create Event" },
  { href: "/my-events", label: "My Events" },
]

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

  return (
    2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  )
}

const getNearestCity = (lat: number, lon: number) => {
  return cities.reduce(
    (nearestCity, city) => {
      const currentDistance = getDistance(lat, lon, city.lat, city.lon)

      if (currentDistance < nearestCity.distance) {
        return {
          name: city.name,
          distance: currentDistance,
        }
      }

      return nearestCity
    },
    { name: DEFAULT_CITY, distance: Number.POSITIVE_INFINITY }
  ).name
}

const formatLocationLabel = (address?: LocationAddress) => {
  if (!address) {
    return null
  }

  const area =
    address.suburb ||
    address.neighbourhood ||
    address.hamlet ||
    address.village ||
    address.city_district

  const city =
    address.city ||
    address.town ||
    address.county ||
    address.state_district ||
    address.state

  if (area && city && area !== city) {
    return `${area}, ${city}`
  }

  return city || area || null
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const isLoginPage = pathname === "/login"
  const isProfilePage = pathname === "/profile"
  const isTicketingCategoryPage = ticketingLinks.some((link) => link.href === pathname)
  const isSimpleNavbarPage = isLoginPage || isTicketingCategoryPage

  const [location, setLocation] = useState("Detecting...")
  const [showCities, setShowCities] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [profileName, setProfileName] = useState("Guest User")
  const [profileEmail, setProfileEmail] = useState("")
  const [profilePhoto, setProfilePhoto] = useState("")
  const [showEditPicAction, setShowEditPicAction] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<NavbarNotification[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const navLinks = [
    { href: "/profile", label: "Profile" },
    { href: "/", label: "Home" },
    { href: "/organizer/create-event", label: "Create Event" },
    { href: "/my-events", label: "My Events" },
  ]

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(DEFAULT_CITY)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude

        try {
          const res = await fetch(
            `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`
          )

          if (!res.ok) {
            throw new Error("Reverse geocoding failed")
          }

          const data = await res.json()
          const detectedLocation = formatLocationLabel(data.address)

          setLocation(detectedLocation ?? getNearestCity(lat, lon))
        } catch {
          setLocation(getNearestCity(lat, lon))
        }
      },
      () => {
        setLocation(DEFAULT_CITY)
      }
    )
  }, [])

  useEffect(() => {
    const savedLocation = window.localStorage.getItem(selectedLocationKey)

    if (savedLocation) {
      setLocation(savedLocation)
      return
    }

    const timer = setTimeout(() => {
      detectLocation()
    }, 0)

    return () => clearTimeout(timer)
  }, [detectLocation])

  useEffect(() => {
    if (location !== "Detecting...") {
      window.localStorage.setItem(selectedLocationKey, location)
      window.dispatchEvent(new Event(selectedLocationEvent))
    }
  }, [location])

  useEffect(() => {
    if (window.sessionStorage.getItem(sidebarOpenKey) === "true" && !isSimpleNavbarPage) {
      setShowSidebar(true)
    }
  }, [isSimpleNavbarPage])

  useEffect(() => {
    const storedNotifications = window.localStorage.getItem(notificationsStorageKey)

    if (storedNotifications) {
      try {
        const parsedNotifications = JSON.parse(storedNotifications) as NavbarNotification[]
        setNotifications(parsedNotifications)
        return
      } catch {
        window.localStorage.removeItem(notificationsStorageKey)
      }
    }

    if (window.sessionStorage.getItem(seededNotificationsKey) === "true") {
      return
    }

    const seededNotifications = [
      { id: "seed-1", message: "Welcome to UNIVA. Your account is ready to explore events." },
      { id: "seed-2", message: "New movies and travel updates are waiting for you." },
      { id: "seed-3", message: "Create Event tools are available whenever you are ready." },
      { id: "seed-4", message: "Check notifications often to stay updated with new activity." },
    ]

    setNotifications(seededNotifications)
    window.localStorage.setItem(
      notificationsStorageKey,
      JSON.stringify(seededNotifications)
    )
    window.sessionStorage.setItem(seededNotificationsKey, "true")
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      notificationsStorageKey,
      JSON.stringify(notifications)
    )
  }, [notifications])

  useEffect(() => {
    const savedProfilePhoto = window.localStorage.getItem(profilePhotoKey)

    if (savedProfilePhoto) {
      setProfilePhoto(savedProfilePhoto)
    }

    let isMounted = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (isMounted) {
        const resolvedName =
          session?.user.user_metadata?.full_name ||
          session?.user.email?.split("@")[0] ||
          "Guest User"
        setIsLoggedIn(Boolean(session))
        setProfileName(resolvedName)
        setProfileEmail(session?.user.email || "")

        if (!session) {
          window.sessionStorage.removeItem(loginHandledKey)
        }
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        const resolvedName =
          session?.user.user_metadata?.full_name ||
          session?.user.email?.split("@")[0] ||
          "Guest User"
        setIsLoggedIn(Boolean(session))
        setProfileName(resolvedName)
        setProfileEmail(session?.user.email || "")

        if (event === "SIGNED_IN" && session) {
          const hasLoggedInBefore =
            window.localStorage.getItem(hasLoggedInBeforeKey) === "true"
          const alreadyHandledInSession =
            window.sessionStorage.getItem(loginHandledKey) === "true"

          if (!alreadyHandledInSession) {
            setNotifications((current) => [
              {
                id: `${Date.now()}`,
                message: hasLoggedInBefore
                  ? `Welcome back, ${resolvedName}!`
                  : `Welcome to UNIVA, ${resolvedName}!`,
              },
              ...current,
            ])
            window.localStorage.setItem(hasLoggedInBeforeKey, "true")
            window.sessionStorage.setItem(loginHandledKey, "true")
          }
        }

        if (event === "SIGNED_OUT") {
          window.sessionStorage.removeItem(loginHandledKey)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleProfilePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const imageUrl = typeof reader.result === "string" ? reader.result : ""

      if (!imageUrl) {
        return
      }

      setProfilePhoto(imageUrl)
      window.localStorage.setItem(profilePhotoKey, imageUrl)
    }

    reader.readAsDataURL(file)
  }

  const activeTab = {
    paddingTop: "6px",
    borderTop: "4px solid orange",
    borderRadius: "12px 12px 0 0",
    textDecoration: "none",
    color: "black",
    fontWeight: "500",
  }

  const normalTab = {
    textDecoration: "none",
    color: "black",
    paddingTop: "6px",
  }

  const handleLogout = async () => {
    window.sessionStorage.removeItem(sidebarOpenKey)
    window.sessionStorage.removeItem(loginHandledKey)
    await supabase.auth.signOut()
    setShowSidebar(false)
    router.push("/")
  }

  const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return
    }

    const routeMap = [
      { keywords: ["home"], href: "/" },
      { keywords: ["movie", "movies", "cinema"], href: "/movies" },
      { keywords: ["travel", "trip", "tour"], href: "/travel" },
      { keywords: ["darshan", "temple", "devotional"], href: "/darshan" },
      { keywords: ["conference", "conferences", "seminar"], href: "/conferences" },
      { keywords: ["festival", "festivals", "event"], href: "/festivals" },
      { keywords: ["create", "create event", "organizer"], href: "/organizer/create-event" },
      { keywords: ["my events", "events"], href: "/my-events" },
      { keywords: ["search"], href: "/search" },
    ]

    const matchedRoute = routeMap.find((route) =>
      route.keywords.some(
        (keyword) =>
          normalizedQuery === keyword ||
          normalizedQuery.includes(keyword) ||
          keyword.includes(normalizedQuery)
      )
    )

    const targetRoute = matchedRoute?.href || "/search"

    if (targetRoute === pathname) {
      router.refresh()
      return
    }

    router.push(targetRoute)
    setSearchQuery("")

    window.setTimeout(() => {
      if (window.location.pathname !== targetRoute) {
        window.location.href = targetRoute
      }
    }, 150)
  }

  return (
    <>
      {showSidebar && !isSimpleNavbarPage && (
        <>
          {!isProfilePage && (
            <div
              style={sidebarBackdrop}
              onClick={() => {
                window.sessionStorage.removeItem(sidebarOpenKey)
                setShowSidebar(false)
              }}
            />
          )}
          <aside style={sidebarStyle}>
            <div style={sidebarHeaderStyle}>
              <div />
              <button
                type="button"
                onClick={() => {
                  window.sessionStorage.removeItem(sidebarOpenKey)
                  setShowSidebar(false)
                }}
                style={sidebarCloseStyle}
              >
                x
              </button>
            </div>

            <div style={profileCardStyle}>
              <button
                type="button"
                onClick={() => setShowEditPicAction((current) => !current)}
                style={profileAvatarButtonStyle}
              >
                {profilePhoto ? (
                  <Image
                    src={profilePhoto}
                    alt={`${profileName} profile`}
                    width={72}
                    height={72}
                    style={profileAvatarImageStyle}
                    unoptimized
                  />
                ) : (
                  <div style={profileAvatarStyle}>
                    {profileName.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                style={hiddenInputStyle}
              />
              {showEditPicAction && (
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click()
                    setShowEditPicAction(false)
                  }}
                  style={editPicButtonStyle}
                >
                  Edit Pic
                </button>
              )}
              <p style={profileNameStyle}>{profileName}</p>
              <p style={profileEmailStyle}>{profileEmail || "Signed out"}</p>
            </div>

            <div style={sidebarLinksStyle}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href === "/profile") {
                      window.sessionStorage.setItem(sidebarOpenKey, "true")
                      return
                    }

                    window.sessionStorage.removeItem(sidebarOpenKey)
                    if (link.href !== "/profile") {
                      setShowSidebar(false)
                    }
                  }}
                  style={pathname === link.href ? sidebarActiveLink : sidebarLink}
                >
                  {link.label}
                </Link>
              ))}
              {isLoggedIn && (
                <button type="button" onClick={handleLogout} style={sidebarLogoutButtonStyle}>
                  Logout
                </button>
              )}
            </div>
          </aside>
        </>
      )}

      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          padding: "12px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "white",
          borderBottom: "1px solid #ddd",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isSimpleNavbarPage && (
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={backArrowStyle}>{"\u2190"}</span>
            </Link>
          )}

          {!isSimpleNavbarPage && (
            <button
              type="button"
              onClick={() => setShowSidebar(true)}
              style={menuButtonStyle}
            >
              <span style={menuLine} />
              <span style={menuLine} />
              <span style={menuLine} />
            </button>
          )}

          <Image src="/Univa logo.png" alt="Univa Logo" width={60} height={45} />

          <h2
            style={{
              margin: 0,
              marginLeft: "-20px",
              fontSize: "22px",
              fontWeight: "700",
              letterSpacing: "2px",
            }}
          >
            UNIVA
          </h2>
        </div>

        {isTicketingCategoryPage && (
          <div style={moviesNavLinksStyle}>
            {ticketingLinks.map((link) => (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                style={pathname === link.href ? activeMovieChipStyle : movieChipStyle}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {!isSimpleNavbarPage && (
          <>
            <form
              onSubmit={handleSearch}
              style={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setShowCities(!showCities)}
                  style={{
                    padding: "8px 12px",
                    background: "#eee",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {location}
                </button>

                {showCities && (
                  <div
                    style={{
                      position: "absolute",
                      top: "40px",
                      background: "white",
                      border: "1px solid #ddd",
                      borderRadius: "6px",
                      width: "150px",
                    }}
                  >
                    {cities.map((city) => (
                      <div
                        key={city.name}
                        onClick={() => {
                          setLocation(city.name)
                          setShowCities(false)
                        }}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                        }}
                      >
                        {city.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                style={{
                  padding: "8px 10px",
                  width: "220px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />

              <button
                type="submit"
                style={{
                  background: "#ff7a00",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Search
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
                {headerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    style={pathname === link.href ? activeTab : normalTab}
                  >
                    {link.label}
                  </Link>
                ))}

                <button
                  type="button"
                    onClick={() => {
                      setNotifications([])
                      window.localStorage.setItem(notificationsStorageKey, "[]")
                      router.push("/notifications")
                    }}
                  style={notificationButtonStyle}
                >
                  <span style={notificationIconStyle}>{"\u{1F514}"}</span>
                  {notifications.length > 0 && (
                    <span style={notificationBadgeStyle}>{notifications.length}</span>
                  )}
                </button>
              </div>

              {!isLoggedIn && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link href="/login">
                    <button style={outlineAuthButtonStyle}>Login</button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </>
  )
}

const backArrowStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "36px",
  height: "36px",
  borderRadius: "999px",
  border: "1px solid #d6d6d6",
  background: "white",
  fontSize: "26px",
  fontWeight: "700",
  lineHeight: 1,
  cursor: "pointer",
  color: "black",
  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
}

const menuButtonStyle = {
  cursor: "pointer",
  marginRight: "10px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
  gap: "4px",
  border: "none",
  background: "transparent",
  padding: 0,
}

const outlineAuthButtonStyle = {
  border: "1px solid #6c63ff",
  background: "white",
  padding: "6px 14px",
  borderRadius: "6px",
  cursor: "pointer",
}

const menuLine = {
  display: "block",
  width: "20px",
  height: "2px",
  background: "#111",
  borderRadius: "999px",
}

const sidebarBackdrop = {
  position: "fixed" as const,
  inset: 0,
  background: "rgba(24, 18, 46, 0.34)",
  zIndex: 1090,
}

const sidebarStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "290px",
  height: "100vh",
  padding: "24px 18px",
  background: "linear-gradient(180deg, #ffffff, #f6f1ff)",
  boxShadow: "18px 0 40px rgba(46, 30, 99, 0.16)",
  zIndex: 1100,
}

const sidebarHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: "24px",
}

const sidebarCloseStyle = {
  border: "none",
  background: "white",
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  cursor: "pointer",
  color: "#241c3e",
  boxShadow: "0 6px 14px rgba(80,52,145,0.1)",
}

const sidebarLinksStyle = {
  display: "grid",
  gap: "10px",
}

const profileCardStyle = {
  display: "grid",
  justifyItems: "center",
  padding: "14px 12px",
  marginBottom: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.88)",
  boxShadow: "0 10px 24px rgba(80,52,145,0.08)",
}

const profileAvatarButtonStyle = {
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
  marginBottom: "8px",
}

const profileAvatarStyle = {
  width: "60px",
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #6c63ff, #ff9b6a)",
  color: "white",
  fontSize: "24px",
  fontWeight: "700",
}

const profileAvatarImageStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "999px",
  objectFit: "cover" as const,
}

const profileNameStyle = {
  margin: "0 0 2px",
  color: "#241c3e",
  fontWeight: "700",
  fontSize: "14px",
}

const profileEmailStyle = {
  margin: 0,
  color: "#6c6487",
  fontSize: "12px",
}

const editPicButtonStyle = {
  marginBottom: "10px",
  border: "none",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "#5a4bff",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
}

const hiddenInputStyle = {
  display: "none",
}

const sidebarLink = {
  textDecoration: "none",
  padding: "14px 16px",
  borderRadius: "16px",
  color: "#4d446f",
  background: "rgba(255,255,255,0.78)",
}

const sidebarActiveLink = {
  ...sidebarLink,
  color: "#241c3e",
  background: "linear-gradient(135deg, rgba(111,117,255,0.18), rgba(255,181,140,0.18))",
  fontWeight: "700",
}

const notificationButtonStyle = {
  position: "relative" as const,
  border: "none",
  background: "white",
  width: "34px",
  height: "34px",
  padding: 0,
  borderRadius: "999px",
  cursor: "pointer",
  boxShadow: "0 6px 14px rgba(80,52,145,0.1)",
  color: "#3a2e67",
}

const notificationIconStyle = {
  fontSize: "18px",
  lineHeight: 1,
}

const notificationBadgeStyle = {
  position: "absolute" as const,
  top: "-4px",
  right: "-4px",
  minWidth: "18px",
  height: "18px",
  padding: "0 5px",
  borderRadius: "999px",
  background: "#e53935",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: "700",
}

const sidebarLogoutButtonStyle = {
  justifySelf: "center",
  border: "none",
  padding: "12px 28px",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #ff7a00, #ff9b45)",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
  textAlign: "center" as const,
  boxShadow: "0 12px 24px rgba(255,122,0,0.22)",
}

const moviesNavLinksStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap" as const,
  justifyContent: "flex-end",
  maxWidth: "780px",
}

const movieChipStyle = {
  textDecoration: "none",
  padding: "10px 16px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.96)",
  color: "#4c4270",
  border: "1px solid #ff7a00",
  boxShadow: "0 8px 20px rgba(255,122,0,0.12)",
  fontSize: "14px",
  fontWeight: "600",
}

const activeMovieChipStyle = {
  ...movieChipStyle,
  background: "#ff7a00",
  color: "white",
}
