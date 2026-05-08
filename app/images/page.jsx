import Link from "next/link";
import { Suspense } from "react";
import { Header } from "../../components/Header";
import { ImageEditor } from "../../components/ImageEditor";

export const metadata = { title: "Images | Loviant" };

export default function ImagesPage() {
  return (
    <>
      <Header />
      <main className="image-layout">
        <section className="page-heading">
          <p className="eyebrow">Image editor</p>
          <h1>Upload and edit saved images.</h1>
          <p>Bring in a companion image, describe the edit, and save edited versions locally before connecting a full AI image editing backend.</p>
          <Link className="secondary-action page-back-button" href="/create">Back to Create Companion</Link>
        </section>
        <Suspense fallback={null}><ImageEditor /></Suspense>
      </main>
    </>
  );
}
