"use client"

import Image from "next/image"
import { ChangeEvent, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { supabase } from "@/lib/supabaseClient"

const profilePhotoKey = "univa-profile-photo"

export default function ProfilePage() {
  const [profileName, setProfileName] = useState("Guest User")
  const [profileEmail, setProfileEmail] = useState("")
  const [editableName, setEditableName] = useState("Guest User")
  const [editableEmail, setEditableEmail] = useState("")
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [enableCurrentPasswordInput, setEnableCurrentPasswordInput] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const profilePhoto = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") {
        return () => undefined
      }

      const handleStorageChange = (event: StorageEvent) => {
        if (!event.key || event.key === profilePhotoKey) {
          onStoreChange()
        }
      }

      window.addEventListener("storage", handleStorageChange)

      return () => {
        window.removeEventListener("storage", handleStorageChange)
      }
    },
    () => window.localStorage.getItem(profilePhotoKey) || "",
    () => ""
  )

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      const resolvedName =
        session?.user.user_metadata?.full_name ||
        session?.user.email?.split("@")[0] ||
        "Guest User"
      const resolvedEmail = session?.user.email || ""

      setProfileName(resolvedName)
      setEditableName(resolvedName)
      setProfileEmail(resolvedEmail)
      setEditableEmail(resolvedEmail)
    }

    loadSession()

    return () => {
      isMounted = false
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

      window.localStorage.setItem(profilePhotoKey, imageUrl)
      window.dispatchEvent(new StorageEvent("storage", { key: profilePhotoKey }))
    }

    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async () => {
    setMessage("")

    const trimmedName = editableName.trim()
    const trimmedEmail = editableEmail.trim()

    if (!trimmedName) {
      setMessage("Full name is required.")
      return
    }

    if (!trimmedEmail) {
      setMessage("Email is required.")
      return
    }

    const updatePayload: {
      data: { full_name: string }
      email?: string
    } = {
      data: { full_name: trimmedName },
    }

    if (trimmedEmail !== profileEmail) {
      updatePayload.email = trimmedEmail
    }

    const { error } = await supabase.auth.updateUser(updatePayload)

    if (error) {
      setMessage(error.message)
      return
    }

    setProfileName(trimmedName)
    setProfileEmail(trimmedEmail)
    setEditableName(trimmedName)
    setEditableEmail(trimmedEmail)
    setIsEditingName(false)
    setIsEditingEmail(false)
    setMessage(
      trimmedEmail !== profileEmail
        ? "Profile updated. Check your inbox if email confirmation is required."
        : "Profile updated successfully."
    )
  }

  const handlePasswordChange = async () => {
    setPasswordMessage("")

    if (!currentPassword) {
      setPasswordMessage("Current password is required.")
      return
    }

    if (newPassword.length < 6) {
      setPasswordMessage("New password must be at least 6 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirm password must match.")
      return
    }

    if (newPassword === currentPassword) {
      setPasswordMessage("New password must be different from current password.")
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profileEmail,
      password: currentPassword,
    })

    if (signInError) {
      setPasswordMessage("Current password is incorrect.")
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      setPasswordMessage(error.message)
      return
    }

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowPasswordForm(false)
    setPasswordMessage("Password updated successfully.")
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Profile</h1>
          <p style={subtitleStyle}>Update your personal details, photo, and password.</p>
        </div>

        <div style={contentStyle}>
          <div style={avatarColumnStyle}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={avatarButtonStyle}
            >
              {profilePhoto ? (
                <Image
                  src={profilePhoto}
                  alt={`${profileName} profile`}
                  width={110}
                  height={110}
                  style={avatarImageStyle}
                  unoptimized
                />
              ) : (
                <div style={avatarFallbackStyle}>{profileName.charAt(0).toUpperCase()}</div>
              )}
              <span style={avatarEditIconStyle}>✎</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              style={hiddenInputStyle}
            />
          </div>

          <div style={formStyle}>
            <div style={fieldStyle}>
              <span style={labelStyle}>Full Name</span>
              <div style={inputWrapStyle}>
                <input
                  type="text"
                  value={editableName}
                  onChange={(event) => setEditableName(event.target.value)}
                  readOnly={!isEditingName}
                  style={isEditingName ? editableInputWithIconStyle : readonlyInputWithIconStyle}
                />
                <button
                  type="button"
                  onClick={() => setIsEditingName((current) => !current)}
                  style={inputEditIconButtonStyle}
                >
                  ✎
                </button>
              </div>
            </div>

            <div style={fieldStyle}>
              <span style={labelStyle}>Email</span>
              <div style={inputWrapStyle}>
                <input
                  type="email"
                  value={editableEmail || "Signed out"}
                  onChange={(event) => setEditableEmail(event.target.value)}
                  readOnly={!isEditingEmail}
                  style={isEditingEmail ? editableInputWithIconStyle : readonlyInputWithIconStyle}
                />
                <button
                  type="button"
                  onClick={() => setIsEditingEmail((current) => !current)}
                  style={inputEditIconButtonStyle}
                >
                  ✎
                </button>
              </div>
            </div>

            <div style={actionsRowStyle}>
              <button type="button" onClick={handleSaveProfile} style={saveButtonStyle}>
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm((current) => !current)
                  setCurrentPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                  setEnableCurrentPasswordInput(false)
                  setPasswordMessage("")
                }}
                style={secondaryButtonStyle}
              >
                Change Password
              </button>
            </div>

            {message && (
              <p
                style={
                  message.toLowerCase().includes("successfully") ||
                  message.toLowerCase().includes("check your inbox")
                    ? successMessageStyle
                    : errorMessageStyle
                }
              >
                {message}
              </p>
            )}

            {showPasswordForm && (
              <div style={passwordCardStyle}>
                <h2 style={passwordTitleStyle}>Change Password</h2>
                <div style={fieldStyle}>
                  <span style={labelStyle}>Current Password</span>
                  <div style={inputWrapStyle}>
                    <input
                      name="manual-current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      autoComplete="new-password"
                      readOnly={!enableCurrentPasswordInput}
                      onFocus={() => setEnableCurrentPasswordInput(true)}
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      style={editableInputWithIconStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((current) => !current)}
                      style={inputEditIconButtonStyle}
                    >
                      {showCurrentPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <div style={fieldStyle}>
                  <span style={labelStyle}>New Password</span>
                  <div style={inputWrapStyle}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="off"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      style={editableInputWithIconStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((current) => !current)}
                      style={inputEditIconButtonStyle}
                    >
                      {showNewPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <div style={fieldStyle}>
                  <span style={labelStyle}>Confirm Password</span>
                  <div style={inputWrapStyle}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="off"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      style={editableInputWithIconStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                      style={inputEditIconButtonStyle}
                    >
                      {showConfirmPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  style={saveButtonStyle}
                >
                  Update Password
                </button>
              </div>
            )}

            {passwordMessage && (
              <p
                style={
                  passwordMessage.toLowerCase().includes("successfully")
                    ? successMessageStyle
                    : errorMessageStyle
                }
              >
                {passwordMessage.toLowerCase().includes("successfully")
                  ? `✓ ${passwordMessage}`
                  : passwordMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

const pageStyle = {
  marginTop: "72px",
  minHeight: "100vh",
  padding: "32px 32px 32px 340px",
  background: "#fff8f2",
}

const cardStyle = {
  maxWidth: "980px",
  margin: "0 auto",
  padding: "32px",
  borderRadius: "26px",
  background: "white",
  boxShadow: "0 18px 36px rgba(150,92,52,0.08)",
}

const headerStyle = {
  marginBottom: "24px",
}

const titleStyle = {
  margin: "0 0 8px",
  color: "#2f1b14",
}

const subtitleStyle = {
  margin: 0,
  color: "#7b5a4d",
}

const contentStyle = {
  display: "grid",
  gridTemplateColumns: "220px 1fr",
  gap: "28px",
  alignItems: "start",
}

const avatarColumnStyle = {
  display: "grid",
  justifyItems: "center",
  gap: "12px",
}

const avatarButtonStyle = {
  position: "relative" as const,
  border: "none",
  background: "transparent",
  padding: 0,
  cursor: "pointer",
}

const avatarImageStyle = {
  width: "110px",
  height: "110px",
  borderRadius: "999px",
  objectFit: "cover" as const,
}

const avatarFallbackStyle = {
  width: "110px",
  height: "110px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "linear-gradient(135deg, #6c63ff, #ff9b6a)",
  color: "white",
  fontSize: "40px",
  fontWeight: "700",
}

const avatarEditIconStyle = {
  position: "absolute" as const,
  right: "2px",
  bottom: "4px",
  width: "30px",
  height: "30px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "#ff7a00",
  color: "white",
  fontSize: "14px",
  boxShadow: "0 8px 18px rgba(255,122,0,0.22)",
}

const hiddenInputStyle = {
  display: "none",
}

const formStyle = {
  display: "grid",
  gap: "16px",
}

const fieldStyle = {
  display: "grid",
  gap: "8px",
}

const labelStyle = {
  color: "#5f4032",
  fontWeight: "700",
}

const inputWrapStyle = {
  position: "relative" as const,
}

const editIconButtonStyle = {
  border: "none",
  background: "#fff2e8",
  color: "#ff7a00",
  width: "30px",
  height: "30px",
  borderRadius: "999px",
  cursor: "pointer",
  fontWeight: "700",
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "14px",
  border: "1px solid #f0c7b2",
  background: "#fffaf7",
}

const editableInputWithIconStyle = {
  ...inputStyle,
  paddingRight: "50px",
}

const readonlyInputStyle = {
  ...inputStyle,
  background: "#f8f4ff",
  color: "#6c6487",
}

const readonlyInputWithIconStyle = {
  ...readonlyInputStyle,
  paddingRight: "50px",
}

const inputEditIconButtonStyle = {
  ...editIconButtonStyle,
  position: "absolute" as const,
  top: "50%",
  right: "10px",
  transform: "translateY(-50%)",
}

const actionsRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap" as const,
}

const saveButtonStyle = {
  justifySelf: "start",
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "#ff7a00",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
}

const secondaryButtonStyle = {
  border: "1px solid #5a4bff",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "white",
  color: "#5a4bff",
  cursor: "pointer",
  fontWeight: "700",
}

const passwordCardStyle = {
  display: "grid",
  gap: "14px",
  padding: "20px",
  borderRadius: "18px",
  background: "#fffaf7",
  border: "1px solid #f3ddcf",
}

const passwordTitleStyle = {
  margin: 0,
  color: "#2f1b14",
  fontSize: "20px",
}

const successMessageStyle = {
  margin: 0,
  color: "#1f9d55",
  fontWeight: "700",
}

const errorMessageStyle = {
  margin: 0,
  color: "#d14343",
  fontWeight: "700",
}
