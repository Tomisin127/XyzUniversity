import { paymentMiddleware, type Network } from "x402-next";

/**
 * x402 Payment Wall for XYZ University.
 *
 * Protects the course registration data endpoint. Any HTTP client (browser
 * wallet OR an AI agent) that calls `/api/course-registration` without a
 * valid payment will receive an HTTP 402 Payment Required response with
 * the on-chain payment requirements.
 *
 * After settling payment via the facilitator the same endpoint returns
 * the live course catalogue.
 *
 * Defaults to Base Sepolia testnet so anyone with a testnet USDC wallet
 * can complete the flow. Switch NEXT_PUBLIC_NETWORK to "base" for mainnet.
 */
const PAY_TO = (process.env.PAY_TO ??
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

const NETWORK = (process.env.NEXT_PUBLIC_NETWORK ?? "base") as Network;

// On testnet, the public x402.org facilitator is used by default.
// For mainnet ("base") set FACILITATOR_URL to e.g.
//   https://facilitator.payai.network  (no auth)
//   https://api.cdp.coinbase.com/platform/v2/x402  (requires CDP keys)
// For mainnet we default to the PayAI facilitator (no auth, mainnet capable).
// Override with FACILITATOR_URL if you want CDP or another provider.
const FACILITATOR_URL =
  process.env.FACILITATOR_URL ??
  (NETWORK === "base" ? "https://facilitator.payai.network" : undefined);

export const middleware = paymentMiddleware(
  PAY_TO,
  {
    "/api/course-registration": {
      price: "$0.001",
      network: NETWORK,
      config: {
        description:
          "XYZ University — 2025/2026 academic session school fees. Grants access to course registration.",
        mimeType: "application/json",
        maxTimeoutSeconds: 120,
      },
    },
  },
  FACILITATOR_URL ? { url: FACILITATOR_URL as `${string}://${string}` } : undefined,
);

export const config = {
  matcher: ["/api/course-registration"],
  runtime: "nodejs",
};
