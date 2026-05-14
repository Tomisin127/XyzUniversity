"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Course } from "@/lib/courses";
import { PaywallPanel } from "./paywall-panel";
import { CourseRegistrationView } from "./course-registration-view";

type Student = {
  fullName: string;
  matric: string;
  department: string;
  level: string;
};

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

type Status =
  | { kind: "loading" }
  | { kind: "locked"; requirements: any | null }
  | { kind: "paying" }
  | { kind: "verifying" }
  | { kind: "unlocked"; data: Catalogue; txMeta?: { payer?: string } }
  | { kind: "error"; message: string };

export function RegisterClient() {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [status, setStatus] = useState<Status>({ kind: "loading" });

  // Initial probe — see if the endpoint requires payment for this session.
  const probe = useCallback(async () => {
    try {
      const res = await fetch("/api/course-registration", {
        cache: "no-store",
      });
      if (res.status === 402) {
        const body = await res.json().catch(() => null);
        setStatus({ kind: "locked", requirements: body });
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as Catalogue;
        setStatus({ kind: "unlocked", data });
        localStorage.setItem("xyz_fee_paid", "1");
        return;
      }
      setStatus({
        kind: "error",
        message: `Unexpected response: ${res.status}`,
      });
    } catch (err: any) {
      setStatus({ kind: "error", message: err?.message ?? "Network error" });
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xyz_student");
      if (!raw) {
        router.replace("/");
        return;
      }
      setStudent(JSON.parse(raw));
    } catch {
      router.replace("/");
      return;
    }
    probe();
  }, [router, probe]);

  const onUnlocked = useCallback(
    (data: Catalogue, txMeta?: { payer?: string }) => {
      localStorage.setItem("xyz_fee_paid", "1");
      setStatus({ kind: "unlocked", data, txMeta });
    },
    [],
  );

  const body = useMemo(() => {
    if (!student || status.kind === "loading") {
      return (
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card/40" />
      );
    }
    if (status.kind === "error") {
      return (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm">
          <p className="font-semibold text-destructive">
            Could not reach the bursary.
          </p>
          <p className="mt-1 text-muted-foreground">{status.message}</p>
        </div>
      );
    }
    if (status.kind === "unlocked") {
      return (
        <CourseRegistrationView
          student={student}
          catalogue={status.data}
          payer={status.txMeta?.payer}
        />
      );
    }
    return (
      <PaywallPanel
        student={student}
        requirements={status.kind === "locked" ? status.requirements : null}
        onPayingStateChange={(s) => setStatus({ kind: s })}
        onUnlocked={onUnlocked}
      />
    );
  }, [status, student, onUnlocked]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{body}</main>
  );
}
