import { NextResponse } from "next/server";
import { COURSES } from "@/lib/courses";

/**
 * This handler ONLY runs after the x402 middleware has verified payment.
 * If a client calls this without payment, the middleware short-circuits
 * with HTTP 402 + payment requirements before this code is reached.
 *
 * Any HTTP client can consume this — browser wallets via x402-fetch, or
 * an autonomous AI agent that has been instructed to pay the university.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const session = url.searchParams.get("session") ?? "2025/2026";

  return NextResponse.json({
    success: true,
    university: "XYZ University",
    session,
    semester: "Harmattan",
    student_instructions:
      "Select your courses below. Maximum 24 units. GST courses are mandatory.",
    constraints: {
      min_units: 15,
      max_units: 24,
      registration_deadline: "2026-09-30T23:59:59Z",
    },
    courses: COURSES,
    issued_at: new Date().toISOString(),
  });
}
