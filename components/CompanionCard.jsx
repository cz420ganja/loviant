import Link from "next/link";
import { companionActionHref } from "./companions";

export function CompanionCard({ companion, buttonStyle = "text-link" }) {
  return (
    <article className="character-card">
      <div className={`avatar ${companion.avatarClass}`}></div>
      <div className="card-row">
        <h3>{companion.name}</h3>
        <span>{companion.type}</span>
      </div>
      <p>{companion.description}</p>
      <Link className={buttonStyle} href={companionActionHref(companion)}>
        Start editing now
      </Link>
    </article>
  );
}
