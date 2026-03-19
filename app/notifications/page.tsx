"use client"

import { useState } from "react"

type NotificationItem = {
  id: string
  message: string
}

const notificationsStorageKey = "univa-navbar-notifications"

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
          width: "min(420px, 100%)",
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
          You are now inside a platform built to keep every important update in
          one place. Stay ready for event alerts, booking reminders, and fresh
          activity that helps you move faster, discover more, and enjoy a
          smoother UNIVA experience every time you return.
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                style={{
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: "#f8f5ff",
                  border: "1px solid #ece7fb",
                  color: "#2c2447",
                  lineHeight: 1.6,
                }}
              >
                {notification.message}
              </div>
            ))
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
