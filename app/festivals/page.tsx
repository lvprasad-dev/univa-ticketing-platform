import TicketingCategoryPage from "@/components/TicketingCategoryPage"

const festivalListings = [
  {
    title: "Food and Music Fest",
    city: "Hyderabad",
    venue: "Hitex Grounds",
    area: "Kondapur",
    price: "Rs.799",
    lat: 17.4679,
    lon: 78.3728,
    meta: "Weekend entry pass",
  },
  {
    title: "Night Carnival",
    city: "Hyderabad",
    venue: "People's Plaza",
    area: "Necklace Road",
    price: "Rs.699",
    lat: 17.4231,
    lon: 78.4698,
    meta: "Live performances",
  },
  {
    title: "Cultural Street Fest",
    city: "Hyderabad",
    venue: "Shilparamam",
    area: "HITEC City",
    price: "Rs.499",
    lat: 17.4526,
    lon: 78.3783,
    meta: "Crafts and food stalls",
  },
  {
    title: "Riverfront Festival",
    city: "Vijayawada",
    venue: "Bhavani Island",
    area: "Krishna Riverfront",
    price: "Rs.599",
    lat: 16.5268,
    lon: 80.6032,
    meta: "Sunset events",
  },
  {
    title: "City Arts Festival",
    city: "Bangalore",
    venue: "Palace Grounds",
    area: "Mekhri Circle",
    price: "Rs.899",
    lat: 13.0095,
    lon: 77.5831,
    meta: "Family pass",
  },
]

export default function FestivalsPage() {
  return (
    <TicketingCategoryPage
      category="Festivals"
      heading="Festival passes around your location"
      description="See nearby festival venues and book the closest pass from your current or selected city."
      icon="🎉"
      listings={festivalListings}
    />
  )
}
