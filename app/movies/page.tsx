import TicketingCategoryPage from "@/components/TicketingCategoryPage"

const movieListings = [
  {
    title: "Midnight Premiere",
    city: "Hyderabad",
    venue: "PVR Cinemas",
    area: "Gachibowli",
    price: "Rs.299",
    lat: 17.4401,
    lon: 78.3489,
    meta: "English",
  },
  {
    title: "Blockbuster First Day",
    city: "Hyderabad",
    venue: "AMB Cinemas",
    area: "Kondapur",
    price: "Rs.349",
    lat: 17.4662,
    lon: 78.3648,
    meta: "Telugu",
  },
  {
    title: "Family Weekend Show",
    city: "Hyderabad",
    venue: "INOX",
    area: "Punjagutta",
    price: "Rs.249",
    lat: 17.4288,
    lon: 78.4483,
    meta: "Telugu",
  },
  {
    title: "Classic Re-Release",
    city: "Hyderabad",
    venue: "Asian Cinemas",
    area: "Uppal",
    price: "Rs.199",
    lat: 17.4058,
    lon: 78.5591,
    meta: "Hindi",
  },
  {
    title: "Late Night Action",
    city: "Hyderabad",
    venue: "Cinepolis",
    area: "Kukatpally",
    price: "Rs.269",
    lat: 17.4933,
    lon: 78.3997,
    meta: "Tamil",
  },
  {
    title: "Premiere Weekend",
    city: "Vijayawada",
    venue: "INOX",
    area: "Benz Circle",
    price: "Rs.259",
    lat: 16.4988,
    lon: 80.6676,
    meta: "English",
  },
  {
    title: "Festival Screening",
    city: "Guntur",
    venue: "Hollywood Multiplex",
    area: "Lakshmipuram",
    price: "Rs.179",
    lat: 16.3064,
    lon: 80.4356,
    meta: "Telugu",
  },
  {
    title: "City Lights Show",
    city: "Bangalore",
    venue: "Cinepolis",
    area: "Whitefield",
    price: "Rs.219",
    lat: 12.9698,
    lon: 77.7499,
    meta: "Hindi",
  },
  {
    title: "Weekend Special",
    city: "Chennai",
    venue: "PVR",
    area: "Velachery",
    price: "Rs.279",
    lat: 12.9809,
    lon: 80.2217,
    meta: "Tamil",
  },
]

export default function MoviesPage() {
  return (
    <TicketingCategoryPage
      category="Movies"
      heading="All theatres around your location"
      description="We show all theatres in your current or selected city and sort them from nearest to farthest."
      icon="🎬"
      listings={movieListings}
    />
  )
}
