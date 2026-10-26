"use client";

import Link from "next/link";
import JournalEntry from "../../components/JournalEntry";
import { useQuests } from "../../components/QuestProvider";
import { quests } from "../../data/quests";

export default function JournalPage() {
  const { progress } = useQuests();

  const memories = Object.values(progress.memories).sort(
    (a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime(),
  );

  const waitingForMemory = quests.filter(
    (quest) =>
      progress.completed.includes(quest.id) &&
      !progress.memories[quest.id],
  );

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Your collection of everyday wonder</p>
        <h1>The good little <em>moments.</em></h1>
        <p className="muted">
          Places, feelings, and things you’ll want to remember.
        </p>
      </div>

      {waitingForMemory.length > 0 && (
        <section className="pending-memories">
          <h2>Still fresh in your mind?</h2>
          <p className="muted">
            These adventures are complete. Give them a little place
            in your journal.
          </p>

          {waitingForMemory.map((quest) => (
            <Link
              key={quest.id}
              href={`/quests/${quest.id}`}
              className="pending-memory"
            >
              {quest.title}
              <span>Write a memory ↗</span>
            </Link>
          ))}
        </section>
      )}

      {memories.length ? (
        <div className="quest-grid">
          {memories.map((memory) => {
            const quest = quests.find(
              (item) => item.id === memory.questId,
            );

            return quest ? (
              <JournalEntry
                key={memory.questId}
                quest={quest}
                memory={memory}
              />
            ) : null;
          })}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">✿</span>
          <h2>Your story is just beginning.</h2>
          <p>Complete a quest, then capture a little moment here.</p>
          <Link className="button" href="/explore">
            Explore quests ↗
          </Link>
        </div>
      )}
    </>
  );
}