import { Header } from "../../components/Header";
import { AdminLogoutButton } from "../../components/AdminLogoutButton";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminCookieName, verifyAdminSession } from "../../lib/adminAuth";
import { getAdminDashboardData } from "../../lib/adminData";

export const metadata = { title: "Admin | Loviant" };

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const success = typeof params?.success === "string" ? params.success : "";
  const error = typeof params?.error === "string" ? params.error : "";
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSession(session)) {
    redirect("/admin/login");
  }

  const dashboard = await getAdminDashboardData();
  const stats = dashboard.stats;

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-heading">
          <p className="eyebrow">Admin</p>
          <h1>Backend control panel.</h1>
          <p>Owner/admin-only controls for users, credits, payments, RunPod generation, and site safety.</p>
          <AdminLogoutButton />
        </section>
        {dashboard.setupRequired && (
          <section className="deposit-panel admin-warning">
            <h2>Supabase admin setup needed</h2>
            <p>{dashboard.message}</p>
            <p>Run the local supabase/schema.sql file in Supabase SQL Editor, then add SUPABASE_SERVICE_ROLE_KEY to .env.local and your deployment environment.</p>
          </section>
        )}
        {success && <p className="form-status is-success admin-status">{success}</p>}
        {error && <p className="form-status is-error admin-status">{error}</p>}
        <section className="price-grid admin-grid">
          <article className="price-card"><span>Users</span><strong>{stats.users}</strong><p>Profiles registered in Supabase.</p></article>
          <article className="price-card"><span>Credits issued</span><strong>{stats.creditsIssued}</strong><p>Total positive entries in the credit ledger.</p></article>
          <article className="price-card"><span>Credits spent</span><strong>{stats.creditsSpent}</strong><p>Total credits consumed or reserved by jobs.</p></article>
          <article className="price-card"><span>RunPod queue</span><strong>{stats.pendingJobs}</strong><p>Queued or running generation jobs.</p></article>
          <article className="price-card"><span>Failed jobs</span><strong>{stats.failedJobs}</strong><p>Jobs needing refund, retry, or review.</p></article>
          <article className="price-card"><span>Daily spend</span><strong>${stats.estimatedSpendTodayUsd.toFixed(2)}</strong><p>Limit: ${stats.dailySpendLimitUsd.toFixed(2)}.</p></article>
        </section>
        <section className="deposit-panel">
          <h2>User credit tools</h2>
          <form className="admin-credit-form" action="/admin/credits" method="post">
            <label className="prompt-label">
              User email or ID
              <input name="userLookup" type="text" placeholder="user@email.com or Supabase user ID" required />
            </label>
            <div className="control-grid">
              <label className="prompt-label">
                Action
                <select name="action" defaultValue="add">
                  <option value="add">Add credits</option>
                  <option value="remove">Remove credits</option>
                </select>
              </label>
              <label className="prompt-label">
                Amount
                <input name="amount" type="number" min="1" step="1" placeholder="10" required />
              </label>
            </div>
            <label className="prompt-label">
              Admin note
              <input name="note" type="text" placeholder="Reason for this adjustment" />
            </label>
            <button className="generate-button" type="submit">Apply credit adjustment</button>
          </form>
        </section>
        <section className="deposit-panel">
          <h2>Recent users</h2>
          <div className="admin-table">
            {dashboard.recentUsers.length ? dashboard.recentUsers.map((user) => (
              <div className="admin-row admin-row-wide" key={user.id}>
                <span>{user.email || user.username || user.id}</span>
                <strong>{user.credits} credits</strong>
                <small>{user.role}</small>
                <Link className="text-link admin-inline-link" href={`/admin/users/${user.id}`}>View / manage</Link>
              </div>
            )) : <p>No users yet.</p>}
          </div>
        </section>
        <section className="deposit-panel">
          <h2>RunPod safety controls</h2>
          <p>RunPod enabled: {stats.runpodEnabled ? "yes" : "no"}. Daily spend cap, per-user rate limits, max queued jobs, and model credit costs are now represented in the database schema and ready for backend wiring.</p>
        </section>
        <section className="deposit-panel">
          <h2>Payment controls</h2>
          <p>Payments table is ready for Stripe sessions and crypto transaction hashes. Credits should only be issued after backend confirmation creates a positive credit ledger row.</p>
        </section>
        <section className="deposit-panel">
          <h2>Recent credit ledger</h2>
          <div className="admin-table">
            {dashboard.recentLedger.length ? dashboard.recentLedger.map((entry) => (
              <div className="admin-row" key={entry.id}>
                <span>{entry.reason}</span>
                <strong>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</strong>
                <small>{new Date(entry.created_at).toLocaleString()}</small>
              </div>
            )) : <p>No ledger entries yet.</p>}
          </div>
        </section>
        <section className="deposit-panel">
          <h2>Recent generation jobs</h2>
          <div className="admin-table">
            {dashboard.recentJobs.length ? dashboard.recentJobs.map((job) => (
              <div className="admin-row" key={job.id}>
                <span>{job.type} / {job.status}</span>
                <strong>{job.credits_spent || job.credits_reserved || 0} credits</strong>
                <small>{new Date(job.created_at).toLocaleString()}</small>
              </div>
            )) : <p>No generation jobs yet.</p>}
          </div>
        </section>
        <section className="deposit-panel">
          <h2>Recent payments</h2>
          <div className="admin-table">
            {dashboard.recentPayments.length ? dashboard.recentPayments.map((payment) => (
              <div className="admin-row" key={payment.id}>
                <span>{payment.provider} / {payment.status}</span>
                <strong>${Number(payment.amount_usd || 0).toFixed(2)}</strong>
                <small>{payment.credits} credits</small>
              </div>
            )) : <p>No payments yet.</p>}
          </div>
        </section>
      </main>
    </>
  );
}
