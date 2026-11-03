"use client";

import { useState } from "react";

import CitySearch from "../../components/CitySearch";
import QuestCard from "../../components/QuestCard";
import QuestFilters from "../../components/QuestFilters";

import { quests } from "../../data/quests";

import type { Category } from "../../types/quest";
import type { City } from "../../types/city";

export default function ExplorePage() {
  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState<Category | "All">("All");

  const [selectedCity, setSelectedCity] =
    useState<City | null>(null);

  const filteredQuests = quests.filter((quest) => {
    const matchesCategory =
      category === "All" || quest.category === category;

    const searchableText =
      `${quest.title} ${quest.description} ${quest.category}`
        .toLowerCase();

    const matchesSearch = searchableText.includes(
      search.trim().toLowerCase(),
    );

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">
          Find your next little thing
        </p>

        <h1>
          Follow your <em>curiosity.</em>
        </h1>

        <p className="muted">
          Something slow, something new, something just for you.
        </p>
      </div>

      <CitySearch
        selectedCity={selectedCity}
        onSelect={setSelectedCity}
      />

      <div className="section-heading">
        <h2>Find your kind of adventure</h2>
      </div>

      {selectedCity && (
        <p className="gentle-note">
          Planning a little adventure in{" "}
          <strong>{selectedCity.name}</strong>?
          Open a quest to save this destination with it.
          These are general activities, not local venue listings.
        </p>
      )}

      <QuestFilters
        search={search}
        category={category}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
      />

      <p className="result-count" role="status">
        {filteredQuests.length} adventures to explore
      </p>

      {filteredQuests.length > 0 ? (
        <div className="quest-grid">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              city={selectedCity}
            />
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