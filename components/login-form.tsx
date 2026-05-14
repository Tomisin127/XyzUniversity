"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";

const DEPTS = [
  "Computer Science",
  "Electrical Engineering",
  "Mathematics",
  "Biological Sciences",
  "Mechanical Engineering",
];

export function LoginForm() {
  const router = useRouter();
  const [matric, setMatric] = useState("XYZ/CSC/21/0421");
  const [fullName, setFullName] = useState("Adeola Bankole");
  const [department, setDepartment] = useState(DEPTS[0]);
  const [level, setLevel] = useState("400");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    localStorage.setItem(
      "xyz_student",
      JSON.stringify({ matric, fullName, department, level }),
    );
    setTimeout(() => router.push("/dashboard"), 350);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-xl border border-border bg-card/80 p-6 shadow-2xl shadow-black/40 backdrop-blur"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Student Sign-in</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Use your XYZU credentials.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
          <Lock className="h-3 w-3" /> SSO · v3
        </span>
      </div>

      <div className="space-y-4">
        <Field
          label="Matriculation Number"
          value={matric}
          onChange={setMatric}
          mono
          required
        />
        <Field
          label="Full Name"
          value={fullName}
          onChange={setFullName}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {DEPTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
            >
              {["100", "200", "300", "400", "500"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in to portal"}
        <ArrowRight className="h-4 w-4" />
      </button>

      <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        By signing in you accept the XYZU Acceptable Use Policy. Forgot your
        credentials? Visit the Registrar.
      </p>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  mono,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary ${
          mono ? "font-mono" : ""
        }`}
      />
    </div>
  );
}
