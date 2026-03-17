import TicketingCategoryPage from "@/components/TicketingCategoryPage"

const darshanListings = [
  {
    title: "Morning Darshan Slot",
    city: "Hyderabad",
    venue: "Birla Mandir Access Point",
    area: "Khairatabad",
    price: "Rs.199",
    lat: 17.4062,
    lon: 78.4691,
    meta: "Express entry",
  },
  {
    title: "Special Darshan",
    city: "Hyderabad",
    venue: "Peddamma Temple Desk",
    area: "Jubilee Hills",
    price: "Rs.249",
    lat: 17.4322,
    lon: 78.4095,
    meta: "Priority queue",
  },
  {
    title: "Evening Seva Pass",
    city: "Hyderabad",
    venue: "Jagannath Temple Counter",
    area: "Banjara Hills",
    price: "Rs.299",
    lat: 17.4239,
    lon: 78.4359,
    meta: "Aarti access",
  },
  {
    title: "Temple Visit Pass",
    city: "Vijayawada",
    venue: "Kanaka Durga Darshan Centre",
    area: "Indrakeeladri",
    price: "Rs.149",
    lat: 16.5174,
    lon: 80.616,
    meta: "Quick entry",
  },
  {
    title: "Devotional Entry",
    city: "Chennai",
    venue: "Kapaleeshwarar Temple Desk",
    area: "Mylapore",
    price: "Rs.179",
    lat: 13.0339,
    lon: 80.2696,
    meta: "Festival day slot",
  },
]

export default function DarshanPage() {
  return (
    <TicketingCategoryPage
      category="Darshan"
      heading="Darshan booking options near you"
      description="View temple access points and darshan passes based on your current or selected city."
      icon="🙏"
      listings={darshanListings}
    />
  )
}
