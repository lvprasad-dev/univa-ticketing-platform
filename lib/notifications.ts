"use client"

export type AppNotification = {
  id: string
  title: string
  message: string
  createdAt: string
  isRead: boolean
  href?: string
  source?: "system" | "auth" | "events" | "bookings"
}

const notificationsStorageKey = "univa-notifications-v1"
const seededNotificationsKey = "univa-notifications-seeded-v1"
const notificationsChangedEvent = "univa-notifications-changed"
const notificationsChannelName = "univa-notifications"

let notificationsChannel: BroadcastChannel | null = null

const canUseWindow = () => typeof window !== "undefined"

const safeLocalStorageGet = (key: string) => {
  if (!canUseWindow()) {
    return null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeLocalStorageSet = (key: string, value: string) => {
  if (!canUseWindow()) {
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {}
}

const safeSessionStorageGet = (key: string) => {
  if (!canUseWindow()) {
    return null
  }

  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSessionStorageSet = (key: string, value: string) => {
  if (!canUseWindow()) {
    return
  }

  try {
    window.sessionStorage.setItem(key, value)
  } catch {}
}

const getBroadcastChannel = () => {
  if (!canUseWindow() || typeof BroadcastChannel === "undefined") {
    return null
  }

  if (!notificationsChannel) {
    notificationsChannel = new BroadcastChannel(notificationsChannelName)
  }

  return notificationsChannel
}

const dispatchNotificationsChanged = () => {
  if (!canUseWindow()) {
    return
  }

  window.dispatchEvent(new Event(notificationsChangedEvent))
  getBroadcastChannel()?.postMessage({ type: "notifications-updated" })
}

const readNotifications = () => {
  if (!canUseWindow()) {
    return [] as AppNotification[]
  }

  const storedNotifications = safeLocalStorageGet(notificationsStorageKey)

  if (!storedNotifications) {
    return []
  }

  try {
    const parsedNotifications = JSON.parse(storedNotifications) as AppNotification[]
    return Array.isArray(parsedNotifications) ? parsedNotifications : []
  } catch {
    return []
  }
}

const writeNotifications = (notifications: AppNotification[]) => {
  if (!canUseWindow()) {
    return
  }

  safeLocalStorageSet(notificationsStorageKey, JSON.stringify(notifications))
  dispatchNotificationsChanged()
}

export const getNotificationHeading = (notification: AppNotification, index: number) => {
  if (notification.title) {
    return notification.title
  }

  return `Notification ${index + 1}`
}

export const getNotifications = () => readNotifications()

export const getUnreadNotificationCount = () =>
  readNotifications().filter((notification) => !notification.isRead).length

export const seedNotifications = () => {
  if (!canUseWindow()) {
    return
  }

  if (safeSessionStorageGet(seededNotificationsKey) === "true") {
    return
  }

  if (readNotifications().length > 0) {
    safeSessionStorageSet(seededNotificationsKey, "true")
    return
  }

  const now = Date.now()
  const seededNotifications: AppNotification[] = [
    {
      id: `seed-${now}`,
      title: "Welcome to UNIVA",
      message: "Your account is ready. Explore events, travel, and creator tools from one place.",
      createdAt: new Date(now).toISOString(),
      isRead: false,
      href: "/",
      source: "system",
    },
    {
      id: `seed-${now + 1}`,
      title: "Explore Categories",
      message: "Browse movies, travel, darshan, conferences, and festivals near your location.",
      createdAt: new Date(now + 1).toISOString(),
      isRead: false,
      href: "/movies",
      source: "system",
    },
  ]

  writeNotifications(seededNotifications)
  safeSessionStorageSet(seededNotificationsKey, "true")
}

export const pushNotification = (
  notification: Omit<AppNotification, "id" | "createdAt" | "isRead">
) => {
  const notifications = readNotifications()
  const nextNotification: AppNotification = {
    ...notification,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    isRead: false,
  }

  writeNotifications([nextNotification, ...notifications].slice(0, 50))
  return nextNotification
}

export const markAllNotificationsRead = () => {
  const notifications = readNotifications()
  const hasUnreadNotifications = notifications.some((notification) => !notification.isRead)

  if (!hasUnreadNotifications) {
    return
  }

  writeNotifications(
    notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }))
  )
}

export const subscribeToNotifications = (onChange: () => void) => {
  if (!canUseWindow()) {
    return () => undefined
  }

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === notificationsStorageKey) {
      onChange()
    }
  }

  const handleLocalChange = () => onChange()
  const channel = getBroadcastChannel()
  const handleBroadcastChange = () => onChange()

  window.addEventListener("storage", handleStorageChange)
  window.addEventListener(notificationsChangedEvent, handleLocalChange)
  channel?.addEventListener("message", handleBroadcastChange)

  return () => {
    window.removeEventListener("storage", handleStorageChange)
    window.removeEventListener(notificationsChangedEvent, handleLocalChange)
    channel?.removeEventListener("message", handleBroadcastChange)
  }
}
