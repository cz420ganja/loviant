import Link from "next/link";
import { Header } from "../components/Header";
import { CompanionCard } from "../components/CompanionCard";
import { companions } from "../components/companions";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="hero home-hero">
          <div className="hero-copy">
            <p className="eyebrow">AI companions, images, and video</p>
            <h1>Bring your AI companion to life.</h1>
            <p className="hero-text">
              Create private AI companions, generate romantic images, and turn your favorite moments into short AI videos.
            </p>
            <div className="hero-actions">
              <Link className="primary-action" href="/video">Generate Video</Link>
              <Link className="secondary-action" href="/create">Create Companion</Link>
            </div>
          </div>
        </section>

        <section className="section discover-first" id="companions">
          <div className="section-heading compact-heading">
            <p className="eyebrow">Discover</p>
            <h2>Featured Companions</h2>
          </div>
          <div className="character-grid">
            {companions.map((companion) => <CompanionCard key={companion.id} companion={companion} />)}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <img className="footer-logo" src="/images/brand-logo.png" alt="Loviant" />
        <span>Loviant studios</span>
      </footer>
    </>
  );
}
