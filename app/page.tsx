import Link from "next/link";
import QuestCard from "../components/QuestCard";
import ProgressCard from "../components/ProgressCard";
import { quests } from "../data/quests";

export default function Home() {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Make room for a little wonder</p>
        <h1>A little adventure <em>awaits.</em></h1>
        <p className="muted">
          Step out of the ordinary. Find a little joy in something new.
        </p>
      </div>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">✧ Quest of the day</p>
          <h2>Life’s better with<br />a few detours.</h2>
          <p>
            A new street, a slower pace, a little something you
            didn’t expect.
          </p>
          <p className="hero-meta">25 minutes · Outdoors · 50 XP</p>

          <Link className="button" href="/quests/scenic-route">
            Let’s take a detour ↗
          </Link>
        </div>

        <div className="hero-landscape" aria-hidden="true">
          <div className="sun" />
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <span className="landscape-tree">↟</span>
          <span className="landscape-note">Take your time.</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <section>
          <div className="section-heading">
            <h2>A little something for you</h2>
            <Link className="text-link" href="/explore">
              Explore all ↗
            </Link>
          </div>

          <div className="quest-grid home-quests">
            {quests.slice(1, 4).map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </section>

        <div>
          <ProgressCard />

          <Link href="/journal" className="journal-link">
            <span aria-hidden="true">▤</span>
            <div>
              <strong>Good moments belong somewhere.</strong>
              <p>Make room for your memories. ↗</p>
            </div>
          </Link>
        </div>
      </div>

      <p className="gentle-note">
        ✳ No big plans needed. Just a little curiosity and a moment
        that’s yours.
      </p>
    </>
  );
}