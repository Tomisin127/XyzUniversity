"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
  Copy,
  Loader2,
  Lock,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { createWalletClient, custom, publicActions } from "viem";
import { base, baseSepolia } from "viem/chains";
import { wrapFetchWithPayment } from "x402-fetch";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type Student = {
  fullName: string;
  matric: string;
  department: string;
  level: string;
};

const NETWORK =
  (process.env.NEXT_PUBLIC_NETWORK as string | undefined) ?? "base-sepolia";
const CHAIN = NETWORK === "base" ? base : baseSepolia;

export function PaywallPanel({
  student,
  requirements,
  onPayingStateChange,
  onUnlocked,
}: {
  student: Student;
  requirements: any | null;
  onPayingStateChange: (s: "paying" | "verifying") => void;
  onUnlocked: (data: any, meta?: { payer?: string }) => void;
}) {
  const [account, setAccount] = useState<`0x${string}` | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const accepts = requirements?.accepts?.[0];
  const price = "$0.01 USDC";
  const network = accepts?.network ?? NETWORK;
  const payTo = accepts?.payTo as string | undefined;

  const endpoint =
    typeof window === "undefined"
      ? "/api/course-registration"
      : `${window.location.origin}/api/course-registration`;

  const connectWallet = async () => {
    setError(null);
    if (typeof window === "undefined" || !window.ethereum) {
      setError(
        "No injected wallet found. Install MetaMask or use a wallet-enabled browser.",
      );
      return;
    }
    try {
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0] as `0x${string}`);
    } catch (err: any) {
      setError(err?.message ?? "Wallet connection rejected");
    }
  };

  const pay = async () => {
    if (!account) {
      await connectWallet();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onPayingStateChange("paying");

      // Make sure wallet is on the right chain
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CHAIN.id.toString(16)}` }],
        });
      } catch (err: any) {
        if (err?.code === 4902) {
          // chain not added — let the user know
          throw new Error(
            `Add ${CHAIN.name} to your wallet first (chainId ${CHAIN.id}).`,
          );
        }
      }

      const walletClient = createWalletClient({
        account,
        chain: CHAIN,
        transport: custom(window.ethereum),
      }).extend(publicActions);

      const fetchWithPay = wrapFetchWithPayment(
        fetch,
        walletClient as any,
      );

      onPayingStateChange("verifying");
      const res = await fetchWithPay("/api/course-registration", {
        method: "GET",
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Settlement failed (${res.status}): ${text}`);
      }
      const data = await res.json();
      onUnlocked(data, { payer: account });
    } catch (err: any) {
      console.log("[v0] x402 payment error:", err);
      setError(err?.shortMessage || err?.message || "Payment failed");
      onPayingStateChange("paying"); // fall back to locked-state UI via parent
    } finally {
      setBusy(false);
    }
  };

  const copyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(endpoint);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* LEFT: invoice / wallet pay */}
      <section className="lg:col-span-3">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card/50">
          <div className="scanlines absolute inset-0" />
          <div className="relative">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">
                  HTTP 402 · Payment Required
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                GET /api/course-registration
              </span>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Course registration is locked behind your school fees. Settle
                  the invoice below on-chain to unlock the course catalogue.
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-border bg-background/60 p-4 text-sm">
                <Cell label="Beneficiary">
                  XYZ University · Bursary
                </Cell>
                <Cell label="Student" mono>
                  {student.matric}
                </Cell>
                <Cell label="Price" tone="primary">
                  {price}
                </Cell>
                <Cell label="Network" mono>
                  {network}
                </Cell>
                <Cell label="Asset">USDC (EIP-3009)</Cell>
                <Cell label="Pay to" mono truncate>
                  {payTo ?? "—"}
                </Cell>
              </dl>

              {error ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                {!account ? (
                  <button
                    onClick={connectWallet}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect wallet
                  </button>
                ) : (
                  <button
                    onClick={pay}
                    disabled={busy}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ShieldCheck className="h-4 w-4" />
                    )}
                    {busy
                      ? "Settling on-chain…"
                      : `Pay ${price} & unlock registration`}
                  </button>
                )}
                {account ? (
                  <span className="inline-flex items-center justify-center rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                    {account.slice(0, 6)}…{account.slice(-4)}
                  </span>
                ) : null}
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                We never custody your funds. The payment is signed in your
                wallet and verified by the x402 facilitator before the bursary
                releases your registration page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: agent / API */}
      <aside className="lg:col-span-2">
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Prefer to send an agent?</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Give your agent this endpoint. It will receive a 402, settle the
            fees from its wallet, then return with the live course list so you
            can pick what to register.
          </p>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <code className="flex-1 truncate font-mono text-xs text-foreground">
              {endpoint}
            </code>
            <button
              onClick={copyEndpoint}
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-primary"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <details className="group mt-4 rounded-md border border-border bg-background/60 p-3">
            <summary className="cursor-pointer text-xs font-medium text-muted-foreground group-open:text-foreground">
              Suggested agent prompt
            </summary>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-muted-foreground">
{`You are my XYZ University registration agent.

1. GET ${endpoint}.
2. If the response is HTTP 402, parse the
   x402 payment requirements and settle them
   from my wallet on ${network}.
3. Retry the request with the signed payment
   header. When you get 200 OK, list every
   course in the response.
4. Ask me which courses to register and what
   total units I want, respecting the
   constraints in the payload.`}
            </pre>
          </details>
        </div>
      </aside>
    </div>
  );
}

function Cell({
  label,
  children,
  mono,
  truncate,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
  truncate?: boolean;
  tone?: "primary";
}) {
  return (
    <div className={truncate ? "min-w-0 col-span-2" : ""}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-sm ${mono ? "font-mono" : ""} ${
          tone === "primary" ? "text-primary font-semibold" : ""
        } ${truncate ? "truncate" : ""}`}
      >
        {children}
      </p>
    </div>
  );
}
