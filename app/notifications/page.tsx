"use client"

import { useEffect, useState } from "react"

type NotificationItem = {
  id: string
  message: string
}

const notificationsStorageKey = "univa-navbar-notifications"
const notificationsClearedEvent = "univa-notifications-cleared"

const getNotificationHeading = (message: string, index: number) => {
  if (message.toLowerCase().includes("welcome back")) {
    return "Welcome Back"
  }

  if (message.toLowerCase().includes("welcome to univa")) {
    return "Welcome to UNIVA"
  }

  if (message.toLowerCase().includes("movies") || message.toLowerCase().includes("travel")) {
    return "Fresh Updates"
  }

  if (message.toLowerCase().includes("create event")) {
    return "Creator Tools"
  }

  return `Notification ${index + 1}`
}

export default function NotificationsPage() {
  const [notifications] = useState<NotificationItem[]>(() => {
    if (typeof window === "undefined") {
      return []
    }

    const storedNotifications = window.localStorage.getItem(notificationsStorageKey)

    if (!storedNotifications) {
      return []
    }

    try {
      return JSON.parse(storedNotifications) as NotificationItem[]
    } catch {
      return []
    }
  })
  const [activeId, setActiveId] = useState<string>(notifications[0]?.id || "")

  useEffect(() => {
    window.localStorage.setItem(notificationsStorageKey, "[]")
    window.dispatchEvent(new Event(notificationsClearedEvent))
  }, [])

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "96px 24px 32px",
        background:
          "radial-gradient(circle at top left, rgba(108,99,255,0.18), transparent 38%), radial-gradient(circle at top right, rgba(255,122,0,0.18), transparent 34%), #f8f7ff",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <section
        style={{
          width: "min(460px, 100%)",
          padding: "32px",
          borderRadius: "24px",
          background: "rgba(255,255,255,0.94)",
          boxShadow: "-18px 20px 40px rgba(58, 40, 110, 0.10)",
          border: "1px solid #ece7fb",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            color: "#ff7a00",
            fontSize: "14px",
            fontWeight: "700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Notifications
        </p>
        <h1
          style={{
            margin: "0 0 16px",
            color: "#221a3c",
            fontSize: "28px",
            lineHeight: 1.2,
          }}
        >
          Hello user, welcome to UNIVA.
        </h1>
        <p
          style={{
            margin: "0 0 22px",
            color: "#5b5476",
            fontSize: "16px",
            lineHeight: 1.7,
          }}
        >
          Every important update appears here first. Open any notification below
          to read the full information and keep track of what is happening inside
          UNIVA.
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => {
              const isActive = notification.id === activeId

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() =>
                    setActiveId((current) =>
                      current === notification.id ? "" : notification.id
                    )
                  }
                  style={{
                    textAlign: "left" as const,
                    border: "1px solid #ece7fb",
                    borderRadius: "18px",
                    background: isActive ? "#fff7f0" : "#f8f5ff",
                    padding: "16px 18px",
                    cursor: "pointer",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#221a3c",
                      fontSize: "16px",
                      fontWeight: "700",
                    }}
                  >
                    {getNotificationHeading(notification.message, index)}
                  </p>
                  {isActive && (
                    <p
                      style={{
                        margin: "10px 0 0",
                        color: "#5b5476",
                        fontSize: "15px",
                        lineHeight: 1.7,
                      }}
                    >
                      {notification.message}
                    </p>
                  )}
                </button>
              )
            })
          ) : (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "16px",
                background: "#f8f5ff",
                border: "1px solid #ece7fb",
                color: "#6a6482",
              }}
            >
              No notifications right now.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
