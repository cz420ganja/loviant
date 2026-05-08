import Link from "next/link";
import { createClient } from "../lib/supabase/server";

export async function Header() {
  let user = null;
  let profile = null;

  try {
    const supabase = await createClient();
    const result = await supabase.auth.getUser();
    user = result.data.user;

    if (user) {
      const profileResult = await supabase
        .from("profiles")
        .select("username, credits, role")
        .eq("id", user.id)
        .maybeSingle();
      profile = profileResult.data;
    }
  } catch {
    user = null;
    profile = null;
  }

  const displayName = profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0];

  return (
    <>
      <div className="promo-bar">
        <Link href="/pricing">Use crypto payments and get 10% off credits</Link>
      </div>
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Loviant home">
          <img className="brand-logo" src="/images/brand-logo.png" alt="Loviant" />
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/matches">Companions</Link>
          <Link href="/create">Create</Link>
          <Link href="/pricing">Credits</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        {user ? (
          <Link className="header-button" href="/account">
            {displayName} {profile ? `- ${profile.credits} credits` : ""}
          </Link>
        ) : (
          <Link className="header-button" href="/login">Sign in</Link>
        )}
      </header>
    </>
  );
}
