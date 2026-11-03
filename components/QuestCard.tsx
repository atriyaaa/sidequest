"use client";

import Link from "next/link";

import type { Quest } from "../types/quest";
import type { City } from "../types/city";

import { useQuests } from "./QuestProvider";
import QuestArtwork from "./QuestArtwork";

type Props = {
  quest: Quest;
  city?: City | null;
};

export default function QuestCard({
  quest,
  city,
}: Props) {
  const {
    progress,
    toggleSaved,
    loading,
    saving,
  } = useQuests();

  const saved = progress.saved.includes(quest.id);
  const completed = progress.completed.includes(quest.id);
  const started = progress.started.includes(quest.id);

  const questHref = city
    ? {
        pathname: `/quests/${quest.id}`,
        query: {
          city: JSON.stringify(city),
        },
      }
    : `/quests/${quest.id}`;

  return (
    <article className="quest-card">
      <div className={`quest-art ${quest.color}`}>
        <QuestArtwork questId={quest.id} />

        <button
          type="button"
          className="save-button"
          disabled={loading || saving}
          aria-label={`${saved ? "Unsave" : "Save"} ${quest.title}`}
          aria-pressed={saved}
          onClick={() => {
            void toggleSaved(quest.id);
          }}
        >
          <span aria-hidden="true">
            {saved ? "♥" : "♡"}
          </span>
        </button>
      </div>

      <div className="quest-body">
        <p className="eyebrow">{quest.category}</p>

        <h3>
          <Link href={questHref}>
            {quest.title}
          </Link>
        </h3>

        <p className="muted">
          {quest.description}
        </p>

        <div className="quest-meta">
          <span>{quest.minutes} min</span>

          <span className="xp-pill">
            {loading
              ? "Loading…"
              : completed
                ? "✓ Complete"
                : `+${quest.xp} XP`}
          </span>
        </div>

        {!loading && started && !completed && (
          <small className="in-progress">
            In progress
          </small>
        )}
      </div>
    </article>
  );
}