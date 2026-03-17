export default function CheckoutPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Checkout Page</h1>
        <p style={textStyle}>
          Final step before payment. Razorpay and UPI integration can plug into this page.
        </p>

        <div style={summaryStyle}>
          <div style={rowStyle}>
            <span>General Ticket</span>
            <strong>Rs.499</strong>
          </div>
          <div style={rowStyle}>
            <span>Platform Fee</span>
            <strong>Rs.49</strong>
          </div>
          <div style={totalRowStyle}>
            <span>Total Amount</span>
            <strong>Rs.548</strong>
          </div>
        </div>
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
  maxWidth: "760px",
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
  marginBottom: "20px",
  color: "#5d547e",
}

const summaryStyle = {
  display: "grid",
  gap: "12px",
  padding: "18px",
  borderRadius: "18px",
  background: "#f4efff",
}

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  color: "#2d2550",
}

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: "12px",
  borderTop: "1px solid rgba(90,75,255,0.18)",
  color: "#241c3e",
}
