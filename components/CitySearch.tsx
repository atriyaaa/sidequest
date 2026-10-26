"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import type { City } from "../types/city";

type Props = {
  selectedCity: City | null;
  onSelect: (city: City | null) => void;
};

type SearchResponse = {
  results?: City[];
  error?: string;
};

export default function CitySearch({
  selectedCity,
  onSelect,
}: Props) {
  const inputId = useId();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      activeRequest.current?.abort();
    };
  }, []);

  function cancelSearch() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setLoading(false);
  }

  function changeQuery(value: string) {
    cancelSearch();
    setQuery(value);
    setResults([]);
    setSearched(false);
    setError("");
  }

  async function handleSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const search = query.trim();

    if (search.length < 3) {
      setError("Type at least 3 characters to find a city.");
      return;
    }

    activeRequest.current?.abort();

    const controller = new AbortController();
    activeRequest.current = controller;

    setLoading(true);
    setError("");
    setResults([]);
    setSearched(false);

    try {
      const response = await fetch(
        `/api/cities?q=${encodeURIComponent(search)}`,
        {
          signal: controller.signal,
          cache: "no-store",
        },
      );

      const data: SearchResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? "Couldn’t search for cities.",
        );
      }

      if (
        controller.signal.aborted ||
        activeRequest.current !== controller
      ) {
        return;
      }

      setResults(data.results ?? []);
      setSearched(true);
    } catch (error) {
      if (
        controller.signal.aborted ||
        activeRequest.current !== controller
      ) {
        return;
      }

      setError(
        error instanceof Error
          ? error.message
          : "Couldn’t search. Please try again.",
      );
    } finally {
      if (activeRequest.current === controller) {
        setLoading(false);
        activeRequest.current = null;
      }
    }
  }

  function chooseCity(city: City) {
    cancelSearch();
    onSelect(city);
    setQuery("");
    setResults([]);
    setSearched(false);
    setError("");
  }

  return (
    <section className="city-search">
      <div className="city-search-heading">
        <div>
          <p className="eyebrow">Pick a little somewhere</p>
          <h2>Where shall we wander?</h2>
        </div>

        <span className="city-search-flower" aria-hidden="true">
          ✳
        </span>
      </div>

      {selectedCity && (
        <div className="selected-city">
          <div>
            <span className="eyebrow">Your destination</span>
            <strong>{selectedCity.name}</strong>

            <small>
              {[selectedCity.region, selectedCity.country]
                .filter(Boolean)
                .join(", ")}
            </small>
          </div>

          <button
            type="button"
            className="text-link"
            onClick={() => {
              cancelSearch();
              onSelect(null);
              setResults([]);
              setSearched(false);
              setQuery("");
              setError("");
            }}
          >
            Clear
          </button>
        </div>
      )}

      <form
        className="city-search-form"
        onSubmit={handleSearch}
      >
        <label htmlFor={inputId}>
          {selectedCity
            ? "Or find a different destination"
            : "Search for a city or town"}
        </label>

        <div className="city-search-input-row">
          <input
            id={inputId}
            type="search"
            value={query}
            minLength={3}
            maxLength={100}
            required
            placeholder="Try London, Edinburgh, or Paris…"
            autoComplete="off"
            onChange={(event) =>
              changeQuery(event.target.value)
            }
          />

          <button
            className="button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching…" : "Find city ↗"}
          </button>
        </div>
      </form>

      {loading && (
        <p className="city-search-status" role="status">
          Looking for your next little somewhere…
        </p>
      )}

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="city-search-status" role="status">
          No matches this time. Try a different spelling or a
          nearby city.
        </p>
      )}

      {results.length > 0 && (
        <>
          <p className="city-search-status" role="status">
            Choose from {results.length} matching locations.
          </p>

          <ul
            className="city-results"
            aria-label="Matching cities"
          >
            {results.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => chooseCity(city)}
                >
                  <div>
                    <strong>{city.name}</strong>

                    <small>
                      {[city.region, city.country]
                        .filter(Boolean)
                        .join(", ")}
                    </small>
                  </div>

                  <span aria-hidden="true">↗</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="city-attribution">
        Location search by{" "}
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noreferrer"
        >
          Open-Meteo
        </a>
        . Location data from{" "}
        <a
          href="https://www.geonames.org/"
          target="_blank"
          rel="noreferrer"
        >
          GeoNames
        </a>
        .
      </p>
    </section>
  );
}