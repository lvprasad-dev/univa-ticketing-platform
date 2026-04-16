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
const emptyNotifications: AppNotification[] = []

let notificationsChannel: BroadcastChannel | null = null
let cachedNotificationsRaw = ""
let cachedNotifications: AppNotification[] = emptyNotifications

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
    return emptyNotifications
  }

  const storedNotifications = safeLocalStorageGet(notificationsStorageKey)

  if (!storedNotifications) {
    cachedNotificationsRaw = ""
    cachedNotifications = emptyNotifications
    return cachedNotifications
  }

  if (storedNotifications === cachedNotificationsRaw) {
    return cachedNotifications
  }

  try {
    const parsedNotifications = JSON.parse(storedNotifications) as AppNotification[]
    cachedNotificationsRaw = storedNotifications
    cachedNotifications = Array.isArray(parsedNotifications)
      ? parsedNotifications
      : emptyNotifications
    return cachedNotifications
  } catch {
    cachedNotificationsRaw = storedNotifications
    cachedNotifications = emptyNotifications
    return cachedNotifications
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

export const retainBookingNotificationsOnly = () => {
  const notifications = readNotifications()
  const nextNotifications = notifications.filter(
    (notification) => notification.source === "bookings"
  )

  if (nextNotifications.length !== notifications.length) {
    writeNotifications(nextNotifications)
  }
}

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

export const clearAllNotifications = () => {
  writeNotifications([])
}

export const markNotificationRead = (notificationId: string) => {
  const notifications = readNotifications()
  let hasChanged = false

  const nextNotifications = notifications.map((notification) => {
    if (notification.id !== notificationId || notification.isRead) {
      return notification
    }

    hasChanged = true

    return {
      ...notification,
      isRead: true,
    }
  })

  if (hasChanged) {
    writeNotifications(nextNotifications)
  }
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
