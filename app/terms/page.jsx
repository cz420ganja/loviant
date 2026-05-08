import { Header } from "../../components/Header";

export const metadata = { title: "Terms of Agreement | Loviant" };

const updatedDate = "May 8, 2026";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="page-shell legal-page">
        <section className="page-heading">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Agreement.</h1>
          <p>Last updated: {updatedDate}. This draft should be reviewed by a qualified lawyer before public launch.</p>
        </section>

        <section className="deposit-panel legal-panel">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing or using Loviant, you agree to these Terms of Agreement and any policies referenced here. If you do not agree, you must not use the site.</p>

          <h2>2. Age Requirement</h2>
          <p>Loviant is only for users who are 18 years old or older. By using the site, you confirm that you are at least 18 and legally allowed to access adult-oriented AI companion, image, and video content in your location.</p>

          <h2>3. User Accounts</h2>
          <p>You are responsible for keeping your login details secure and for all activity under your account. You must provide accurate account information and must not share, sell, or transfer your account without permission.</p>

          <h2>4. Data We Collect</h2>
          <p>We may collect account data, including email address, username, password authentication data, credit balance, payment records, prompts, uploaded images, generated images, generated videos, editing history, device/browser information, usage logs, and security logs. We use this data to operate the service, process credits, provide generation features, prevent abuse, improve the site, and comply with legal obligations.</p>

          <h2>5. Uploaded Images and Consent</h2>
          <p>You must not upload, generate, edit, or request content using another person's image, likeness, voice, identity, private information, or personal content unless you have their clear consent and legal permission. You are fully responsible for the images, prompts, and materials you upload or submit.</p>

          <h2>6. Adult Content Rules</h2>
          <p>All users and depicted characters must be 18 or older. You must not create, request, upload, or distribute content involving minors, age ambiguity, non-consensual sexual content, sexual violence, exploitation, harassment, blackmail, impersonation, illegal activity, or any content that violates applicable law.</p>

          <h2>7. Prohibited Use</h2>
          <p>You must not use Loviant to create deepfakes of real people without consent, impersonate private individuals, infringe copyrights or trademarks, evade platform limits, scrape the service, attack the site, resell access without permission, or use generated content for unlawful, abusive, deceptive, or harmful purposes.</p>

          <h2>8. Credits, Payments, and Refunds</h2>
          <p>Credits may be required for image generation, image editing, video generation, or other features. Credit prices, feature costs, and availability may change. Credits have no cash value unless required by law. Failed generations may be refunded at our discretion or automatically where technically supported.</p>

          <h2>9. Generated Content</h2>
          <p>AI outputs may be inaccurate, inconsistent, offensive, or unsuitable. You are responsible for reviewing generated content before using or publishing it. We do not guarantee that outputs are unique, error-free, commercially usable, or free from third-party rights concerns.</p>

          <h2>10. Account Suspension or Termination</h2>
          <p>We may suspend, restrict, or terminate any account, remove content, revoke credits, block access, or report activity when we believe a user has violated these terms, abused the service, created prohibited content, attempted fraud, harmed the platform, or created legal risk.</p>

          <h2>11. Content Monitoring and Enforcement</h2>
          <p>We may review prompts, uploads, generated content, account activity, and payment activity to enforce these terms, protect users, prevent abuse, maintain service security, and comply with legal requirements.</p>

          <h2>12. Privacy and Security</h2>
          <p>We use reasonable technical and organizational measures to protect user data, but no online service is completely secure. You should not upload sensitive personal information, confidential materials, or content you do not have permission to use.</p>

          <h2>13. Service Availability</h2>
          <p>Loviant may rely on third-party services, including hosting providers, databases, payment processors, GPU providers, and AI model providers. We do not guarantee uninterrupted availability, generation speed, model availability, or permanent storage of generated files.</p>

          <h2>14. Changes to These Terms</h2>
          <p>We may update these terms from time to time. Continued use of the site after changes are posted means you accept the updated terms.</p>

          <h2>15. Contact</h2>
          <p>For legal, account, or content concerns, contact Loviant at loviantdev@protonmail.com.</p>
        </section>
      </main>
    </>
  );
}
