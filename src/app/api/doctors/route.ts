import { NextRequest, NextResponse } from "next/server";
import { searchDoctors } from "@/lib/actions/doctor";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || searchParams.get("search") || searchParams.get("q") || "";
    const doctors = await searchDoctors(query);
    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("GET /api/doctors error:", error);
    return NextResponse.json({ error: "Failed to search doctors", doctors: [] }, { status: 500 });
  }
}
