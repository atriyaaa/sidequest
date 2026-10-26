"use client";

import ProgressCard from "../../components/ProgressCard";
import { useQuests } from "../../components/QuestProvider";
import { getTotalXp } from "../../lib/progress";

export default function ProfilePage() {
  const { progress } = useQuests();

  const badges = [
    {
      title: "Curiosity club",
      description: "Here’s to beginning",
      symbol: "✳",
      unlocked: true,
    },
    {
      title: "First steps",
      description: "Complete one quest",
      symbol: "↟",
      unlocked: progress.completed.length >= 1,
    },
    {
      title: "Memory keeper",
      description: "Write your first memory",
      symbol: "✉",
      unlocked: Object.keys(progress.memories).length >= 1,
    },
    {
      title: "Finding your stride",
      description: "Complete three quests",
      symbol: "☀",
      unlocked: progress.completed.length >= 3,
    },
  ];

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Go at your own pace</p>
        <h1>Hello, little <em>wanderer.</em></h1>
        <p className="muted">
          Every adventure is part of your story.
        </p>
      </div>

      <div className="profile-content">
        <ProgressCard />

        <div className="section-heading">
          <h2>Your keepsakes</h2>
          <span className="muted">
            {getTotalXp(progress.completed)} total XP
          </span>
        </div>

        <div className="badge-grid">
          {badges.map((badge) => (
            <article
              key={badge.title}
              className={`badge ${badge.unlocked ? "" : "locked"}`}
            >
              <span aria-hidden="true">{badge.symbol}</span>
              <h3>{badge.title}</h3>
              <p>{badge.description}</p>
              <small>{badge.unlocked ? "Collected" : "Still to come"}</small>
            </article>
          ))}
        </div>

        <p className="gentle-note">
          Your progress lives in this browser on this device.
          Account syncing will come later.
        </p>
      </div>
    </>
  );
}