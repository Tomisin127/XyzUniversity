"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bot,
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
        <AgentPanel price={price} />
      </aside>
    </div>
  );
}

function AgentPanel({ price }: { price: string }) {
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

      <div className="space-y-4 p-5 text-sm leading-relaxed text-muted-foreground">
        <p>
          You don&apos;t have to pay yourself. Ask your AI agent — Claude,
          ChatGPT, or any wallet-enabled assistant — to settle the bursary
          invoice and walk you through registration.
        </p>
        <p>
          Tell it:{" "}
          <span className="text-foreground">
            &quot;Pay my XYZ University school fees of {price} from my wallet
            and help me register my courses.&quot;
          </span>{" "}
          Once the payment clears, the agent will be handed your course
          worksheet and can ask you which courses to enrol in.
        </p>
        <ul className="space-y-2 rounded-md border border-border bg-background/60 p-4 text-xs">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            Works with any wallet-enabled assistant.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            Agent signs the payment; we never see your keys.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-primary">•</span>
            You confirm every course before submission.
          </li>
        </ul>
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
