import { redirect } from "next/navigation";
import { Header } from "../../components/Header";
import { AccountPanel } from "../../components/AccountPanel";
import { createClient } from "../../lib/supabase/server";

export const metadata = { title: "Account | Loviant" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?mode=signin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email, role, credits")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-heading">
          <p className="eyebrow">Account</p>
          <h1>{profile?.username || user.email}</h1>
          <p>Manage your credits and account session.</p>
          <AccountPanel />
        </section>
        <section className="price-grid">
          <article className="price-card">
            <span>Credits</span>
            <strong>{profile?.credits ?? 0}</strong>
            <p>New accounts receive 1 free image credit once.</p>
          </article>
          <article className="price-card">
            <span>Email</span>
            <strong className="account-email">{user.email}</strong>
            <p>Supabase Auth account.</p>
          </article>
          <article className="price-card">
            <span>Role</span>
            <strong>{profile?.role || "user"}</strong>
            <p>Admin/owner roles will protect the admin panel later.</p>
          </article>
        </section>
      </main>
    </>
  );
}
