// src/app/api/razorpay/route.ts

import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  const body = await req.json();

  const options = {
    amount: 10000, // ₹100 in paise
    currency: "INR",
    receipt: `receipt_order_${Math.random() * 1000}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
