import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Meta Ads Dashboard API",
    timestamp: new Date().toISOString(),
  });
}
