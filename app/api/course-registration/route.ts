import { NextResponse } from "next/server"
import { COURSES } from "@/lib/courses"

/**
 * This handler ONLY runs after the x402 middleware has verified payment.
 * If a client calls this without payment, the middleware short-circuits
 * with HTTP 402 + payment requirements before this code is reached.
 *
 * Any HTTP client can consume this — browser wallets via x402-fetch, or
 * an autonomous AI agent (Claude, ChatGPT, AgentKit, etc.) that has been
 * instructed to pay the university school fees.
 *
 * The response is intentionally agent-friendly:
 *   - A natural-language `agent_protocol` that any LLM can follow
 *   - A machine-readable `submit` action describing the POST endpoint
 *   - A normalized `courses[]` list with codes, titles, units, lecturers
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const session = url.searchParams.get("session") ?? "2025/2026"

  return NextResponse.json({
    success: true,
    university: "XYZ University",
    motto: "Knowledge. Integrity. Service.",
    session,
    semester: "Harmattan",
    agent_protocol: [
      "You are helping a student of XYZ University register their courses for the current semester.",
      "1. Read the `courses` array below. Each course has a `code`, `title`, `units`, `level`, `department`, `lecturer`, and `schedule`.",
      "2. Ask the student which courses they want to register. They may give you course codes (e.g. 'CSC301') or natural descriptions ('the AI elective').",
      "3. Match the student's input to course codes in this catalog. Confirm the final list with the student.",
      "4. Make sure the total `units` is between `constraints.min_units` and `constraints.max_units`.",
      "5. Submit the registration by POSTing to `submit.url` with the body shape in `submit.body_schema`. The payment is already settled — no further payment is required for submission within this session.",
      "6. Return the server's confirmation receipt (containing `registration_id`) to the student.",
    ],
    student_instructions:
      "Select your courses below. Maximum 24 units, minimum 15. GST courses are mandatory for 100/200 level students.",
    constraints: {
      min_units: 15,
      max_units: 24,
      registration_deadline: "2026-09-30T23:59:59Z",
    },
    submit: {
      method: "POST",
      url: "/api/course-registration",
      body_schema: {
        student_name: "string (optional, defaults to logged-in student)",
        matric_no: "string (optional)",
        course_codes: "string[]  // e.g. ['CSC301','CSC305','GST201']",
      },
      example_body: {
        student_name: "Adaeze Okeke",
        matric_no: "XYZ/2023/00481",
        course_codes: ["CSC301", "CSC305", "MTH301", "GST301"],
      },
    },
    courses: COURSES,
    issued_at: new Date().toISOString(),
  })
}

/**
 * Course submission endpoint (also paywalled by middleware).
 * Accepts a list of course_codes and returns a confirmation receipt.
 * Nothing is persisted to a database — this is intentionally stateless.
 */
export async function POST(req: Request) {
  let body: {
    student_name?: string
    matric_no?: string
    course_codes?: string[]
  } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body. Expected { course_codes: string[] }." },
      { status: 400 },
    )
  }

  const codes = (body.course_codes ?? []).map((c) => c.trim().toUpperCase())
  if (codes.length === 0) {
    return NextResponse.json(
      { success: false, error: "No course_codes provided." },
      { status: 400 },
    )
  }

  const known = new Set(COURSES.map((c) => c.code))
  const unknown = codes.filter((c) => !known.has(c))
  if (unknown.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: `Unknown course codes: ${unknown.join(", ")}`,
        hint: "Call GET /api/course-registration to see the catalog.",
      },
      { status: 422 },
    )
  }

  const registered = COURSES.filter((c) => codes.includes(c.code))
  const totalUnits = registered.reduce((s, c) => s + c.units, 0)

  if (totalUnits < 15 || totalUnits > 24) {
    return NextResponse.json(
      {
        success: false,
        error: `Total units must be between 15 and 24. You selected ${totalUnits}.`,
        registered,
      },
      { status: 422 },
    )
  }

  const registrationId = `XYZ-${Date.now().toString(36).toUpperCase()}`

  return NextResponse.json({
    success: true,
    university: "XYZ University",
    registration_id: registrationId,
    student_name: body.student_name ?? "XYZ Student",
    matric_no: body.matric_no ?? "XYZ/2023/00481",
    session: "2025/2026",
    semester: "Harmattan",
    total_units: totalUnits,
    courses: registered,
    receipt_issued_at: new Date().toISOString(),
    message:
      "Course registration successful. Please present this registration_id at your faculty office.",
  })
}
