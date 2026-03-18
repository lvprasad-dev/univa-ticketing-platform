"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/login` : undefined

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo,
        data: {
          full_name: form.name,
          mobile: form.mobile,
        },
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    setMessage("Account created. Check your email for the verification link.")

    setTimeout(() => {
      router.push(
        "/login?message=Account created successfully. Verify your email, then log in."
      )
    }, 1200)
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage: "url('/univa-signup-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form
        onSubmit={handleRegister}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          width: "350px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Create Account
        </h2>

        {message && <p style={successMessage}>{message}</p>}
        {error && <p style={errorMessage}>{error}</p>}

        <label>Full Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Email</label>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ ...inputStyle, flex: 1 }}
          />

          <span style={statusChipStyle}>Verifying...</span>
        </div>
        <p style={helperText}>
          Verification email is sent automatically after you complete sign up.
        </p>

        <label>Mobile Number</label>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="tel"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            required
            style={{ ...inputStyle, flex: 1 }}
          />

          <button type="button" style={verifyBtn} disabled>
            Pending
          </button>
        </div>

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "10px",
            background: "#6c63ff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#6c63ff" }}>
            Login
          </Link>
        </p>
      </form>
    </div>
  )
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  marginTop: "5px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
}

const statusChipStyle = {
  padding: "8px 10px",
  background: "#ff7a00",
  color: "white",
  border: "none",
  borderRadius: "6px",
  display: "inline-flex",
  alignItems: "center",
  fontSize: "13px",
  fontWeight: "700",
  opacity: 0.9,
}

const helperText = {
  marginTop: "-8px",
  marginBottom: "12px",
  fontSize: "12px",
  color: "#6a564f",
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
