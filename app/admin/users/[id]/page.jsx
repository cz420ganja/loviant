import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Header } from "../../../../components/Header";
import { getAdminCookieName, verifyAdminSession } from "../../../../lib/adminAuth";
import { getAdminUserData } from "../../../../lib/adminUserData";

export const metadata = { title: "Manage User | Loviant Admin" };

function formatDate(value) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString();
}

function displayUser(profile, authUser) {
  return profile?.email || authUser?.email || profile?.username || profile?.id || "Unknown user";
}

export default async function AdminUserPage({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName())?.value;

  if (!verifyAdminSession(session)) {
    redirect("/admin/login");
  }

  const data = await getAdminUserData(id);
  const success = typeof query?.success === "string" ? query.success : "";
  const error = typeof query?.error === "string" ? query.error : "";

  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-heading">
          <p className="eyebrow">Admin user view</p>
          <h1>{data.profile || data.authUser ? displayUser(data.profile, data.authUser) : "User not found"}</h1>
          <p>This is the admin-side view of the user's account, credits, generations, edits, and payments.</p>
          <Link className="secondary-action page-back-button" href="/admin">Back to admin</Link>
        </section>

        {success && <p className="form-status is-success admin-status">{success}</p>}
        {error && <p className="form-status is-error admin-status">{error}</p>}
        {!data.ok && (
          <section className="deposit-panel admin-warning">
            <h2>User data unavailable</h2>
            <p>{data.message}</p>
          </section>
        )}

        {(data.profile || data.authUser) && (
          <>
            <section className="price-grid admin-grid admin-detail-grid">
              <article className="price-card">
                <span>Email</span>
                <strong className="account-email">{data.profile?.email || data.authUser?.email || "No email"}</strong>
                <p>Supabase user ID: {id}</p>
              </article>
              <article className="price-card">
                <span>Username</span>
                <strong>{data.profile?.username || data.authUser?.user_metadata?.username || "Not set"}</strong>
                <p>Role: {data.profile?.role || "user"}</p>
              </article>
              <article className="price-card">
                <span>Credits</span>
                <strong>{data.profile?.credits ?? 0}</strong>
                <p>Current usable credit balance.</p>
              </article>
              <article className="price-card">
                <span>Created</span>
                <strong>{formatDate(data.profile?.created_at || data.authUser?.created_at)}</strong>
                <p>Last update: {formatDate(data.profile?.updated_at || data.authUser?.updated_at)}</p>
              </article>
            </section>

            <section className="deposit-panel">
              <h2>User perspective</h2>
              <p>Use these records to see what this user has generated or edited. Full live impersonation should be added later with audit logs and a time-limited admin token.</p>
              <div className="admin-user-actions">
                <form className="admin-credit-form" action="/admin/credits" method="post">
                  <input type="hidden" name="userLookup" value={id} />
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
                      <input name="amount" type="number" min="1" step="1" required />
                    </label>
                  </div>
                  <label className="prompt-label">
                    Admin note
                    <input name="note" type="text" placeholder="Reason for this adjustment" />
                  </label>
                  <button className="generate-button" type="submit">Apply credit adjustment</button>
                </form>
              </div>
            </section>

            <section className="deposit-panel danger-panel">
              <h2>Remove account</h2>
              <p>This permanently deletes the Supabase auth user. Profile, credit ledger, jobs, and payment rows should cascade if your database schema has been applied.</p>
              <form className="admin-delete-form" action={`/admin/users/${id}/delete`} method="post">
                <label className="prompt-label">
                  Type DELETE to confirm
                  <input name="confirmation" type="text" placeholder="DELETE" autoComplete="off" required />
                </label>
                <button className="danger-button" type="submit">Remove this account</button>
              </form>
            </section>
          </>
        )}

        <section className="deposit-panel admin-wide-panel">
          <h2>Generations and edited images</h2>
          <div className="admin-job-grid">
            {data.jobs.length ? data.jobs.map((job) => (
              <article className="admin-job-card" key={job.id}>
                {job.output_url ? (
                  <a href={job.output_url} target="_blank" rel="noreferrer">
                    <img src={job.output_url} alt={`${job.type} output`} />
                  </a>
                ) : (
                  <div className="admin-output-placeholder">No output yet</div>
                )}
                <div>
                  <strong>{job.type} / {job.status}</strong>
                  <p>{job.prompt || "No prompt saved."}</p>
                  {job.error_message && <p className="form-status is-error">{job.error_message}</p>}
                  <small>Companion: {job.companion_id || "none"} | Credits: {job.credits_spent || job.credits_reserved || 0}</small>
                  <small>Created: {formatDate(job.created_at)}</small>
                  {job.completed_at && <small>Completed: {formatDate(job.completed_at)}</small>}
                  {job.source_image_path && <small>Source: {job.source_image_path}</small>}
                  {job.runpod_job_id && <small>RunPod: {job.runpod_job_id}</small>}
                </div>
              </article>
            )) : <p>No generations or edits saved for this user yet.</p>}
          </div>
        </section>

        <section className="deposit-panel">
          <h2>Credit ledger</h2>
          <div className="admin-table">
            {data.ledger.length ? data.ledger.map((entry) => (
              <div className="admin-row admin-row-wide" key={entry.id}>
                <span>{entry.reason}{entry.note ? ` - ${entry.note}` : ""}</span>
                <strong>{entry.amount > 0 ? `+${entry.amount}` : entry.amount}</strong>
                <small>{formatDate(entry.created_at)}</small>
              </div>
            )) : <p>No credit entries yet.</p>}
          </div>
        </section>

        <section className="deposit-panel">
          <h2>Payments</h2>
          <div className="admin-table">
            {data.payments.length ? data.payments.map((payment) => (
              <div className="admin-row admin-row-wide" key={payment.id}>
                <span>{payment.provider} / {payment.status}</span>
                <strong>${Number(payment.amount_usd || 0).toFixed(2)}</strong>
                <small>{payment.credits} credits</small>
              </div>
            )) : <p>No payments saved for this user yet.</p>}
          </div>
        </section>
      </main>
    </>
  );
}
