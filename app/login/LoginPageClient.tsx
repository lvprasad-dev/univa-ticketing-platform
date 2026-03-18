"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type LoginPageClientProps = {
  signupMessage: string
}

export default function LoginPageClient({
  signupMessage,
}: LoginPageClientProps) {
  const [loginType, setLoginType] = useState("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const statusMessage = message || signupMessage

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (loginType === "mobile") {
      setError("Mobile login is not connected yet. Use email and password for now.")
      return
    }

    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    if (!rememberMe) {
      setMessage("Logged in for this browser session.")
    }

    router.push("/")
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Login to UNIVA
        </h2>

        <div style={tabs}>
          <button
            type="button"
            onClick={() => setLoginType("email")}
            style={loginType === "email" ? activeTab : normalTab}
          >
            Email
          </button>

          <button
            type="button"
            onClick={() => setLoginType("mobile")}
            style={loginType === "mobile" ? activeTab : normalTab}
          >
            Mobile
          </button>
        </div>

        <form onSubmit={handleLogin}>
          {statusMessage && <p style={successMessage}>{statusMessage}</p>}
          {error && <p style={errorMessage}>{error}</p>}

          {loginType === "email" && (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                style={input}
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                style={input}
                required
              />

              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />{" "}
                Remember me
              </label>
            </>
          )}

          {loginType === "mobile" && (
            <>
              <input
                placeholder="Mobile Number"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                style={input}
              />

              <button type="button" style={otpBtn}>
                Send OTP
              </button>

              <input
                placeholder="Enter OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                style={input}
              />

              <p style={helperText}>
                Mobile OTP login is still pending backend integration.
              </p>
            </>
          )}

          <button style={loginBtn} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          New to UNIVA? <Link href="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: "url('/univa-login-bg.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
}

const card = {
  width: "360px",
  padding: "30px",
  borderRadius: "12px",
  background: "rgba(255,255,255,0.95)",
  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
}

const tabs = {
  display: "flex",
  marginBottom: "15px",
  borderRadius: "8px",
  overflow: "hidden",
}

const activeTab = {
  flex: 1,
  padding: "10px",
  border: "none",
  background: "#5a4bff",
  color: "white",
  cursor: "pointer",
}

const normalTab = {
  flex: 1,
  padding: "10px",
  border: "none",
  background: "#eee",
  cursor: "pointer",
}

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
}

const checkboxLabel = {
  display: "block",
  fontSize: "14px",
}

const loginBtn = {
  width: "100%",
  padding: "10px",
  marginTop: "15px",
  border: "none",
  borderRadius: "6px",
  background: "#5a4bff",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
}

const otpBtn = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  border: "none",
  borderRadius: "6px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
}

const helperText = {
  fontSize: "13px",
  color: "#555",
}

const errorMessage = {
  marginBottom: "12px",
  padding: "10px",
  borderRadius: "6px",
  background: "#ffe5e5",
  color: "#9f1d1d",
  fontSize: "14px",
}

const successMessage = {
  marginBottom: "12px",
  padding: "10px",
  borderRadius: "6px",
  background: "#e8f7eb",
  color: "#216e39",
  fontSize: "14px",
}
