import Link from "next/link";
import { LoginForms } from "../../components/LoginForms";

export const metadata = { title: "Sign in or sign up | Loviant" };

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const mode = params?.mode === "signup" || params?.mode === "signin" ? params.mode : null;
  const error = typeof params?.error === "string" ? params.error : "";

  return (
    <main className="auth-layout">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/brand-logo.png" alt="Loviant" /></Link>
        <div><p className="eyebrow">Member access</p><h1>Sign in or create account</h1><p>Access matches, credits, image editing, video generation, and your private companions.</p></div>
        <LoginForms initialMode={mode} error={error} />
        <Link className="text-link" href="/">Back to homepage</Link>
      </section>
    </main>
  );
}
