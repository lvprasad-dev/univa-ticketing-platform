"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

const categories = [
  { label: "Movies", href: "/movies" },
  { label: "Travel", href: "/travel" },
  { label: "Darshan", href: "/darshan" },
  { label: "Conferences", href: "/conferences" },
  { label: "Festivals", href: "/festivals" },
]
const userRoleKey = "univa-user-role"

export default function Home() {
  const router = useRouter()

  const handleRoleSelect = (role: "buyer" | "seller") => {
    window.localStorage.setItem(userRoleKey, role)
    router.push(role === "buyer" ? "/movies" : "/organizer/create-event")
  }

  return (
    <main style={pageStyle}>
      <section style={topBackgroundSectionStyle}>
      <section style={ticketingStripStyle}>
        <div style={chipsStyle}>
          {categories.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="ticketing-chip"
              style={chipStyle}
            >
              {category.label}
            </Link>
          ))}
        </div>
      </section>

      <section style={heroStyle}>
        <div style={cardsWrapStyle}>
          <div style={roleCardStyle}>
            <div style={iconCircleStyle}>
              <span style={iconStyle}>👤</span>
            </div>
            <h2 style={roleTitleStyle}>Attend Events</h2>
            <p style={roleTextStyle}>
              Discover movies, festivals, travel experiences and conferences.
              Book tickets instantly and enjoy events easily.
            </p>
            <button
              type="button"
              className="primary-cta"
              style={primaryActionStyle}
              onClick={() => handleRoleSelect("buyer")}
            >
              Explore Events
            </button>
          </div>

          <div style={roleCardStyle}>
            <div style={iconCircleStyle}>
              <span style={iconStyle}>🧺</span>
            </div>
            <h2 style={roleTitleStyle}>Host Your Event</h2>
            <p style={roleTextStyle}>
              Create events, sell tickets and manage attendees using UNIVA.
              Perfect platform for organizers.
            </p>
            <button
              type="button"
              className="primary-cta"
              style={sellerActionStyle}
              onClick={() => handleRoleSelect("seller")}
            >
              Create Event
            </button>
          </div>
        </div>
      </section>

      <section style={contentSectionStyle}>
        <div style={contentGridStyle}>
          <div style={contentCardStyle}>
            <div style={contentIconCircleStyle}>
              <span style={contentIconStyle}>🟠</span>
            </div>
            <p style={contentEyebrowStyle}>Why UNIVA</p>
            <h3 style={contentTitleStyle}>Everything you need in one place</h3>
            <p style={contentTextStyle}>
              Discover events, compare options, and move from interest to booking
              without jumping between apps or confusing pages.
            </p>
          </div>

          <div style={contentCardStyle}>
            <div style={contentIconCircleStyle}>
              <span style={contentIconStyle}>🎫</span>
            </div>
            <p style={contentEyebrowStyle}>For Attendees</p>
            <h3 style={contentTitleStyle}>Find better events faster</h3>
            <p style={contentTextStyle}>
              Browse by category, check event details clearly, and choose tickets
              in a simple flow designed to save time.
            </p>
          </div>

          <div style={contentCardStyle}>
            <div style={contentIconCircleStyle}>
              <span style={contentIconStyle}>📣</span>
            </div>
            <p style={contentEyebrowStyle}>For Organizers</p>
            <h3 style={contentTitleStyle}>Launch and manage events with clarity</h3>
            <p style={contentTextStyle}>
              Create listings, manage ticket sales, and keep your event journey
              organized from setup to attendee handling.
            </p>
          </div>
        </div>

        <div style={trustPanelStyle}>
          <h3 style={trustTitleStyle}>Stay here. Get more done.</h3>
          <p style={trustTextStyle}>
            UNIVA is built to keep the entire ticketing journey in one experience,
            so users can discover, decide, and act without friction.
          </p>
        </div>
      </section>

      </section>

      <section style={lowerBackgroundSectionStyle}>
      <section style={featuresSectionStyle}>
        <h2 style={featuresHeadingStyle}>Everything You Need in One Place</h2>

        <div style={featuresGridStyle}>
          <div style={featureCardStyle}>
            <div style={featureIconCircleStyle}>
              <span style={featureIconStyle}>📅</span>
            </div>
            <h3 style={featureTitleStyle}>Manage Events</h3>
            <p style={featureTextStyle}>
              Powerful tools to simplify ticketing.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconCircleStyle}>
              <span style={featureIconStyle}>🎟️</span>
            </div>
            <h3 style={featureTitleStyle}>Sell Tickets</h3>
            <p style={featureTextStyle}>
              Sell tickets easily across events.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconCircleStyle}>
              <span style={featureIconStyle}>👥</span>
            </div>
            <h3 style={featureTitleStyle}>Engage Attendees</h3>
            <p style={featureTextStyle}>
              Connect with attendees and audiences.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={featureIconCircleStyle}>
              <span style={featureIconStyle}>📊</span>
            </div>
            <h3 style={featureTitleStyle}>Analyze Results</h3>
            <p style={featureTextStyle}>
              Track performance and event insights.
            </p>
          </div>
        </div>
      </section>

      <section style={bottomSectionStyle}>
        <div style={bottomHeroStyle}>
          <div>
            <p style={bottomEyebrowStyle}>Ready To Book Or Host</p>
            <h2 style={bottomTitleStyle}>One platform for every ticketing moment.</h2>
            <p style={bottomTextStyle}>
              Explore events, reserve tickets, or launch your own event experience
              with a flow that feels simple, clear, and reliable.
            </p>
          </div>

          <div style={bottomActionsStyle}>
            <Link href="/movies" style={bottomPrimaryLinkStyle}>
              Explore Tickets
            </Link>
            <Link href="/organizer/create-event" style={bottomSecondaryLinkStyle}>
              Start Creating
            </Link>
          </div>
        </div>

        <div style={bottomInfoGridStyle}>
          <div style={bottomInfoCardStyle}>
            <h3 style={bottomCardTitleStyle}>For Attendees</h3>
            <p style={bottomCardTextStyle}>
              Browse trusted listings, pick the right category, and keep your
              bookings organized in one place.
            </p>
          </div>

          <div style={bottomInfoCardStyle}>
            <h3 style={bottomCardTitleStyle}>For Organizers</h3>
            <p style={bottomCardTextStyle}>
              Create events, manage visibility, and track activity with a simple
              event-first workflow.
            </p>
          </div>

          <div style={bottomInfoCardStyle}>
            <h3 style={bottomCardTitleStyle}>Support</h3>
            <p style={bottomCardTextStyle}>
              UNIVA keeps discovery, booking, and event management connected so
              users do not need to jump between multiple tools.
            </p>
          </div>
        </div>

        <footer style={footerStyle}>
          <p style={footerBrandStyle}>UNIVA Ticketing Platform</p>
          <p style={footerTextStyle}>
            Built for smoother bookings, better event discovery, and easier event
            management.
          </p>
        </footer>
      </section>
      </section>
    </main>
  )
}

const pageStyle = {
  marginTop: "55px",
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, rgba(255,184,77,0.18), transparent 24%), radial-gradient(circle at left 20%, rgba(77,170,255,0.14), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f9fbff 48%, #fffaf4 100%)",
}

const topBackgroundSectionStyle = {
  backgroundImage:
    "linear-gradient(180deg, rgba(255,255,255,0.2), rgba(255,255,255,0.28)), url('/univa-home.png')",
  backgroundSize: "cover",
  backgroundPosition: "center top",
  backgroundRepeat: "no-repeat",
  paddingBottom: "88px",
  position: "relative" as const,
  overflow: "hidden" as const,
}

const lowerBackgroundSectionStyle = {
  backgroundImage:
    "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.78)), url('/web-home2.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  marginTop: "18px",
  paddingTop: "72px",
  borderTopLeftRadius: "36px",
  borderTopRightRadius: "36px",
  boxShadow: "0 -14px 34px rgba(37, 25, 77, 0.08)",
  overflow: "hidden" as const,
}

const ticketingStripStyle = {
  position: "fixed" as const,
  top: "75px",
  left: 0,
  width: "100%",
  display: "flex",
  justifyContent: "center",
  padding: "16px 24px 0",
  zIndex: 900,
}

const heroStyle = {
  minHeight: "calc(100vh - 55px)",
  padding: "170px 32px 40px",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
}

const cardsWrapStyle = {
  width: "100%",
  maxWidth: "640px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
}

const primaryActionStyle = {
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "#5a4bff",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
  minWidth: "140px",
}

const sellerActionStyle = {
  border: "none",
  padding: "12px 18px",
  borderRadius: "14px",
  background: "#5a4bff",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
  minWidth: "140px",
}

const chipsStyle = {
  display: "flex",
  gap: "14px",
  flexWrap: "wrap" as const,
  justifyContent: "center",
  maxWidth: "920px",
}

const chipStyle = {
  textDecoration: "none",
  padding: "12px 18px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.96)",
  color: "#4c4270",
  border: "1px solid #ff7a00",
  boxShadow: "0 8px 20px rgba(255,122,0,0.12)",
  fontSize: "15px",
  fontWeight: "600",
}

const roleCardStyle = {
  display: "grid",
  justifyItems: "center",
  textAlign: "center" as const,
  padding: "28px 24px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.94)",
  boxShadow: "0 18px 40px rgba(37, 25, 77, 0.1)",
  backdropFilter: "blur(8px)",
}

const roleTitleStyle = {
  margin: "0 0 14px",
  color: "#111",
  fontSize: "24px",
  fontWeight: "500",
}

const roleTextStyle = {
  maxWidth: "300px",
  margin: "0 0 18px",
  color: "#333",
  lineHeight: 1.45,
  fontSize: "18px",
}

const iconCircleStyle = {
  width: "80px",
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "#f1f1f5",
  marginBottom: "18px",
}

const iconStyle = {
  fontSize: "34px",
}

const contentSectionStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "0 32px 56px",
}

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
  marginBottom: "22px",
}

const contentCardStyle = {
  padding: "22px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.9)",
  boxShadow: "0 16px 34px rgba(37, 25, 77, 0.08)",
  backdropFilter: "blur(8px)",
}

const contentEyebrowStyle = {
  margin: "0 0 8px",
  color: "#ff7a00",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
}

const contentTitleStyle = {
  margin: "0 0 10px",
  color: "#16112a",
  fontSize: "22px",
}

const contentTextStyle = {
  margin: 0,
  color: "#4b4468",
  lineHeight: 1.6,
}

const contentIconCircleStyle = {
  width: "58px",
  height: "58px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "#fff1e7",
  marginBottom: "14px",
}

const contentIconStyle = {
  fontSize: "26px",
}

const trustPanelStyle = {
  padding: "26px",
  borderRadius: "26px",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(245,248,255,0.92), rgba(255,247,239,0.94))",
  boxShadow: "0 16px 34px rgba(37, 25, 77, 0.08)",
  textAlign: "center" as const,
}

const trustTitleStyle = {
  margin: "0 0 10px",
  color: "#16112a",
  fontSize: "28px",
}

const trustTextStyle = {
  margin: 0,
  color: "#4b4468",
  fontSize: "17px",
  lineHeight: 1.6,
}

const featuresSectionStyle = {
  padding: "0 32px 72px",
}

const bottomSectionStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "0 32px 72px",
  display: "grid",
  gap: "22px",
}

const bottomHeroStyle = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr",
  gap: "20px",
  alignItems: "center",
  padding: "28px",
  borderRadius: "28px",
  background: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,244,235,0.96))",
  boxShadow: "0 18px 36px rgba(37, 25, 77, 0.1)",
}

const bottomEyebrowStyle = {
  margin: "0 0 10px",
  color: "#ff7a00",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
}

const bottomTitleStyle = {
  margin: "0 0 12px",
  color: "#16112a",
  fontSize: "32px",
  lineHeight: 1.2,
}

const bottomTextStyle = {
  margin: 0,
  color: "#4b4468",
  fontSize: "16px",
  lineHeight: 1.7,
  maxWidth: "640px",
}

const bottomActionsStyle = {
  display: "grid",
  gap: "12px",
  justifyItems: "stretch",
}

const bottomPrimaryLinkStyle = {
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 18px",
  borderRadius: "14px",
  background: "#ff7a00",
  color: "white",
  fontWeight: "700",
  boxShadow: "0 14px 28px rgba(255,122,0,0.18)",
}

const bottomSecondaryLinkStyle = {
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "14px 18px",
  borderRadius: "14px",
  background: "white",
  color: "#2d2348",
  border: "1px solid #eadfd8",
  fontWeight: "700",
}

const bottomInfoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "18px",
}

const bottomInfoCardStyle = {
  padding: "22px",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.95)",
  boxShadow: "0 14px 30px rgba(37, 25, 77, 0.08)",
}

const bottomCardTitleStyle = {
  margin: "0 0 10px",
  color: "#16112a",
  fontSize: "20px",
}

const bottomCardTextStyle = {
  margin: 0,
  color: "#5d6475",
  lineHeight: 1.6,
}

const footerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap" as const,
  padding: "20px 4px 0",
}

const footerBrandStyle = {
  margin: 0,
  color: "#16112a",
  fontWeight: "700",
}

const footerTextStyle = {
  margin: 0,
  color: "#6b657f",
}

const featuresHeadingStyle = {
  margin: "0 0 28px",
  textAlign: "center" as const,
  color: "#111",
  fontSize: "34px",
  fontWeight: "700",
}

const featuresGridStyle = {
  maxWidth: "1280px",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "24px",
}

const featureCardStyle = {
  display: "grid",
  justifyItems: "center",
  textAlign: "center" as const,
  padding: "34px 24px",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.94)",
  boxShadow: "0 18px 36px rgba(37, 25, 77, 0.08)",
  backdropFilter: "blur(8px)",
}

const featureIconCircleStyle = {
  width: "78px",
  height: "78px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "#f1f1f5",
  marginBottom: "18px",
}

const featureIconStyle = {
  fontSize: "34px",
}

const featureTitleStyle = {
  margin: "0 0 12px",
  color: "#111",
  fontSize: "22px",
}

const featureTextStyle = {
  margin: 0,
  color: "#5d6475",
  fontSize: "16px",
  lineHeight: 1.5,
}
