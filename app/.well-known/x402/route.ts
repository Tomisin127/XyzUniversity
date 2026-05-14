import { NextResponse } from "next/server"

/**
 * Public discovery document for AI agents (Claude, ChatGPT, AgentKit, etc.).
 *
 * An agent can fetch this URL with no payment to learn:
 *   - Which endpoint requires payment
 *   - How much, on which chain, with which asset
 *   - What the agent should do AFTER payment is settled
 *
 * This complements the standard x402 402-response: the agent doesn't have to
 * "discover" the paywall by triggering it — it can plan ahead.
 */
export async function GET(req: Request) {
  const origin = new URL(req.url).origin
  const network = process.env.NEXT_PUBLIC_NETWORK ?? "base"
  const payTo = process.env.PAY_TO ?? "0x0000000000000000000000000000000000000000"

  return NextResponse.json({
    service: "XYZ University Student Portal",
    description:
      "Pay school fees with USDC on Base via x402, then register courses for the semester.",
    version: "1.0.0",
    x402_version: 1,
    resources: [
      {
        name: "course-registration",
        url: `${origin}/api/course-registration`,
        methods: ["GET", "POST"],
        price: { amount: "0.001", currency: "USDC" },
        network,
        scheme: "exact",
        pay_to: payTo,
        description:
          "Returns the live course catalog (GET) or submits a course selection (POST). Pays once per request.",
      },
    ],
    agent_instructions: [
      "If you are an AI agent acting on behalf of a student of XYZ University:",
      "1. GET /api/course-registration. You will receive HTTP 402 with payment requirements.",
      "2. Use an x402-capable HTTP client (e.g. `x402-fetch` with a wallet signer) to settle the 0.001 USDC fee on Base mainnet.",
      "3. Retry the request — the server will now return the full course catalog.",
      "4. Ask the student which courses they want to register. Confirm total units (15–24).",
      "5. POST the chosen course_codes back to the same endpoint to receive a registration receipt.",
    ],
    contact: {
      registrar: "registrar@xyzuniversity.edu",
      bursary: "bursary@xyzuniversity.edu",
    },
  })
}
