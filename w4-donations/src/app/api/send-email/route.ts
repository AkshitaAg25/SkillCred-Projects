import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, amount } = await req.json();

    // Transporter setup (using Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail address from .env.local
        pass: process.env.EMAIL_PASS, // App password from .env.local
      },
    });

    // Send mail
    await transporter.sendMail({
      from: `"Donation App" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for your donation!",
      text: `Hello ${name},\n\nThank you for donating ₹${amount}!\n\nWe really appreciate your support.`,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
