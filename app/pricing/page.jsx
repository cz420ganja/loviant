import { Header } from "../../components/Header";
import { PricingCheckout } from "../../components/PricingCheckout";

export const metadata = { title: "Credits | Loviant" };

const packs = [
  { name: "Starter", price: "4.99", credits: 10, note: "Good for testing characters and a few generations" },
  { name: "Creator", price: "9.99", credits: 30, note: "Best for casual creators", featured: true },
  { name: "Studio", price: "19.99", credits: 75, note: "Best value for regular content creation" },
  { name: "Pro", price: "49.99", credits: 200, note: "For agencies or heavy creators" },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main className="page-shell">
        <section className="page-heading center-heading">
          <p className="eyebrow">Credits</p>
          <h1>Buy credits for images and videos.</h1>
          <p>Later this page can connect to crypto deposits and automatic payment checking.</p>
        </section>
        <PricingCheckout packs={packs} />
        <section className="deposit-panel"><h2>Credit costs</h2><p>Launch pricing uses 1 credit for an image generation and 2 credits for a standard video generation.</p></section>
        <section className="deposit-panel"><h2>Future crypto deposit flow</h2><p>User chooses a pack, receives an invoice, sends USDC to your wallet, and the backend adds credits after blockchain confirmation.</p></section>
      </main>
    </>
  );
}
