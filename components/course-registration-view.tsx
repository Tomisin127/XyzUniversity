"use client";

import { useMemo, useState } from "react";
import {
  BookOpenCheck,
  Check,
  CheckCircle2,
  Clock,
  Printer,
  Search,
  User,
} from "lucide-react";
import type { Course } from "@/lib/courses";

type Catalogue = {
  university: string;
  session: string;
  semester: string;
  student_instructions: string;
  constraints: {
    min_units: number;
    max_units: number;
    registration_deadline: string;
  };
  courses: Course[];
};

type Student = {
  fullName: string;
  matric: string;
  department: string;
  level: string;
};

export function CourseRegistrationView({
  student,
  catalogue,
  payer,
}: {
  student: Student;
  catalogue: Catalogue;
  payer?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Core" | "Elective" | "GST">(
    "All",
  );
  const [submitted, setSubmitted] = useState(false);

  const filtered = useMemo(() => {
    return catalogue.courses.filter((c) => {
      if (filter !== "All" && c.type !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.lecturer.toLowerCase().includes(q)
      );
    });
  }, [catalogue.courses, query, filter]);

  const units = useMemo(
    () =>
      catalogue.courses
        .filter((c) => selected.has(c.code))
        .reduce((n, c) => n + c.units, 0),
    [catalogue.courses, selected],
  );

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const overCap = units > catalogue.constraints.max_units;
  const underMin = units < catalogue.constraints.min_units;

  if (submitted) {
    return (
      <SubmittedReceipt
        student={student}
        catalogue={catalogue}
        selected={selected}
        units={units}
        payer={payer}
        onEdit={() => setSubmitted(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">
              Payment verified · registration unlocked
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {catalogue.university} · {catalogue.session} ·{" "}
              {catalogue.semester} Semester
              {payer ? (
                <>
                  {" · "}
                  <span className="font-mono">
                    settled by {payer.slice(0, 6)}…{payer.slice(-4)}
                  </span>
                </>
              ) : null}
            </p>
          </div>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          deadline · {new Date(catalogue.constraints.registration_deadline)
            .toISOString()
            .slice(0, 10)}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by code, title or lecturer"
                className="w-full rounded-md border border-border bg-input py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex rounded-md border border-border bg-card p-0.5">
              {(["All", "Core", "Elective", "GST"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded px-3 py-1.5 text-xs ${
                    filter === f
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-card text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3"></th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Lecturer</th>
                  <th className="px-4 py-3 text-right">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => {
                  const isOn = selected.has(c.code);
                  return (
                    <tr
                      key={c.code}
                      onClick={() => toggle(c.code)}
                      className={`cursor-pointer transition ${
                        isOn ? "bg-primary/5" : "hover:bg-card/60"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            isOn
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          }`}
                        >
                          {isOn ? <Check className="h-3.5 w-3.5" /> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{c.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {c.department} · {c.type} ·{" "}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {c.schedule}
                          </span>
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {c.lecturer}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {c.units}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-muted-foreground"
                    >
                      No courses match your search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-xl border border-border bg-card/50 p-5">
            <h3 className="text-sm font-medium">Registration summary</h3>

            <div className="mt-4 space-y-3 text-sm">
              <Row label="Student">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {student.fullName.split(" ")[0]}{" "}
                  {student.fullName.split(" ").slice(-1)}
                </span>
              </Row>
              <Row label="Matric" mono>
                {student.matric}
              </Row>
              <Row label="Courses">
                {selected.size} selected
              </Row>
              <Row label="Units" mono>
                <span
                  className={
                    overCap
                      ? "text-destructive"
                      : underMin
                        ? "text-muted-foreground"
                        : "text-primary"
                  }
                >
                  {units} / {catalogue.constraints.max_units}
                </span>
              </Row>
            </div>

            <div className="my-5 h-px bg-border" />

            <ul className="max-h-56 space-y-2 overflow-auto pr-1 text-xs">
              {Array.from(selected).map((code) => {
                const c = catalogue.courses.find((x) => x.code === code)!;
                return (
                  <li
                    key={code}
                    className="flex items-center justify-between gap-3 rounded border border-border bg-background/60 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono">{c.code}</p>
                      <p className="truncate text-muted-foreground">
                        {c.title}
                      </p>
                    </div>
                    <span className="font-mono text-muted-foreground">
                      {c.units}u
                    </span>
                  </li>
                );
              })}
              {selected.size === 0 ? (
                <li className="rounded border border-dashed border-border px-3 py-6 text-center text-muted-foreground">
                  Tick courses on the left to add them here.
                </li>
              ) : null}
            </ul>

            <button
              onClick={() => setSubmitted(true)}
              disabled={selected.size === 0 || overCap || underMin}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BookOpenCheck className="h-4 w-4" />
              Submit registration
            </button>

            {overCap ? (
              <p className="mt-2 text-xs text-destructive">
                You&apos;ve exceeded the {catalogue.constraints.max_units}-unit
                cap.
              </p>
            ) : underMin ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Minimum {catalogue.constraints.min_units} units required to
                submit.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
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
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={`text-sm ${mono ? "font-mono" : ""}`}>{children}</span>
    </div>
  );
}

function SubmittedReceipt({
  student,
  catalogue,
  selected,
  units,
  payer,
  onEdit,
}: {
  student: Student;
  catalogue: Catalogue;
  selected: Set<string>;
  units: number;
  payer?: string;
  onEdit: () => void;
}) {
  const courses = catalogue.courses.filter((c) => selected.has(c.code));
  const ref = `XYZU-REG-${Date.now().toString(36).toUpperCase()}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-xl border border-border bg-card/40">
        <div className="flex items-center justify-between border-b border-border bg-primary/5 px-6 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium">Registration submitted</p>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Printer className="h-3.5 w-3.5" /> Print receipt
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Reference" mono>
              {ref}
            </Field>
            <Field label="Issued">
              {new Date().toUTCString()}
            </Field>
            <Field label="Student">{student.fullName}</Field>
            <Field label="Matric" mono>
              {student.matric}
            </Field>
            <Field label="Department">{student.department}</Field>
            <Field label="Level / Session">
              {student.level} · {catalogue.session}
            </Field>
            <Field label="Total units" mono>
              {units}
            </Field>
            <Field label="Fee settled by" mono>
              {payer ? `${payer.slice(0, 6)}…${payer.slice(-4)}` : "on-chain"}
            </Field>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Code</th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Lecturer</th>
                  <th className="px-4 py-2 text-right">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((c) => (
                  <tr key={c.code}>
                    <td className="px-4 py-2 font-mono text-xs">{c.code}</td>
                    <td className="px-4 py-2">{c.title}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {c.lecturer}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">
                      {c.units}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            This receipt is generated for the current session only and is not
            persisted in any database. Present it to your faculty officer for
            advisor sign-off.
          </p>

          <button
            onClick={onEdit}
            className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Edit registration
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
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
