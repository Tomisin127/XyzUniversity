import { PortalHeader } from "@/components/portal-header";
import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <>
      <PortalHeader subtitle="Student Dashboard" />
      <DashboardClient />
    </>
  );
}
