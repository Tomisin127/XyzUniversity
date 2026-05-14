"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Receipt,
  Wallet,
} from "lucide-react";
import { DISPLAY_FEE_NGN, DISPLAY_FEE_USD } from "@/lib/courses";

type Student = {
  fullName: string;
  matric: string;
  department: string;
  level: string;
};

export function DashboardClient() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [feePaid, setFeePaid] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xyz_student");
      if (!raw) {
        router.replace("/");
        return;
      }
      setStudent(JSON.parse(raw));
      setFeePaid(localStorage.getItem("xyz_fee_paid") === "1");
    } catch {
      router.replace("/");
    } finally {
      setHydrated(true);
    }
  }, [router]);

  if (!hydrated || !student) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card/40" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">
            Welcome back
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {student.fullName.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {student.department} · {student.level} Level ·{" "}
            <span className="font-mono">{student.matric}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          Session 2025 / 2026 · Harmattan
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={GraduationCap}
          label="CGPA"
          value="4.21"
          hint="Last semester"
        />
        <StatCard
          icon={BookOpenCheck}
          label="Units carried"
          value="18 / 24"
          hint="Cap for this semester"
        />
        <StatCard
          icon={Receipt}
          label="Bursary balance"
          value={feePaid ? "Cleared" : DISPLAY_FEE_NGN}
          hint={feePaid ? "Receipt issued" : "Outstanding fees"}
          tone={feePaid ? "ok" : "warn"}
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {feePaid ? (
            <PaidPanel />
          ) : (
            <UnpaidPanel matric={student.matric} fullName={student.fullName} />
          )}
        </div>

        <aside className="rounded-xl border border-border bg-card/40 p-5">
          <h3 className="text-sm font-medium">Announcements</h3>
          <ul className="mt-4 space-y-4 text-sm">
            <li>
              <p className="font-medium">Course registration closes Sep 30.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Late registration attracts a ₦15,000 surcharge.
              </p>
            </li>
            <li>
              <p className="font-medium">x402 payment rails now live.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Pay directly from a self-custodial wallet — no card needed.
              </p>
            </li>
            <li>
              <p className="font-medium">Matriculation gown pickup.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Faculty office, weekdays 10am–3pm.
              </p>
            </li>
          </ul>
        </aside>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: any;
  label: string;
  value: string;
  hint: string;
  tone?: "neutral" | "ok" | "warn";
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon
          className={`h-4 w-4 ${
            tone === "warn"
              ? "text-destructive"
              : tone === "ok"
                ? "text-primary"
                : "text-muted-foreground"
          }`}
        />
      </div>
      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${
          tone === "warn"
            ? "text-destructive"
            : tone === "ok"
              ? "text-primary"
              : ""
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function UnpaidPanel({
  matric,
  fullName,
}: {
  matric: string;
  fullName: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-destructive/40 bg-gradient-to-br from-destructive/10 via-card/40 to-card/40 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">School fees outstanding.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your access to course registration is suspended until the bursary
            confirms payment for the 2025/2026 session.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Row label="Student">{fullName}</Row>
        <Row label="Matric" mono>
          {matric}
        </Row>
        <Row label="Invoice" mono>
          INV-2526-{matric.slice(-4)}
        </Row>
        <Row label="Due" mono>
          30 Sep 2026
        </Row>
        <Row label="Amount">{DISPLAY_FEE_NGN}</Row>
        <Row label="≈ USD" mono>
          {DISPLAY_FEE_USD}
        </Row>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-background/60 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Settle on-chain via x402
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          For this demo the fee is symbolic ($0.01 USDC on Base) so you can walk
          through the full flow end-to-end. The real invoice above is shown for
          UX fidelity only.
        </p>
        <Link
          href="/register"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Wallet className="h-4 w-4" />
          Proceed to payment & registration
        </Link>
      </div>
    </div>
  );
}

function PaidPanel() {
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-md border border-primary/40 bg-primary/10 p-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">School fees cleared.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Bursary confirmed your on-chain payment. You can now register your
            courses for this semester.
          </p>
        </div>
      </div>
      <Link
        href="/register"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        <BookOpenCheck className="h-4 w-4" />
        Open course registration
      </Link>
    </div>
  );
}

function Row({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{children}</p>
    </div>
  );
}
