import Link from "next/link";
import { Header } from "../../components/Header";
import { CreateCompanionForm } from "../../components/CreateCompanionForm";

export const metadata = { title: "Create | Loviant" };

export default function CreatePage() {
  return (
    <>
      <Header />
      <main className="builder-layout">
        <section className="page-heading">
          <p className="eyebrow">Create</p>
          <h1>Create companions, videos, and images.</h1>
          <p>Start with a custom AI companion, generate a video scene, or upload and edit saved images.</p>
        </section>
        <section className="create-hub-grid" aria-label="Creation options">
          <a className="create-option-card active" href="#companion-builder"><span>01</span><h2>Create Companion</h2><p>Design personality, look, tone, and relationship style.</p></a>
          <Link className="create-option-card" href="/video"><span>02</span><h2>Create Video</h2><p>Turn a companion and prompt into a short AI video scene.</p></Link>
          <Link className="create-option-card" href="/images"><span>03</span><h2>Edit Images</h2><p>Upload saved images, adjust them, and keep local edits.</p></Link>
        </section>
        <CreateCompanionForm />
        <section className="section saved-companions-section">
          <div className="section-heading"><p className="eyebrow">Saved</p><h2>Companion Collage</h2></div>
          <div className="saved-companion-grid"><p className="muted-note">Saved companions will appear here once the backend is connected.</p></div>
        </section>
      </main>
    </>
  );
}
