"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  getNotificationHeading,
  getNotifications,
  markNotificationRead,
  subscribeToNotifications,
} from "@/lib/notifications"

export default function NotificationsPage() {
  const notifications = useSyncExternalStore(
    subscribeToNotifications,
    getNotifications,
    () => []
  )
  const [activeId, setActiveId] = useState<string>(notifications[0]?.id || "")

  useEffect(() => {
    let isMounted = true

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!isMounted || !user) {
        return
      }
    }

    loadUser()

    return () => {
      isMounted = false
    }
  }, [])

  const resolvedActiveId = notifications.some((notification) => notification.id === activeId)
    ? activeId
    : notifications[0]?.id || ""

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "96px 24px 32px",
        background: "#ffffff",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <section
        style={{
          width: "min(460px, 100%)",
          padding: "32px",
          borderRadius: "24px",
          background: "#ffffff",
          border: "1px solid #f0f0f0",
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
        <p
          style={{
            margin: "0 0 22px",
            color: "#5b5476",
            fontSize: "15px",
            lineHeight: 1.7,
          }}
        >
          Updates will appear here when they are available.
        </p>

        <div style={{ display: "grid", gap: "12px" }}>
          {notifications.length > 0 ? (
            notifications.map((notification, index) => {
              const isActive = notification.id === resolvedActiveId

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    setActiveId((current) =>
                      current === notification.id ? "" : notification.id
                    )
                    markNotificationRead(notification.id)
                  }}
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
                    {getNotificationHeading(notification, index)}
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#8a83a3",
                      fontSize: "12px",
                    }}
                  >
                    {new Date(notification.createdAt).toLocaleString()}
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



