"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type LoginPageClientProps = {
  authMessage: string
}

export default function LoginPageClient({
  authMessage,
}: LoginPageClientProps) {
  const [loginType, setLoginType] = useState<"email" | "mobile">("mobile")
  const [email, setEmail] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [mobile, setMobile] = useState("")
  const [mobileOtp, setMobileOtp] = useState("")
  const [mobileOtpSent, setMobileOtpSent] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [providerLoading, setProviderLoading] = useState<
    "google" | "apple" | null
  >(null)

  const router = useRouter()
  const statusMessage = message || authMessage

  const handleSendEmailOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    setEmailOtpSent(true)
    setMessage("OTP sent to your email.")
  }

  const handleVerifyEmailOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: emailOtp,
      type: "email",
    })

    setLoading(false)

    if (verifyError) {
      setError(verifyError.message)
      return
    }

    router.push("/")
  }

  const handleSendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithOtp({
      phone: mobile,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    setMobileOtpSent(true)
    setMessage("OTP sent to your mobile number.")
  }

  const handleVerifyMobileOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: mobile,
      token: mobileOtp,
      type: "sms",
    })

    setLoading(false)

    if (verifyError) {
      setError(verifyError.message)
      return
    }

    router.push("/")
  }

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setError("")
    setMessage("")
    setProviderLoading(provider)

    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/` : undefined

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (oauthError) {
      setProviderLoading(null)
      setError(oauthError.message)
    }
  }

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={titleStyle}>Login to proceed</h2>

        {statusMessage && <p style={successMessage}>{statusMessage}</p>}
        {error && <p style={errorMessage}>{error}</p>}

        <div style={providerStack}>
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            style={providerButtonStyle}
            disabled={providerLoading !== null || loading}
          >
            {providerLoading === "google" ? "Opening Google..." : "Continue with Google"}
          </button>

          <button
            type="button"
            onClick={() => handleOAuthLogin("apple")}
            style={providerButtonStyle}
            disabled={providerLoading !== null || loading}
          >
            {providerLoading === "apple" ? "Opening Apple..." : "Continue with Apple"}
          </button>
        </div>

        <div style={dividerStyle}>
          <span style={dividerLineStyle} />
          <span style={dividerTextStyle}>or</span>
          <span style={dividerLineStyle} />
        </div>

        <div style={tabs}>
          <button
            type="button"
            onClick={() => {
              setLoginType("mobile")
              setError("")
              setMessage("")
              setEmailOtp("")
              setEmailOtpSent(false)
            }}
            style={loginType === "mobile" ? activeTab : normalTab}
          >
            Continue with Mobile
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType("email")
              setError("")
              setMessage("")
              setMobileOtp("")
              setMobileOtpSent(false)
            }}
            style={loginType === "email" ? activeTab : normalTab}
          >
            Continue with Email
          </button>
        </div>

        {loginType === "mobile" ? (
          <form onSubmit={mobileOtpSent ? handleVerifyMobileOtp : handleSendOtp}>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              autoComplete="tel"
              style={input}
              required
            />

            {mobileOtpSent && (
              <input
                placeholder="Enter OTP"
                value={mobileOtp}
                onChange={(event) => setMobileOtp(event.target.value)}
                style={input}
                required
              />
            )}

            <p style={helperText}>
              {mobileOtpSent
                ? "Enter the OTP sent to your mobile number."
                : "We will send a one-time OTP to your mobile number."}
            </p>

            <button style={mobileLoginBtn} disabled={loading || providerLoading !== null}>
              {loading
                ? mobileOtpSent
                  ? "Verifying..."
                  : "Sending OTP..."
                : mobileOtpSent
                  ? "Verify OTP"
                  : "Continue with Mobile"}
            </button>
          </form>
        ) : (
          <form onSubmit={emailOtpSent ? handleVerifyEmailOtp : handleSendEmailOtp}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              style={input}
              required
            />

            {emailOtpSent && (
              <input
                placeholder="Enter OTP"
                value={emailOtp}
                onChange={(event) => setEmailOtp(event.target.value)}
                style={input}
                required
              />
            )}

            <p style={helperText}>
              {emailOtpSent
                ? "Enter the OTP sent to your email."
                : "We will send a one-time OTP to your email."}
            </p>

            <button style={mobileLoginBtn} disabled={loading || providerLoading !== null}>
              {loading
                ? emailOtpSent
                  ? "Verifying..."
                  : "Sending OTP..."
                : emailOtpSent
                  ? "Verify OTP"
                  : "Continue with Email"}
            </button>
          </form>
        )}
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
  width: "420px",
  padding: "30px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.95)",
  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
}

const titleStyle = {
  textAlign: "center" as const,
  marginBottom: "8px",
  fontWeight: "500",
}

const providerStack = {
  display: "grid",
  gap: "10px",
  marginBottom: "18px",
}

const providerButtonStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #d6d0e8",
  background: "white",
  color: "#241c3e",
  fontWeight: "600",
  cursor: "pointer",
}

const dividerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "18px",
}

const dividerLineStyle = {
  flex: 1,
  height: "1px",
  background: "#e3deee",
}

const dividerTextStyle = {
  fontSize: "13px",
  color: "#766d91",
}

const tabs = {
  display: "flex",
  marginBottom: "15px",
  borderRadius: "18px",
  background: "#f3efff",
  padding: "6px",
  gap: "4px",
}

const activeTab = {
  flex: 1,
  padding: "14px 10px",
  border: "none",
  borderRadius: "14px",
  background: "linear-gradient(90deg, #5a4bff, #6558ff)",
  color: "white",
  cursor: "pointer",
  fontWeight: "700",
}

const normalTab = {
  flex: 1,
  padding: "14px 10px",
  border: "none",
  borderRadius: "14px",
  background: "transparent",
  color: "#4f4670",
  cursor: "pointer",
  fontWeight: "600",
}

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #d2cce3",
}

const loginBtn = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  border: "none",
  borderRadius: "10px",
  background: "#5a4bff",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
}

const mobileLoginBtn = {
  ...loginBtn,
  background: "#ff7a00",
}

const helperText = {
  marginTop: "-2px",
  marginBottom: "12px",
  fontSize: "13px",
  color: "#625b79",
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
