export default function OrganizerPaymentsPage() {
  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1 style={titleStyle}>Razorpay and UPI Payments</h1>
        <p style={textStyle}>
          Payment setup page for gateway integration, UPI configuration, and settlements.
        </p>

        <div style={paymentListStyle}>
          <div style={paymentItemStyle}>Razorpay account connection</div>
          <div style={paymentItemStyle}>UPI handler setup</div>
          <div style={paymentItemStyle}>Payout and settlement summary</div>
        </div>
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

const paymentListStyle = {
  display: "grid",
  gap: "12px",
}

const paymentItemStyle = {
  padding: "18px",
  borderRadius: "18px",
  background: "#fff2ea",
  color: "#5f4032",
}
