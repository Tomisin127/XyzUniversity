import Link from "next/link";
import { ArrowRight, ShieldCheck, Wallet, Bot } from "lucide-react";
import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { LoginForm } from "@/components/login-form";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <header className="relative z-10 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLockup subtitle="Est. 1974 · Lagos, Nigeria" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#about" className="hover:text-foreground">
              About
            </a>
            <a href="#fees" className="hover:text-foreground">
              Fees
            </a>
            <a href="#agents" className="hover:text-foreground">
              For AI Agents
            </a>
            <Link
              href="#login"
              className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground"
            >
              Student Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-xs text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              2025/2026 Registration Open
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              The official portal of{" "}
              <span className="text-primary">XYZ University</span>.
            </h1>
            <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              Sign in with your matriculation number to access your dashboard,
              clear your school fees via on-chain payment, and complete your
              course registration for the Harmattan semester.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure",
                  body: "Verified bursary settlement.",
                },
                {
                  icon: Wallet,
                  title: "Self-custody",
                  body: "Pay from your own wallet.",
                },
                {
                  icon: Bot,
                  title: "Agent-ready",
                  body: "Let your agent register for you.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-lg border border-border bg-card/40 p-4"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-medium">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div id="login" className="flex items-center justify-center">
            <LoginForm />
          </div>
        </section>

        <section id="fees" className="border-t border-border/60 bg-card/30">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-primary">
                  Bursary
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Fees must clear before registration.
                </h2>
              </div>
              <p className="hidden max-w-sm text-sm leading-relaxed text-muted-foreground md:block">
                Course registration is locked behind your school fees. No
                payment, no courses.
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
              {[
                {
                  k: "01",
                  title: "Sign in",
                  body: "Use your matric number. Demo accepts any value.",
                },
                {
                  k: "02",
                  title: "Pay school fees",
                  body: "Connect a wallet — the bursary verifies your payment instantly.",
                },
                {
                  k: "03",
                  title: "Register courses",
                  body: "Receipt unlocks the live course catalogue.",
                },
              ].map((s) => (
                <div key={s.k} className="bg-background p-6">
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.k}
                  </span>
                  <h3 className="mt-3 text-lg font-medium">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="agents" className="border-t border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-primary">
                  For AI Agents
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                  Hand your registration off to an autonomous agent.
                </h2>
                <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                  Once signed in, ask any wallet-enabled assistant — Claude,
                  ChatGPT, or your own agent — to settle the bursary invoice
                  and walk you through course selection. The agent pays from
                  its own wallet, receives the course catalogue, and asks you
                  which courses to enrol in before submitting.
                </p>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    Works with any wallet-enabled AI assistant.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    Agent pays directly — we never custody funds.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    You confirm every course before submission.
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card/60">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BrandMark size={20} />
                    <span className="font-mono text-xs text-muted-foreground">
                      Agent brief
                    </span>
                  </div>
                  <span className="font-mono text-xs text-primary">
                    paste &amp; go
                  </span>
                </div>
                <div className="space-y-3 p-5 text-sm leading-relaxed text-muted-foreground">
                  <p className="text-foreground">
                    &ldquo;Pay my XYZ University school fees from my wallet and
                    help me register my courses for this semester.&rdquo;
                  </p>
                  <p>
                    Sign in first, then open Course Registration. Your agent
                    will be guided through payment, shown the available
                    courses, and ask which ones to enrol you in. You stay in
                    control of every confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer
          id="about"
          className="border-t border-border/60 py-10 text-center text-xs text-muted-foreground"
        >
          <p>
            XYZ University · Office of the Registrar · Faculty of Engineering &
            Computing
          </p>
          <p className="mt-2">
            Bursary settlement verified on-chain. We never custody your funds.
          </p>
        </footer>
      </main>
    </div>
  );
}
