const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://orwmccozogtawqhzpcll.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yd21jY296b2d0YXdxaHpwY2xsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjg1NzAsImV4cCI6MjA4ODcwNDU3MH0.1lwpzecOsFYpMtb3pPTaZAbYpNx7Y7NCWDCK1liZQOA"

export const createSupabaseHeaders = (accessToken?: string) => {
  const headers: Record<string, string> = {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${accessToken ?? supabaseAnonKey}`,
    "Content-Type": "application/json",
  }

  return headers
}

export const getSupabaseRestUrl = (path: string) => {
  return `${supabaseUrl}/rest/v1/${path}`
}
