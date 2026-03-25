import TicketingCategoryPage from "@/components/TicketingCategoryPage"

const conferenceListings = [
  {
    title: "Tech Leadership Summit",
    city: "Hyderabad",
    venue: "HICC",
    area: "Madhapur",
    price: "Rs.2499",
    lat: 17.4726,
    lon: 78.3742,
    meta: "Business + technology",
  },
  {
    title: "Startup Growth Forum",
    city: "Hyderabad",
    venue: "Novotel Convention Centre",
    area: "HITEC City",
    price: "Rs.1999",
    lat: 17.4698,
    lon: 78.3763,
    meta: "Networking sessions",
  },
  {
    title: "Marketing Innovators Meet",
    city: "Hyderabad",
    venue: "Trident",
    area: "Madhapur",
    price: "Rs.1699",
    lat: 17.4484,
    lon: 78.3814,
    meta: "Brand and digital tracks",
  },
  {
    title: "Product Builders Day",
    city: "Bangalore",
    venue: "Sheraton Grand",
    area: "Whitefield",
    price: "Rs.2299",
    lat: 12.9872,
    lon: 77.736,
    meta: "Product strategy talks",
  },
  {
    title: "Future of Work Forum",
    city: "Chennai",
    venue: "Chennai Trade Centre",
    area: "Nandambakkam",
    price: "Rs.1899",
    lat: 13.0104,
    lon: 80.1863,
    meta: "HR and operations",
  },
]

export default function ConferencesPage() {
  return (
    <TicketingCategoryPage
      category="Conferences"
      heading="Conference tickets near your location"
      description="Browse conference venues around your current or selected city and book the nearest option."
      icon="🎤"
      listings={conferenceListings}
      backgroundImage="/univa-conference-bg.png"
    />
  )
}
