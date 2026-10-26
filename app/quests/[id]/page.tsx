"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getQuest } from "../../../data/quests";
import { useQuests } from "../../../components/QuestProvider";

function MemoryForm({
  questId,
  initialText,
}: {
  questId: string;
  initialText: string;
}) {
  const { saveMemory } = useQuests();
  const [text, setText] = useState(initialText);
  const [message, setMessage] = useState("");

  return (
    <form
      className="memory-form"
      onSubmit={(event) => {
        event.preventDefault();

        if (!text.trim()) {
          setMessage("Add a little memory first.");
          return;
        }

        saveMemory(questId, text);
        setMessage("A good moment, kept. Your journal is updated.");
      }}
    >
      <h2>Keep a little memory.</h2>
      <label htmlFor="memory">
        What surprised you? What would you like to remember?
      </label>

      <textarea
        id="memory"
        value={text}
        maxLength={2000}
        required
        rows={6}
        placeholder="A small detail, a feeling, a lovely surprise…"
        onChange={(event) => {
          setText(event.target.value);
          setMessage("");
        }}
      />

      <button className="button" type="submit">
        Save memory ↗
      </button>

      <p className="form-message" role="status">{message}</p>
    </form>
  );
}

export default function QuestPage() {
  const params = useParams<{ id: string }>();
  const quest = getQuest(params.id);

  const {
    progress,
    toggleSaved,
    startQuest,
    completeQuest,
  } = useQuests();

  if (!quest) {
    return (
      <div className="empty-state">
        <h1>This path isn’t on our map.</h1>
        <Link className="button" href="/explore">
          Back to adventures
        </Link>
      </div>
    );
  }

  const saved = progress.saved.includes(quest.id);
  const started = progress.started.includes(quest.id);
  const completed = progress.completed.includes(quest.id);

  return (
    <div className="quest-detail">
      <Link className="text-link" href="/explore">
        ← Back to adventures
      </Link>

      <div className={`detail-art ${quest.color}`} aria-hidden="true">
        {quest.symbol}
      </div>

      <p className="eyebrow">{quest.category}</p>
      <h1>{quest.title}</h1>
      <p className="detail-description muted">{quest.description}</p>

      <div className="detail-meta">
        <span>{quest.minutes} minutes</span>
        <span>+{quest.xp} XP</span>
        <span>
          {completed ? "Completed" : started ? "In progress" : "Ready when you are"}
        </span>
      </div>

      <section className="mission">
        <h2>Your little mission</h2>

        <ol>
          {quest.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="quest-actions">
        {!started && !completed && (
          <button
            type="button"
            className="button"
            onClick={() => startQuest(quest.id)}
          >
            Start this adventure ↗
          </button>
        )}

        {started && !completed && (
          <button
            type="button"
            className="button"
            onClick={() => completeQuest(quest.id)}
          >
            I did it! Complete quest ↗
          </button>
        )}

        <button
          type="button"
          className="button secondary"
          aria-pressed={saved}
          onClick={() => toggleSaved(quest.id)}
        >
          {saved ? "Saved ♥" : "Save for later ♡"}
        </button>
      </div>

      <div role="status">
        {started && !completed && (
          <p className="gentle-note">
            Your adventure has begun. Come back when you’re finished.
          </p>
        )}

        {completed && (
          <p className="completion-note">
            ✓ Adventure complete. Your {quest.xp} XP is collected.
          </p>
        )}
      </div>

      {completed && (
        <MemoryForm
          key={quest.id}
          questId={quest.id}
          initialText={progress.memories[quest.id]?.text ?? ""}
        />
      )}
    </div>
  );
}