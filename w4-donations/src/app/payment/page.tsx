"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({ name, email, amount }: any) {
  const stripe = useStripe();
  const elements = useElements();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // Create PaymentIntent
    const res = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) * 100 }),
    });

    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
        billing_details: { name, email },
      },
    });

    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent?.status === "succeeded") {
      setSuccess(true);

      // Send Thank You Email
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, amount }),
      });
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg w-96">
      <h2 className="text-xl font-bold mb-4">Stripe Payment Demo</h2>

      {!success ? (
        <form onSubmit={handleSubmit}>
          <CardElement className="p-2 border rounded-md mb-4" />
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {loading ? "Processing..." : `Pay ₹${amount}`}
          </button>
        </form>
      ) : (
        <p className="text-green-600 font-semibold">
          ✅ Thank you {name}! Payment successful.
        </p>
      )}
    </div>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const email = searchParams.get("email");
  const amount = searchParams.get("amount");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Elements stripe={stripePromise}>
        <CheckoutForm name={name} email={email} amount={amount} />
      </Elements>
    </div>
  );
}
