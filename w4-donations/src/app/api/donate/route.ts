import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { donorName, donorEmail, donationAmount, causeTitle } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Donation App" <${process.env.EMAIL_USER}>`,
      to: donorEmail, // ✅ yaha ab email hamesha milega
      subject: `Thank you for your donation to ${causeTitle}!`,
      text: `Hello ${donorName},\n\nThank you for donating ₹${donationAmount}!\n\nWe really appreciate your support.\n\n- Team`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
