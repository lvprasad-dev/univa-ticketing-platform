import Link from "next/link"

export default function OrganizerSalesPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Buyers Buy Tickets</h1>
        <p style={textStyle}>
          Sales monitoring view for the organizer after an event is published.
        </p>

        <div style={statsGridStyle}>
          <div style={statStyle}>
            <strong>128</strong>
            <span>Tickets sold</span>
          </div>
          <div style={statStyle}>
            <strong>Rs.64,000</strong>
            <span>Gross revenue</span>
          </div>
          <div style={statStyle}>
            <strong>42</strong>
            <span>Pending check-ins</span>
          </div>
        </div>

        <Link href="/organizer/payments" style={linkStyle}>
          Continue to Payments
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
  maxWidth: "820px",
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

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
  marginBottom: "24px",
}

const statStyle = {
  display: "grid",
  gap: "8px",
  padding: "18px",
  borderRadius: "18px",
  background: "#fff2ea",
  color: "#5f4032",
}

const linkStyle = {
  textDecoration: "none",
  color: "#ff7a00",
  fontWeight: "700",
}
