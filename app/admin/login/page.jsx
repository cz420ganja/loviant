import Link from "next/link";
import { AdminLoginForm } from "../../../components/AdminLoginForm";

export const metadata = { title: "Admin login | Loviant" };

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const error = typeof params?.error === "string" ? params.error : "";

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/">
          <img className="brand-logo" src="/images/brand-logo.png" alt="Loviant" />
        </Link>
        <div>
          <p className="eyebrow">Owner access</p>
          <h1>Admin login</h1>
          <p>Protected backend controls for credits, generation jobs, users, and RunPod safety.</p>
        </div>
        <AdminLoginForm error={error} />
        <Link className="text-link" href="/">Back to homepage</Link>
      </section>
    </main>
  );
}
