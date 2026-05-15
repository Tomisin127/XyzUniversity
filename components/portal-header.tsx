"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { BrandLockup } from "./brand-mark";
import { useRouter } from "next/navigation";

type Student = {
  fullName: string;
  matric: string;
  department: string;
  level: string;
};

export function PortalHeader({ subtitle }: { subtitle?: string }) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("xyz_student");
      if (raw) setStudent(JSON.parse(raw));
    } catch {}
  }, []);

  const signOut = () => {
    localStorage.removeItem("xyz_student");
    localStorage.removeItem("xyz_fee_paid");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <BrandLockup subtitle={subtitle ?? "Student Portal"} />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Course Registration
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {student ? (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">
                {student.fullName}
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                {student.matric}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
