"use client";

import { useState } from "react";
import QuestCard from "../../components/QuestCard";
import QuestFilters from "../../components/QuestFilters";
import { quests } from "../../data/quests";
import type { Category } from "../../types/quest";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");

  const filteredQuests = quests.filter((quest) => {
    const matchesCategory =
      category === "All" || quest.category === category;

    const searchableText =
      `${quest.title} ${quest.description} ${quest.category}`
        .toLowerCase();

    return (
      matchesCategory &&
      searchableText.includes(search.trim().toLowerCase())
    );
  });

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">Find your next little thing</p>
        <h1>Follow your <em>curiosity.</em></h1>
        <p className="muted">
          Something slow, something new, something just for you.
        </p>
      </div>

      <QuestFilters
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
      />

      <p className="result-count" role="status">
        {filteredQuests.length} adventures to explore
      </p>

      {filteredQuests.length ? (
        <div className="quest-grid">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No adventures found this time.</h2>
          <p>Try another word or a different category.</p>
        </div>
      )}
    </>
  );
}