import { cookies, headers } from "next/headers";

export async function AgeGate() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "";
  const verified = cookieStore.get("loviant_age_verified")?.value === "true";
  const allowTerms = pathname === "/terms" || pathname.startsWith("/terms/");

  if (verified || allowTerms) {
    return null;
  }

  return (
    <div className="age-gate-overlay is-visible" role="dialog" aria-modal="true" aria-labelledby="ageGateTitle">
      <section className="age-gate-modal">
        <p className="eyebrow">Age restricted</p>
        <h2 id="ageGateTitle">Are you 18 or older?</h2>
        <p>You must be at least 18 years old to access Loviant.</p>
        <p className="age-gate-terms">
          By selecting Yes, you agree to the <a href="/terms">Terms of Agreement</a>.
        </p>
        <div className="age-gate-actions">
          <a className="secondary-action" href="https://www.google.com">
            No
          </a>
          <form action="/age/accept" method="post">
            <button className="generate-button" type="submit">
              Yes
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
