"use client";

import { getLevel, getLevelTitle, getTotalXp } from "../lib/progress";
import { useQuests } from "./QuestProvider";

export default function ProgressCard() {
  const { progress } = useQuests();
  const totalXp = getTotalXp(progress.completed);
  const level = getLevel(totalXp);
  const levelXp = totalXp % 100;

  return (
    <section className="progress-card">
      <span className="progress-flower" aria-hidden="true">✺</span>
      <h2>Your little journey</h2>
      <p className="muted">Every little adventure adds up.</p>

      <div className="progress-label">
        <strong>Level {level} · {getLevelTitle(level)}</strong>
        <span>{levelXp} / 100 XP</span>
      </div>

      <progress
        value={levelXp}
        max={100}
        aria-label="Progress toward next level"
      />

      <small className="muted">
        {100 - levelXp} XP to your next chapter
      </small>

      <div className="stats">
        <div>
          <strong>{progress.completed.length}</strong>
          <span>quests completed</span>
        </div>
        <div>
          <strong>{Object.keys(progress.memories).length}</strong>
          <span>memories made</span>
        </div>
      </div>
    </section>
  );
}