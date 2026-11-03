"use client";

import { useState } from "react";
import Link from "next/link";

import { useQuests } from "./QuestProvider";

import type { Quest } from "../types/quest";
import type { City } from "../types/city";

type Props = {
  quests: Quest[];
  city: City | null;
};

export default function SurpriseMe({
  quests,
  city,
}: Props) {
  const { progress, loading } = useQuests();

  const [suggestedId, setSuggestedId] =
    useState<string | null>(null);

  const availableQuests = quests.filter(
    (quest) => !progress.completed.includes(quest.id),
  );

  // Derive the suggestion from the current results.
  // Changing filters can remove an earlier suggestion.
  const suggestedQuest = availableQuests.find(
    (quest) => quest.id === suggestedId,
  );

  function chooseAdventure() {
    if (loading || availableQuests.length === 0) {
      return;
    }

    // Avoid suggesting the same quest twice in a row
    // when other choices are available.
    const alternatives = availableQuests.filter(
      (quest) => quest.id !== suggestedId,
    );

    const choices =
      alternatives.length > 0
        ? alternatives
        : availableQuests;

    const index = Math.floor(Math.random() * choices.length);

    setSuggestedId(choices[index].id);
  }

  const questHref = suggestedQuest
    ? city
      ? {
          pathname: `/quests/${suggestedQuest.id}`,
          query: {
            city: JSON.stringify(city),
          },
        }
      : `/quests/${suggestedQuest.id}`
    : "/explore";

  const noChoices = availableQuests.length === 0;

  const cannotShuffle =
    loading ||
    noChoices ||
    Boolean(suggestedQuest && availableQuests.length === 1);

  return (
    <section
      className="surprise-ticket"
      aria-labelledby="surprise-heading"
    >
      <div className="surprise-ticket-stub">
        <span aria-hidden="true">✳</span>
        <small>LET’S WANDER</small>
      </div>

      <div className="surprise-ticket-content">
        <p className="eyebrow">A little less planning</p>

        <h2 id="surprise-heading">
          Let curiosity choose.
        </h2>

        <p className="surprise-description">
          {city
            ? `A little adventure for your time in ${city.name}.`
            : "Not sure where to start? We’ll pick a little adventure."}
        </p>

        <div
          className="surprise-result"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {loading ? (
            <p>Checking your adventures…</p>
          ) : suggestedQuest ? (
            <>
              <span className="surprise-result-label">
                YOUR NEXT LITTLE THING
              </span>

              <h3>{suggestedQuest.title}</h3>

              <p>{suggestedQuest.description}</p>

              <div className="surprise-meta">
                <span>{suggestedQuest.category}</span>
                <span>{suggestedQuest.minutes} min</span>
                <span>+{suggestedQuest.xp} XP</span>
              </div>
            </>
          ) : noChoices ? (
            <p>
              {quests.length === 0
                ? "No quests match these filters. Try another category or search."
                : "You’ve completed every quest in these results. Try another category for something new."}
            </p>
          ) : (
            <p>
              {availableQuests.length === 1
                ? "One uncompleted adventure matches your filters."
                : `${availableQuests.length} uncompleted adventures match your filters.`}
            </p>
          )}
        </div>

        <div className="surprise-actions">
          <button
            type="button"
            className="button"
            disabled={cannotShuffle}
            onClick={chooseAdventure}
          >
            {loading
              ? "One moment…"
              : suggestedQuest
                ? availableQuests.length === 1
                  ? "Your matching adventure"
                  : "Shuffle again ✳"
                : "Surprise me ✳"}
          </button>

          {!loading && suggestedQuest && (
            <Link
              className="button secondary"
              href={questHref}
            >
              Let’s do this ↗
            </Link>
          )}
        </div>

        <p className="surprise-footnote">
          Uses your current quest filters. Completed quests are
          left out; adventures already in progress can still appear.
        </p>
      </div>
    </section>
  );
}