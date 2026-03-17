import Link from "next/link"

export default function PublishEventPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Publish Event</h1>
        <p style={textStyle}>
          Review event content, ticket inventory, and visibility settings before publishing.
        </p>

        <div style={summaryStyle}>
          <div style={rowStyle}>
            <span>Status</span>
            <strong>Ready to publish</strong>
          </div>
          <div style={rowStyle}>
            <span>Ticket tiers</span>
            <strong>2 configured</strong>
          </div>
          <div style={rowStyle}>
            <span>Visibility</span>
            <strong>Public</strong>
          </div>
        </div>

        <Link href="/organizer/sales" style={linkStyle}>
          Continue to Sales Flow
        </Link>
      </section>
    </main>
  )
}

const pageStyle = {
  marginTop: "55px",
  minHeight: "100vh",
  padding: "40px 32px",
  background: "#fff8f2",
}

const cardStyle = {
  maxWidth: "760px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "22px",
  background: "white",
  boxShadow: "0 18px 36px rgba(150,92,52,0.08)",
}

const titleStyle = {
  marginBottom: "10px",
  color: "#3d2419",
}

const textStyle = {
  marginBottom: "20px",
  color: "#785344",
}

const summaryStyle = {
  display: "grid",
  gap: "12px",
  marginBottom: "24px",
  padding: "18px",
  borderRadius: "18px",
  background: "#fff2ea",
}

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#5f4032",
}

const linkStyle = {
  textDecoration: "none",
  color: "#ff7a00",
  fontWeight: "700",
}
