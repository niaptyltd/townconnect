import { RegisterForm } from "@/components/forms/register-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("Register");

export default function RegisterPage() {
  return (
    <section className="section-space">
      <div className="container-shell max-w-3xl">
        <RegisterForm />
      </div>
    </section>
  );
}
