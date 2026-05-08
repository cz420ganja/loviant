import Link from "next/link";
import { Header } from "../../components/Header";
import { getCompanion } from "../../components/companions";

export const metadata = { title: "Profile | Loviant" };

export default async function ProfilePage({ searchParams }) {
  const params = await searchParams;
  const companion = getCompanion(params?.companion);

  return (
    <>
      <Header />
      <main className="profile-layout">
        <section className="profile-hero-card">
          <div className="profile-photo large-photo" style={{ backgroundImage: `linear-gradient(180deg, rgba(8, 10, 16, 0), rgba(8, 10, 16, 0.18)), url(${companion.image})` }}>
            <div className="match-badge">Video ready</div>
          </div>
        </section>
        <section className="profile-detail">
          <p className="eyebrow">Featured companion</p>
          <h1>{companion.name}, {companion.age}</h1>
          <p className="hero-text">{companion.summary}</p>
          <div className="profile-tags">
            {companion.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <div className="bio-panel">
            <h2>About {companion.name}</h2>
            <p>{companion.about}</p>
          </div>
          <div className="hero-actions">
            <Link className="primary-action" href={`/video?companion=${companion.id}`}>Generate video</Link>
            <Link className="secondary-action" href={`/images?companion=${companion.id}`}>Edit image</Link>
          </div>
        </section>
      </main>
    </>
  );
}
