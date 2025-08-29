// app/api/create-payment-intent/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe initialize karo (secret key env se lo)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any, // 👈 TypeScript ke liye as any
});
console.log("Using Stripe Key:", process.env.STRIPE_SECRET_KEY?.slice(0, 15));

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();

    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Payment Intent create karo
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects in paise (₹100 → 10000)
      currency: "inr",
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error("Stripe error:", err); // 👈 Debug ke liye log
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
