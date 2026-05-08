import { Header } from "../../components/Header";
import { CompanionCard } from "../../components/CompanionCard";
import { companions } from "../../components/companions";

export const metadata = { title: "Companions | Loviant" };

export default function MatchesPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-heading">
          <p className="eyebrow">Browse</p>
          <h1>Explore AI companions.</h1>
          <p>Choose by personality, visual style, and whether they are best for image edits or video scenes.</p>
        </section>
        <section className="filter-bar" aria-label="Companion filters">
          <button type="button">Romantic</button>
          <button type="button">Flirty</button>
          <button type="button">Anime</button>
          <button type="button">Video Ready</button>
          <button type="button">Voice</button>
        </section>
        <section className="character-grid match-grid">
          {companions.map((companion) => (
            <CompanionCard key={companion.id} companion={companion} buttonStyle="primary-action card-action" />
          ))}
        </section>
      </main>
    </>
  );
}
