import Link from "next/link";
import { Suspense } from "react";
import { Header } from "../../components/Header";
import { VideoForm } from "../../components/VideoForm";

export const metadata = { title: "Video | Loviant" };

export default function VideoPage() {
  return (
    <>
      <Header />
      <main className="video-layout">
        <section className="page-heading">
          <p className="eyebrow">AI video generation</p>
          <h1>Create short companion videos.</h1>
          <p>Upload a source image or select a saved companion, then describe exactly what the video should show when the RunPod backend is connected.</p>
          <Link className="secondary-action page-back-button" href="/create">Back to Create Companion</Link>
        </section>
        <Suspense fallback={null}><VideoForm /></Suspense>
      </main>
    </>
  );
}
