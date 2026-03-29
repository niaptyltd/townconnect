import { LoginForm } from "@/components/forms/login-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata("Login");

export default function LoginPage() {
  return (
    <section className="section-space">
      <div className="container-shell max-w-2xl">
        <LoginForm />
      </div>
    </section>
  );
}
