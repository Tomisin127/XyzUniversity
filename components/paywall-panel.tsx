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
  (process.env.NEXT_PUBLIC_NETWORK as string | undefined) ?? "base";
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

  const accepts = requirements?.accepts?.[0];
  const price = "$0.001 USDC";
  const network = accepts?.network ?? NETWORK;
  // We deliberately do not surface the payTo address or endpoint path in the UI.

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

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${CHAIN.id.toString(16)}` }],
        });
      } catch (err: any) {
        if (err?.code === 4902) {
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

      const fetchWithPay = wrapFetchWithPayment(fetch, walletClient as any);

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
      setError(err?.shortMessage || err?.message || "Payment failed");
      onPayingStateChange("paying");
    } finally {
      setBusy(false);
    }
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
                  Bursary · Payment Required
                </span>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Locked
              </span>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Course registration is locked behind your school fees. Settle
                  the invoice below to unlock the course catalogue.
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-border bg-background/60 p-4 text-sm">
                <Cell label="Beneficiary">
                  XYZ University · Bursary
                </Cell>
                <Cell label="Student" mono>
                  {student.matric}
                </Cell>
                <Cell label="Amount due" tone="primary">
                  {price}
                </Cell>
                <Cell label="Network" mono>
                  {network}
                </Cell>
                <Cell label="Asset">USDC</Cell>
                <Cell label="Reference" mono>
                  BUR-{student.matric.slice(-4)}-{network.slice(0, 4).toUpperCase()}
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
                wallet and verified by the bursary before your registration
                page is released.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT: agent / API */}
      <aside className="lg:col-span-2">
        <AgentPanel price={price} network={network} student={student} />
      </aside>
    </div>
  );
}

function AgentPanel({
  price,
  network,
  student,
}: {
  price: string;
  network: string;
  student: Student;
}) {
  const [endpoint, setEndpoint] = useState("/api/course-registration");
  const [copied, setCopied] = useState(false);

  // Resolve to an absolute URL on the client so the prompt is paste-ready.
  if (typeof window !== "undefined" && endpoint.startsWith("/")) {
    const abs = `${window.location.origin}/api/course-registration`;
    if (abs !== endpoint) setEndpoint(abs);
  }

  const prompt = `You are my XYZ University registration agent.

ENDPOINT: ${endpoint}
NETWORK:  ${network}
PRICE:    ${price} per call
STUDENT:  ${student.fullName} (${student.matric})

What I need you to do:
1. GET ${endpoint}.
2. The server responds with HTTP 402 and a JSON
   body describing the payment requirements.
   Parse "accepts[0]" — it tells you the scheme,
   network, asset, price and payTo address.
3. Using my connected wallet (or an x402-aware
   HTTP client like x402-fetch), sign the
   authorization for the amount and attach it as
   the X-PAYMENT header.
4. Retry the GET. You should now receive 200 OK
   with the full course catalogue.
5. Show me the courses grouped by department.
   Ask me which course codes to register and make
   sure my total units land between 15 and 24.
6. Once I confirm, POST ${endpoint}
   with body: { "matric_no": "${student.matric}",
   "student_name": "${student.fullName}",
   "course_codes": [ ...the codes I picked ] }.
7. Read back the registration_id so I can quote
   it at the registrar.

If anything fails, show me the raw response.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card/40">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Delegate to your AI agent</h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Agent ready
        </span>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Paste this prompt into Claude or any wallet-enabled assistant. It
          will settle the invoice from its wallet, fetch your course catalogue,
          and walk you through registration.
        </p>

        <div className="rounded-md border border-border bg-background/80">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Agent prompt
            </span>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-primary"
            >
              <Copy className="h-3 w-3" />
              {copied ? "Copied" : "Copy prompt"}
            </button>
          </div>
          <pre className="max-h-72 overflow-auto whitespace-pre p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
            {prompt}
          </pre>
        </div>
      </div>
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
