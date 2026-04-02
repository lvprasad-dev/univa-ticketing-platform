import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function POST(req: Request) {
  if (!stripeSecretKey) {
    return Response.json({ error: "Missing Stripe secret key" }, { status: 500 })
  }

  const stripe = new Stripe(stripeSecretKey)
  const body = (await req.json()) as {
    price?: number
    title?: string
  }

  const amount = Math.max(1, Number(body.price || 500))
  const origin =
    req.headers.get("origin") ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: body.title || "Univa Ticket",
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/success`,
    cancel_url: `${origin}/cancel`,
  })

  return Response.json({ id: session.id })
}
