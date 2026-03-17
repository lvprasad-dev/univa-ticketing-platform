import Link from "next/link"

const tickets = [
  { name: "General Ticket", price: "Rs.499", description: "Main entry access" },
  { name: "VIP Ticket", price: "Rs.999", description: "Priority seating and fast entry" },
]

export default function SelectTicketPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Select Ticket</h1>
        <p style={textStyle}>Choose a ticket type before moving to the checkout page.</p>

        <div style={gridStyle}>
          {tickets.map((ticket) => (
            <div key={ticket.name} style={ticketCardStyle}>
              <h2 style={ticketTitleStyle}>{ticket.name}</h2>
              <p style={ticketTextStyle}>{ticket.description}</p>
              <strong style={ticketPriceStyle}>{ticket.price}</strong>
            </div>
          ))}
        </div>

        <Link href="/checkout" style={linkStyle}>
          Continue to Checkout
        </Link>
      </section>
    </main>
  )
}

const pageStyle = {
  marginTop: "55px",
  minHeight: "100vh",
  padding: "40px 32px",
  background: "#faf7ff",
}

const cardStyle = {
  maxWidth: "840px",
  margin: "0 auto",
  padding: "28px",
  borderRadius: "22px",
  background: "white",
  boxShadow: "0 18px 36px rgba(80,52,145,0.08)",
}

const titleStyle = {
  marginBottom: "10px",
  color: "#241c3e",
}

const textStyle = {
  marginBottom: "22px",
  color: "#5d547e",
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
}

const ticketCardStyle = {
  padding: "18px",
  borderRadius: "18px",
  background: "#f4efff",
}

const ticketTitleStyle = {
  marginBottom: "8px",
  color: "#241c3e",
}

const ticketTextStyle = {
  marginBottom: "10px",
  color: "#5d547e",
}

const ticketPriceStyle = {
  color: "#5a4bff",
}

const linkStyle = {
  textDecoration: "none",
  color: "#5a4bff",
  fontWeight: "700",
}
