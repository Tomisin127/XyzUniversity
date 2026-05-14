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
  const [copied, setCopied] = useState(false);

  const accepts = requirements?.accepts?.[0];
  const price = "$0.001 USDC";
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
        <AgentPanel
          endpoint={endpoint}
          network={network}
          payTo={payTo}
          price={price}
          student={student}
          onCopyEndpoint={copyEndpoint}
          endpointCopied={copied}
        />
      </aside>
    </div>
  );
}

function AgentPanel({
  endpoint,
  network,
  payTo,
  price,
  student,
  onCopyEndpoint,
  endpointCopied,
}: {
  endpoint: string;
  network: string;
  payTo?: string;
  price: string;
  student: Student;
  onCopyEndpoint: () => void;
  endpointCopied: boolean;
}) {
  const [tab, setTab] = useState<"claude" | "js" | "python">("claude");
  const [promptCopied, setPromptCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

  const claudePrompt = `You are my registration agent for XYZ University.

ENDPOINT: ${endpoint}
NETWORK:  ${network} (Base mainnet, USDC)
PRICE:    ${price} per call
PAY TO:   ${payTo ?? "(from 402 response)"}

What I need you to do:
1. GET ${endpoint}.
2. The server responds with HTTP 402 + a JSON
   body describing the x402 payment requirements.
   Parse "accepts[0]" — it tells you the scheme,
   network, asset, price and payTo address.
3. Using my connected wallet (or an x402-aware
   HTTP client like x402-fetch), sign an
   EIP-3009 transferWithAuthorization for the
   amount and attach it as the X-PAYMENT header.
4. Retry the GET. You should now receive 200 OK
   with the full course catalog and an
   "agent_protocol" array. Follow those steps.
5. Show me the courses grouped by department.
   Ask me which course codes to register. Make
   sure my total units land between 15 and 24.
6. Once I confirm, POST ${endpoint}
   with body: { "matric_no": "${student.matric}",
   "student_name": "${student.fullName}",
   "course_codes": [ ...the codes I picked ] }.
7. Read back the registration_id from the
   response so I can quote it at the registrar.

If anything fails, show me the raw response so I
can troubleshoot.`;

  const jsSnippet = `// npm i x402-fetch viem
import { wrapFetchWithPayment } from "x402-fetch";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const wallet  = createWalletClient({
  account, chain: base, transport: http()
});

const fetchWithPay = wrapFetchWithPayment(fetch, wallet);

// 1. fetch catalog (auto-pays the 402)
const r1 = await fetchWithPay("${endpoint}");
const catalog = await r1.json();
console.log(catalog.courses.map(c => c.code));

// 2. submit chosen courses
const r2 = await fetchWithPay("${endpoint}", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    matric_no: "${student.matric}",
    course_codes: ["CSC301","CSC305","MTH301","GST301"]
  })
});
console.log(await r2.json());`;

  const pythonSnippet = `# pip install x402 eth-account requests
from x402.clients.requests import x402_requests
from eth_account import Account
import os, json

account = Account.from_key(os.environ["PRIVATE_KEY"])
session = x402_requests(account)

# 1. pulls catalog, automatically settling the 402
r1 = session.get("${endpoint}")
catalog = r1.json()
print([c["code"] for c in catalog["courses"]])

# 2. submit registration
r2 = session.post(
    "${endpoint}",
    json={
        "matric_no": "${student.matric}",
        "course_codes": ["CSC301","CSC305","MTH301","GST301"],
    },
)
print(r2.json())`;

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(claudePrompt);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 1500);
  };
  const copySnippet = async () => {
    await navigator.clipboard.writeText(tab === "js" ? jsSnippet : pythonSnippet);
    setSnippetCopied(true);
    setTimeout(() => setSnippetCopied(false), 1500);
  };

  return (
    <div className="rounded-xl border border-border bg-card/40">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">
            Pay with Claude or another AI agent
          </h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          x402 ready
        </span>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          You don&apos;t have to pay yourself. Hand the endpoint to your AI
          agent — Claude, ChatGPT with an x402 tool, AgentKit, etc. It will hit
          the URL, see the 402, settle{" "}
          <span className="text-primary font-medium">{price}</span> from its
          wallet on{" "}
          <span className="font-mono text-foreground">{network}</span> and walk
          you through course selection.
        </p>

        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <code className="flex-1 truncate font-mono text-xs text-foreground">
            {endpoint}
          </code>
          <button
            onClick={onCopyEndpoint}
            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-primary"
          >
            <Copy className="h-3 w-3" />
            {endpointCopied ? "Copied" : "Copy"}
          </button>
        </div>

        <div>
          <div className="flex gap-1 rounded-md border border-border bg-background p-1 text-xs">
            <TabButton active={tab === "claude"} onClick={() => setTab("claude")}>
              Claude prompt
            </TabButton>
            <TabButton active={tab === "js"} onClick={() => setTab("js")}>
              JS / Node
            </TabButton>
            <TabButton active={tab === "python"} onClick={() => setTab("python")}>
              Python
            </TabButton>
          </div>

          <div className="mt-3 rounded-md border border-border bg-background/80">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {tab === "claude"
                  ? "Paste into Claude"
                  : tab === "js"
                    ? "x402-fetch (Node/TS)"
                    : "x402 Python SDK"}
              </span>
              <button
                onClick={tab === "claude" ? copyPrompt : copySnippet}
                className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-primary"
              >
                <Copy className="h-3 w-3" />
                {tab === "claude"
                  ? promptCopied
                    ? "Copied"
                    : "Copy prompt"
                  : snippetCopied
                    ? "Copied"
                    : "Copy code"}
              </button>
            </div>
            <pre className="max-h-72 overflow-auto whitespace-pre p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {tab === "claude"
                ? claudePrompt
                : tab === "js"
                  ? jsSnippet
                  : pythonSnippet}
            </pre>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Agents can also call{" "}
          <code className="rounded bg-background px-1 py-0.5 font-mono text-[10px] text-foreground">
            GET /.well-known/x402
          </code>{" "}
          first to discover this resource without triggering the paywall.
        </p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
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
