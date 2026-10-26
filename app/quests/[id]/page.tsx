"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getQuest } from "../../../data/quests";
import { useQuests } from "../../../components/QuestProvider";
import QuestArtwork from "../../../components/QuestArtwork";
import PhotoMemory from "../../../components/PhotoMemory";

function MemoryForm({
  questId,
  initialText,
}: {
  questId: string;
  initialText: string;
}) {
  const { saveMemory, loading, saving } = useQuests();

  const [text, setText] = useState(initialText);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [edited, setEdited] = useState(false);

  const displayedText = edited ? text : initialText;
  const busy = loading || saving || submitting;

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    if (!displayedText.trim()) {
      setMessage("Add a little memory first.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const saved = await saveMemory(
        questId,
        displayedText,
      );

      setMessage(
        saved
          ? "A good moment, kept. Your journal is updated."
          : "We couldn’t confirm the save. Your text is still here—check the sync notice above.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="memory-form" onSubmit={handleSave}>
      <h2>Keep a little memory.</h2>

      <label htmlFor="memory">
        What surprised you? What would you like to remember?
      </label>

      <textarea
        id="memory"
        value={displayedText}
        maxLength={2000}
        required
        rows={6}
        disabled={loading || submitting}
        placeholder="A small detail, a feeling, a lovely surprise…"
        onChange={(event) => {
          setText(event.target.value);
          setEdited(true);
          setMessage("");
        }}
      />

      <button
        className="button"
        type="submit"
        disabled={busy}
      >
        {submitting ? "Saving…" : "Save memory ↗"}
      </button>

      <p className="form-message" role="status">
        {message}
      </p>
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
    loading,
    saving,
  } = useQuests();

  if (!quest) {
    return (
      <div className="empty-state">
        <h1>This path isn’t on our map.</h1>

        <p>
          We couldn’t find that quest. Let’s find another adventure.
        </p>

        <Link className="button" href="/explore">
          Back to adventures ↗
        </Link>
      </div>
    );
  }

  const saved = progress.saved.includes(quest.id);
  const started = progress.started.includes(quest.id);
  const completed = progress.completed.includes(quest.id);
  const memory = progress.memories[quest.id];
  const busy = loading || saving;

  return (
    <div className="quest-detail">
      <Link className="text-link" href="/explore">
        ← Back to adventures
      </Link>

      <div className={`detail-art ${quest.color}`}>
        <QuestArtwork questId={quest.id} />
      </div>

      <p className="eyebrow">{quest.category}</p>

      <h1>{quest.title}</h1>

      <p className="detail-description muted">
        {quest.description}
      </p>

      <div className="detail-meta">
        <span>{quest.minutes} minutes</span>
        <span>{quest.xp} XP</span>

        <span>
          {loading
            ? "Loading your progress…"
            : completed
              ? "Completed"
              : started
                ? "In progress"
                : "Ready when you are"}
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
            disabled={busy}
            onClick={() => {
              void startQuest(quest.id);
            }}
          >
            {loading
              ? "Loading…"
              : "Start this adventure ↗"}
          </button>
        )}

        {started && !completed && (
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={() => {
              void completeQuest(quest.id);
            }}
          >
            I did it! Complete quest ↗
          </button>
        )}

        <button
          type="button"
          className="button secondary"
          aria-pressed={saved}
          disabled={busy}
          onClick={() => {
            void toggleSaved(quest.id);
          }}
        >
          {saved ? "Saved ♥" : "Save for later ♡"}
        </button>
      </div>

      <div role="status">
        {!loading && started && !completed && (
          <p className="gentle-note">
            Your adventure has begun. Come back when you’re finished.
          </p>
        )}

        {!loading && completed && (
          <p className="completion-note">
            ✓ Adventure complete. Your {quest.xp} XP is collected.
          </p>
        )}
      </div>

      {!loading && completed && (
        <>
          <MemoryForm
            key={quest.id}
            questId={quest.id}
            initialText={memory?.text ?? ""}
          />

          {memory ? (
            <PhotoMemory
              questId={quest.id}
              questTitle={quest.title}
              editable
            />
          ) : (
            <p className="gentle-note">
              Save your written memory first. Then you can add a photo.
            </p>
          )}

          <div className="section-heading">
            <Link className="text-link" href="/journal">
              View your journal ↗
            </Link>
          </div>
        </>
      )}
    </div>
  );
}