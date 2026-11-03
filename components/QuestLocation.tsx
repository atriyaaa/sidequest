"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import CitySearch from "./CitySearch";
import { useAuth } from "./AuthProvider";
import { createClient } from "../lib/supabase/client";

import type { City } from "../types/city";

type Props = {
  questId: string;
  editable?: boolean;
};

function parseCity(value: unknown): City | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const city = value as Record<string, unknown>;

  if (
    typeof city.id !== "number" ||
    !Number.isSafeInteger(city.id) ||
    city.id <= 0 ||
    typeof city.name !== "string" ||
    city.name.trim().length === 0 ||
    city.name.length > 200 ||
    typeof city.region !== "string" ||
    city.region.length > 200 ||
    typeof city.country !== "string" ||
    city.country.length > 200 ||
    typeof city.latitude !== "number" ||
    !Number.isFinite(city.latitude) ||
    city.latitude < -90 ||
    city.latitude > 90 ||
    typeof city.longitude !== "number" ||
    !Number.isFinite(city.longitude) ||
    city.longitude < -180 ||
    city.longitude > 180
  ) {
    return null;
  }

  return {
    id: city.id,
    name: city.name.trim(),
    region: city.region,
    country: city.country,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}

function parseCityParameter(
  value: string | null,
): City | null {
  if (!value || value.length > 2000) {
    return null;
  }

  try {
    return parseCity(JSON.parse(value));
  } catch {
    return null;
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Please try again.";
}

export default function QuestLocation(props: Props) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <p className="location-status" role="status">
          Loading location…
        </p>
      }
    >
      <LocationContent
        key={`${user.id}:${props.questId}`}
        {...props}
        userId={user.id}
      />
    </Suspense>
  );
}

function LocationContent({
  userId,
  questId,
  editable = false,
}: Props & { userId: string }) {
  const searchParams = useSearchParams();
  const saveInFlight = useRef(false);

  const suggestedCity = editable
    ? parseCityParameter(searchParams.get("city"))
    : null;

  const [storedCity, setStoredCity] =
    useState<City | null>(null);

  // Undefined means the visitor hasn't changed the selection.
  const [draftCity, setDraftCity] =
    useState<City | null | undefined>(undefined);

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadLocation() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("quest_progress")
          .select(
            "city_id, city_name, city_region, city_country, city_latitude, city_longitude",
          )
          .eq("user_id", userId)
          .eq("quest_id", questId)
          .maybeSingle();

        if (error) throw error;

        const city =
          data && data.city_id !== null
            ? parseCity({
                id: data.city_id,
                name: data.city_name,
                region: data.city_region,
                country: data.city_country,
                latitude: data.city_latitude,
                longitude: data.city_longitude,
              })
            : null;

        if (!active) return;

        setStoredCity(city);
        setLoadError("");
        setLoaded(true);
      } catch (error) {
        if (!active) return;

        setLoadError(
          "Couldn’t load this quest’s location: " +
            errorMessage(error),
        );
      }
    }

    void loadLocation();

    return () => {
      active = false;
    };
  }, [userId, questId, reload]);

  const selectedCity =
    draftCity !== undefined
      ? draftCity
      : storedCity ?? suggestedCity;

  async function saveLocation() {
    if (!loaded || saveInFlight.current) return;

    saveInFlight.current = true;
    setSaving(true);
    setSaveError("");
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: auth,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (auth.user?.id !== userId) {
        throw new Error(
          "Your account changed. Refresh before continuing.",
        );
      }

      // Create a personal quest record if needed.
      // Existing progress is left untouched.
      const { error: createError } = await supabase
        .from("quest_progress")
        .upsert(
          {
            user_id: userId,
            quest_id: questId,
          },
          {
            onConflict: "user_id,quest_id",
            ignoreDuplicates: true,
          },
        );

      if (createError) throw createError;

      const { error: updateError } = await supabase
        .from("quest_progress")
        .update({
          city_id: selectedCity?.id ?? null,
          city_name: selectedCity?.name ?? null,
          city_region: selectedCity?.region ?? null,
          city_country: selectedCity?.country ?? null,
          city_latitude: selectedCity?.latitude ?? null,
          city_longitude: selectedCity?.longitude ?? null,
        })
        .eq("user_id", userId)
        .eq("quest_id", questId)
        .select("quest_id")
        .single();

      if (updateError) throw updateError;

      setStoredCity(selectedCity);
      setDraftCity(selectedCity);

      setMessage(
        selectedCity
          ? `Location saved: ${selectedCity.name}.`
          : "Location removed from this quest.",
      );
    } catch (error) {
      setSaveError(
        "Couldn’t confirm the location save: " +
          errorMessage(error),
      );
    } finally {
      saveInFlight.current = false;
      setSaving(false);
    }
  }

  function retryLoading() {
    setLoaded(false);
    setLoadError("");
    setReload((count) => count + 1);
  }

  if (!loaded) {
    return (
      <div className="location-status">
        {loadError ? (
          <>
            <p role="alert">{loadError}</p>

            <button
              type="button"
              className="text-link"
              onClick={retryLoading}
            >
              Retry location
            </button>
          </>
        ) : (
          <p role="status">Loading location…</p>
        )}
      </div>
    );
  }

  if (!editable) {
    if (!storedCity) return null;

    return (
      <p className="journal-location">
        <span aria-hidden="true">↗</span>{" "}
        {[storedCity.name, storedCity.country]
          .filter(Boolean)
          .join(", ")}
      </p>
    );
  }

  return (
    <section className="quest-location-editor">
      <div className="section-heading">
        <h2>A place for this adventure</h2>
      </div>

      <p className="muted">
        Save where you plan to go—or where the memory happened.
        You can leave this blank for adventures anywhere.
      </p>

      {storedCity && (
        <p className="location-saved-label">
          Saved location:{" "}
          <strong>
            {[storedCity.name, storedCity.country]
              .filter(Boolean)
              .join(", ")}
          </strong>
        </p>
      )}

      <fieldset disabled={saving}>
        <CitySearch
          selectedCity={selectedCity}
          onSelect={(city) => {
            setDraftCity(city);
            setMessage("");
            setSaveError("");
          }}
        />
      </fieldset>

      <button
        type="button"
        className="button"
        disabled={saving}
        onClick={() => {
          void saveLocation();
        }}
      >
        {saving
          ? "Saving location…"
          : selectedCity
            ? "Save location ↗"
            : "Save without a location"}
      </button>

      <p className="photo-hint">
        Choosing a city is a preview. Click Save location to
        attach it to this quest.
      </p>

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}

      {saveError && (
        <p className="auth-error" role="alert">
          {saveError}
        </p>
      )}
    </section>
  );
}