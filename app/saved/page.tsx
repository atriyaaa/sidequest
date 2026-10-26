"use client";

import Link from "next/link";
import QuestCard from "../../components/QuestCard";
import { useQuests } from "../../components/QuestProvider";
import { quests } from "../../data/quests";

export default function SavedPage() {
  const { progress } = useQuests();
  const savedQuests = quests.filter((quest) =>
    progress.saved.includes(quest.id),
  );

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Tucked away for another day</p>
        <h1>Your little <em>wishlist.</em></h1>
        <p className="muted">
          Adventures for when the moment feels right.
        </p>
      </div>

      {savedQuests.length ? (
        <div className="quest-grid">
          {savedQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">♡</span>
          <h2>Something to look forward to.</h2>
          <p>Tap the heart on a quest to save it here.</p>
          <Link className="button" href="/explore">
            Find an adventure ↗
          </Link>
        </div>
      )}
    </>
  );
}