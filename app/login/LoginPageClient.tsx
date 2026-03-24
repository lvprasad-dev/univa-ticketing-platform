"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

type LoginPageClientProps = {
  authMessage: string
}

const countryCodeOptions = [
  { value: "+91", label: "+91 India" },
  { value: "+1", label: "+1 USA" },
  { value: "+44", label: "+44 UK" },
  { value: "+971", label: "+971 UAE" },
]

export default function LoginPageClient({
  authMessage,
}: LoginPageClientProps) {
  const [loginType, setLoginType] = useState<"mobile" | "email">("mobile")
  const [countryCode, setCountryCode] = useState("+91")
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

  const normalizePhoneNumber = (dialCode: string, value: string) => {
    const trimmedDialCode = dialCode.trim()
    let trimmedValue = value.trim().replace(/\D/g, "")

    if (!trimmedDialCode || !trimmedValue) {
      return null
    }

    if (dialCode === "+91") {
      if (trimmedValue.length === 11 && trimmedValue.startsWith("0")) {
        trimmedValue = trimmedValue.slice(1)
      }
      if (trimmedValue.length === 12 && trimmedValue.startsWith("91")) {
        trimmedValue = trimmedValue.slice(2)
      }
    }

    if (dialCode === "+1" && trimmedValue.length === 11 && trimmedValue.startsWith("1")) {
      trimmedValue = trimmedValue.slice(1)
    }

    if (dialCode === "+44") {
      if (trimmedValue.startsWith("0")) {
        trimmedValue = trimmedValue.slice(1)
      }
      if (trimmedValue.startsWith("44")) {
        trimmedValue = trimmedValue.slice(2)
      }
    }

    if (dialCode === "+971") {
      if (trimmedValue.startsWith("0")) {
        trimmedValue = trimmedValue.slice(1)
      }
      if (trimmedValue.startsWith("971")) {
        trimmedValue = trimmedValue.slice(3)
      }
    }

    const normalizedDialCode = trimmedDialCode.startsWith("+")
      ? `+${trimmedDialCode.slice(1).replace(/\D/g, "")}`
      : `+${trimmedDialCode.replace(/\D/g, "")}`

    return normalizedDialCode.length > 1 ? `${normalizedDialCode}${trimmedValue}` : null
  }

  const validateMobileNumber = (dialCode: string, value: string) => {
    const normalizedPhone = normalizePhoneNumber(dialCode, value)

    if (!normalizedPhone) {
      return "Enter your mobile number."
    }

    const digits = normalizedPhone.replace(/^\+\d{1,3}/, "")

    if (!digits) {
      return "Enter your mobile number."
    }

    if (dialCode === "+91" || dialCode === "+1") {
      if (digits.length !== 10) {
        return "Enter a valid 10-digit mobile number."
      }
    } else if (dialCode === "+44") {
      if (digits.length < 10 || digits.length > 11) {
        return "Enter a valid UK mobile number."
      }
    } else if (dialCode === "+971") {
      if (digits.length < 9 || digits.length > 10) {
        return "Enter a valid UAE mobile number."
      }
    }

    return null
  }

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

  const handleSendMobileOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    const mobileValidationError = validateMobileNumber(countryCode, mobile)

    if (mobileValidationError) {
      setError(mobileValidationError)
      return
    }

    const normalizedPhone = normalizePhoneNumber(countryCode, mobile)

    if (!normalizedPhone) {
      setError("Enter a valid country code and mobile number.")
      return
    }

    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
    })

    setLoading(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    setMobileOtpSent(true)
    setMessage(`OTP request sent to ${normalizedPhone}. If you do not receive it, check your SMS provider logs.`)
  }

  const handleVerifyMobileOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    const mobileValidationError = validateMobileNumber(countryCode, mobile)

    if (mobileValidationError) {
      setError(mobileValidationError)
      return
    }

    const normalizedPhone = normalizePhoneNumber(countryCode, mobile)

    if (!normalizedPhone) {
      setError("Enter a valid country code and mobile number.")
      return
    }

    setLoading(true)

    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
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
          <form onSubmit={mobileOtpSent ? handleVerifyMobileOtp : handleSendMobileOtp}>
            <div style={phoneRowStyle}>
              <label style={fieldWrapStyle}>
                <span style={fieldLabelStyle}>Country Code</span>
                <select
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value)}
                  style={countryCodeInputStyle}
                >
                  {countryCodeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label style={fieldWrapStyle}>
                <span style={fieldLabelStyle}>Mobile Number</span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(event) =>
                    setMobile(event.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  autoComplete="tel-national"
                  inputMode="tel"
                  style={mobileInputStyle}
                  required
                />
              </label>
            </div>

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
                : "Enter your country code and 10-digit mobile number to receive an OTP."}
            </p>

            <button style={orangeSubmitBtn} disabled={loading || providerLoading !== null}>
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

            <button style={orangeSubmitBtn} disabled={loading || providerLoading !== null}>
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

const phoneRowStyle = {
  display: "grid",
  gridTemplateColumns: "110px 1fr",
  gap: "10px",
}

const fieldWrapStyle = {
  display: "grid",
  alignContent: "start",
}

const fieldLabelStyle = {
  marginBottom: "6px",
  fontSize: "12px",
  color: "#625b79",
  fontWeight: "600",
}

const countryCodeInputStyle = {
  ...input,
  appearance: "auto" as const,
  background: "#ffffff",
}

const mobileInputStyle = {
  ...input,
}

const orangeSubmitBtn = {
  width: "100%",
  padding: "12px",
  marginTop: "10px",
  border: "none",
  borderRadius: "10px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
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
