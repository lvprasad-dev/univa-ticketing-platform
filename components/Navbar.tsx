"use client"

import { AuthChangeEvent, Session } from "@supabase/supabase-js"
import Link from "next/link"
import Image from "next/image"
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  getNotificationHeading,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  pushNotification,
  subscribeToNotifications,
  type AppNotification,
} from "@/lib/notifications"
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

const cities = [
  { name: "Guntur", lat: 16.3067, lon: 80.4365 },
  { name: "Vijayawada", lat: 16.5062, lon: 80.648 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
] satisfies City[]

const DEFAULT_CITY = cities[0].name
const profilePhotoKey = "univa-profile-photo"
const profileDisplayKey = "univa-profile-display"
const sidebarOpenKey = "univa-sidebar-open"
const selectedLocationKey = "univa-selected-location"
const selectedLocationEvent = "univa-location-change"
const hasLoggedInBeforeKey = "univa-has-logged-in-before"
const lastLoginDayKey = "univa-last-login-day"
const loginHandledKey = "univa-login-handled"
const lastAuthNotificationKey = "univa-last-auth-notification"
const inactivityTimeoutMs = 30 * 60 * 1000
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
  { href: "/my-tickets", label: "My Tickets" },
]

const getLocalStorageValue = (key: string) => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const setLocalStorageValue = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value)
  } catch {}
}

const getSessionStorageValue = (key: string) => {
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const setSessionStorageValue = (key: string, value: string) => {
  try {
    window.sessionStorage.setItem(key, value)
  } catch {}
}

const removeSessionStorageValue = (key: string) => {
  try {
    window.sessionStorage.removeItem(key)
  } catch {}
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

const getLocalDayKey = () => {
  const currentDate = new Date()
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, "0")
  const day = String(currentDate.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
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
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false)
  const [activeNotificationId, setActiveNotificationId] = useState("")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const notifications = useSyncExternalStore(
    subscribeToNotifications,
    getNotifications,
    () => [] as AppNotification[]
  )
  const unreadNotificationCount = useSyncExternalStore(
    subscribeToNotifications,
    getUnreadNotificationCount,
    () => 0
  )

  const navLinks = [
    { href: "/profile", label: "Profile" },
    { href: "/", label: "Home" },
    { href: "/organizer/create-event", label: "Create Event" },
    { href: "/my-events", label: "My Events" },
    { href: "/my-tickets", label: "My Tickets" },
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
    const savedLocation = getLocalStorageValue(selectedLocationKey)

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
      setLocalStorageValue(selectedLocationKey, location)
      window.dispatchEvent(new Event(selectedLocationEvent))
    }
  }, [location])

  useEffect(() => {
    if (getSessionStorageValue(sidebarOpenKey) === "true" && !isSimpleNavbarPage) {
      setShowSidebar(true)
    }
  }, [isSimpleNavbarPage])

  const resolvedActiveNotificationId = notifications.some(
    (notification) => notification.id === activeNotificationId
  )
    ? activeNotificationId
    : notifications[0]?.id || ""

  useEffect(() => {
    const savedProfilePhoto = getLocalStorageValue(profilePhotoKey)
    const savedProfileDisplay = getLocalStorageValue(profileDisplayKey)

    if (savedProfilePhoto) {
      setProfilePhoto(savedProfilePhoto)
    }

    if (savedProfileDisplay) {
      try {
        const parsedProfileDisplay = JSON.parse(savedProfileDisplay) as {
          name?: string
          email?: string
        }

        if (parsedProfileDisplay.name) {
          setProfileName(parsedProfileDisplay.name)
        }

        if (parsedProfileDisplay.email) {
          setProfileEmail(parsedProfileDisplay.email)
        }
      } catch {}
    }

    let isMounted = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (isMounted) {
        const cachedProfileDisplay = getLocalStorageValue(profileDisplayKey)
        let resolvedCachedName = ""
        let resolvedCachedEmail = ""

        if (cachedProfileDisplay) {
          try {
            const parsedProfileDisplay = JSON.parse(cachedProfileDisplay) as {
              name?: string
              email?: string
            }
            resolvedCachedName = parsedProfileDisplay.name || ""
            resolvedCachedEmail = parsedProfileDisplay.email || ""
          } catch {}
        }

        const resolvedName =
          resolvedCachedName ||
          session?.user.user_metadata?.full_name ||
          session?.user.email?.split("@")[0] ||
          "Guest User"
        setIsLoggedIn(Boolean(session))
        setProfileName(resolvedName)
        setProfileEmail(resolvedCachedEmail || session?.user.email || "")

        if (!session) {
          removeSessionStorageValue(loginHandledKey)
        }
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        const cachedProfileDisplay = getLocalStorageValue(profileDisplayKey)
        let resolvedCachedName = ""
        let resolvedCachedEmail = ""

        if (cachedProfileDisplay) {
          try {
            const parsedProfileDisplay = JSON.parse(cachedProfileDisplay) as {
              name?: string
              email?: string
            }
            resolvedCachedName = parsedProfileDisplay.name || ""
            resolvedCachedEmail = parsedProfileDisplay.email || ""
          } catch {}
        }

        const resolvedName =
          resolvedCachedName ||
          session?.user.user_metadata?.full_name ||
          session?.user.email?.split("@")[0] ||
          "Guest User"
        setIsLoggedIn(Boolean(session))
        setProfileName(resolvedName)
        setProfileEmail(resolvedCachedEmail || session?.user.email || "")

        if (event === "SIGNED_IN" && session) {
          const currentLoginDay = getLocalDayKey()
          const alreadyHandledInSession =
            getSessionStorageValue(loginHandledKey) === "true"
          const currentAuthMarker = `${session.user.id}:${session.access_token.slice(-12)}`
          const lastAuthMarker = getSessionStorageValue(lastAuthNotificationKey)
          const hasLoggedInBefore = getLocalStorageValue(hasLoggedInBeforeKey) === "true"

          if (!alreadyHandledInSession && lastAuthMarker !== currentAuthMarker) {
            pushNotification({
              title: hasLoggedInBefore ? "Welcome back to UNIVA" : "Welcome to UNIVA",
              message: hasLoggedInBefore
                ? `Welcome back, ${resolvedName}. Your ticketing space is ready with the latest updates, events, and bookings in one place.`
                : `Welcome to UNIVA, ${resolvedName}. Discover events, book tickets, and manage your experience smoothly from one platform.`,
              href: "/notifications",
              source: "auth",
            })
            setLocalStorageValue(hasLoggedInBeforeKey, "true")
            setLocalStorageValue(lastLoginDayKey, currentLoginDay)
            setSessionStorageValue(loginHandledKey, "true")
            setSessionStorageValue(lastAuthNotificationKey, currentAuthMarker)
          }
        }

        if (event === "TOKEN_REFRESHED" && session) {
          setIsLoggedIn(Boolean(session))
          setProfileEmail(resolvedCachedEmail || session?.user.email || "")
        }

        if (event === "SIGNED_OUT") {
          removeSessionStorageValue(loginHandledKey)
          removeSessionStorageValue(lastAuthNotificationKey)
          setProfileName("Guest User")
          setProfileEmail("")
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const handleProfileStorageChange = (event: StorageEvent) => {
      if (event.key !== profileDisplayKey) {
        return
      }

      const cachedProfileDisplay = getLocalStorageValue(profileDisplayKey)

      if (!cachedProfileDisplay) {
        return
      }

      try {
        const parsedProfileDisplay = JSON.parse(cachedProfileDisplay) as {
          name?: string
          email?: string
        }
        setProfileName(parsedProfileDisplay.name || "Guest User")
        setProfileEmail(parsedProfileDisplay.email || "")
      } catch {}
    }

    window.addEventListener("storage", handleProfileStorageChange)

    return () => {
      window.removeEventListener("storage", handleProfileStorageChange)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    let timeoutId = 0

    const resetLogoutTimer = () => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(async () => {
        removeSessionStorageValue(sidebarOpenKey)
        removeSessionStorageValue(loginHandledKey)
        removeSessionStorageValue(lastAuthNotificationKey)
        await supabase.auth.signOut()
        setShowSidebar(false)
        setShowNotificationsPanel(false)
        router.push("/login?message=Session%20expired%20after%2030%20minutes%20of%20inactivity.")
      }, inactivityTimeoutMs)
    }

    const activityEvents: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ]

    for (const activityEvent of activityEvents) {
      window.addEventListener(activityEvent, resetLogoutTimer, { passive: true })
    }

    resetLogoutTimer()

    return () => {
      window.clearTimeout(timeoutId)

      for (const activityEvent of activityEvents) {
        window.removeEventListener(activityEvent, resetLogoutTimer)
      }
    }
  }, [isLoggedIn, router])

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
      setLocalStorageValue(profilePhotoKey, imageUrl)
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
    removeSessionStorageValue(sidebarOpenKey)
    removeSessionStorageValue(loginHandledKey)
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
      { keywords: ["my tickets", "tickets", "bookings", "booked tickets"], href: "/my-tickets" },
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
                removeSessionStorageValue(sidebarOpenKey)
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
                  removeSessionStorageValue(sidebarOpenKey)
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
              <p style={profileEmailStyle}>{profileEmail}</p>
            </div>

            <div style={sidebarLinksStyle}>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (link.href === "/profile") {
                      setSessionStorageValue(sidebarOpenKey, "true")
                      return
                    }

                    removeSessionStorageValue(sidebarOpenKey)
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

            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
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
                    setShowNotificationsPanel(true)
                  }}
                  style={notificationButtonStyle}
                >
                  <span style={notificationIconStyle}>{"\u{1F514}"}</span>
                  {unreadNotificationCount > 0 && (
                    <span style={notificationBadgeStyle}>{unreadNotificationCount}</span>
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

      {showNotificationsPanel && !isSimpleNavbarPage && (
        <aside style={notificationsDrawerStyle}>
          <div style={notificationsDrawerHeaderStyle}>
            <div>
              <p style={notificationsEyebrowStyle}>Notifications</p>
              <p style={notificationsWelcomeStyle}>Welcome, {profileName}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowNotificationsPanel(false)}
              style={notificationsCloseStyle}
            >
              x
            </button>
          </div>

          <div style={notificationsListStyle}>
            {notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const isActive = notification.id === resolvedActiveNotificationId

                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      setActiveNotificationId((current) =>
                        current === notification.id ? "" : notification.id
                      )
                      markNotificationRead(notification.id)
                    }}
                    style={{
                      ...notificationCardStyle,
                      background: isActive ? "#fff7f0" : "#f8f5ff",
                    }}
                    >
                    <p style={notificationHeadingStyle}>
                      {getNotificationHeading(notification, index)}
                    </p>
                    <p style={notificationMetaStyle}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                    {isActive && (
                      <p style={notificationMessageStyle}>{notification.message}</p>
                    )}
                  </button>
                )
              })
            ) : (
              <div style={notificationEmptyCardStyle}>No notifications right now.</div>
            )}
          </div>
        </aside>
      )}
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

const notificationsDrawerStyle = {
  position: "fixed" as const,
  top: "72px",
  right: "24px",
  width: "min(460px, calc(100vw - 32px))",
  maxHeight: "calc(100vh - 96px)",
  overflowY: "auto" as const,
  padding: "24px",
  borderRadius: "24px",
  background: "#ffffff",
  border: "1px solid #f0f0f0",
  zIndex: 1200,
}

const notificationsDrawerHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  marginBottom: "18px",
}

const notificationsEyebrowStyle = {
  margin: 0,
  color: "#ff7a00",
  fontSize: "14px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
}

const notificationsWelcomeStyle = {
  margin: "8px 0 0",
  color: "#5b5476",
  fontSize: "15px",
  fontWeight: "600",
}

const notificationsCloseStyle = {
  background: "#ffffff",
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  cursor: "pointer",
  color: "#241c3e",
  border: "1px solid #f0f0f0",
}

const notificationsListStyle = {
  display: "grid",
  gap: "12px",
}

const notificationCardStyle = {
  textAlign: "left" as const,
  border: "1px solid #ece7fb",
  borderRadius: "18px",
  padding: "16px 18px",
  cursor: "pointer",
}

const notificationHeadingStyle = {
  margin: 0,
  color: "#221a3c",
  fontSize: "16px",
  fontWeight: "700",
}

const notificationMetaStyle = {
  margin: "8px 0 0",
  color: "#8a83a3",
  fontSize: "12px",
}

const notificationMessageStyle = {
  margin: "10px 0 0",
  color: "#5b5476",
  fontSize: "15px",
  lineHeight: 1.7,
}

const notificationEmptyCardStyle = {
  padding: "14px 16px",
  borderRadius: "16px",
  background: "#f8f5ff",
  border: "1px solid #ece7fb",
  color: "#6a6482",
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
