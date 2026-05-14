import { PortalHeader } from "@/components/portal-header";
import { RegisterClient } from "@/components/register-client";

export default function RegisterPage() {
  return (
    <>
      <PortalHeader subtitle="Course Registration" />
      <RegisterClient />
    </>
  );
}
