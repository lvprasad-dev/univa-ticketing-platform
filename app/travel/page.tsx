import TicketingCategoryPage from "@/components/TicketingCategoryPage"

const travelListings = [
  {
    title: "Weekend City Escape",
    city: "Hyderabad",
    venue: "UNIVA Travel Hub",
    area: "Ameerpet",
    price: "Rs.1499",
    lat: 17.4374,
    lon: 78.4482,
    meta: "Bus + stay package",
  },
  {
    title: "Araku Valley Tour",
    city: "Hyderabad",
    venue: "Skyline Holidays",
    area: "Madhapur",
    price: "Rs.2299",
    lat: 17.4504,
    lon: 78.3901,
    meta: "Guided 2-day trip",
  },
  {
    title: "Beach Break Package",
    city: "Hyderabad",
    venue: "Wander Connect",
    area: "Secunderabad",
    price: "Rs.1899",
    lat: 17.4399,
    lon: 78.4983,
    meta: "Weekend getaway",
  },
  {
    title: "Temple Trail",
    city: "Vijayawada",
    venue: "Divine Journeys",
    area: "Governorpet",
    price: "Rs.999",
    lat: 16.5141,
    lon: 80.6326,
    meta: "One-day group trip",
  },
  {
    title: "Hill View Retreat",
    city: "Bangalore",
    venue: "Travel Square",
    area: "MG Road",
    price: "Rs.2599",
    lat: 12.9755,
    lon: 77.6066,
    meta: "Premium weekend tour",
  },
]

export default function TravelPage() {
  return (
    <TicketingCategoryPage
      category="Travel"
      heading="Travel bookings near your location"
      description="Find travel packages and trip departures around your current or selected city."
      icon="🧳"
      listings={travelListings}
      backgroundImage="/univa-travel-bg.png"
    />
  )
}
