import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    if (request.method !== "POST") {
      console.log(req.method)
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const data = await request.json();
    console.log("Received data from the frontend:", data);

    return NextResponse.json({message:data})
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({message:"Errror"})
  }
}
