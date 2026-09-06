import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { classroomId, buyerId, listingId } = await req.json();

    if (!classroomId || !buyerId || !listingId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Please use purchaseListing Cloud Function.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Purchase failed" }, { status: 500 });
  }
}
