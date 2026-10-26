import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import type { City } from "../../../types/city";

function json(
  body: object,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function parseCity(value: unknown): City | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;

  if (
    typeof item.id !== "number" ||
    typeof item.name !== "string" ||
    typeof item.latitude !== "number" ||
    typeof item.longitude !== "number" ||
    !Number.isFinite(item.latitude) ||
    !Number.isFinite(item.longitude)
  ) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    region:
      typeof item.admin1 === "string" ? item.admin1 : "",
    country:
      typeof item.country === "string" ? item.country : "",
    latitude: item.latitude,
    longitude: item.longitude,
  };
}

export async function GET(request: NextRequest) {
  const query =
    request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 3 || query.length > 100) {
    return json(
      {
        error: "Enter a city name between 3 and 100 characters.",
      },
      400,
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !publishableKey) {
    return json(
      { error: "Location search isn’t configured yet." },
      500,
    );
  }

  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      supabaseUrl,
      publishableKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(
              ({ name, value, options }) => {
                cookieStore.set(name, value, options);
              },
            );
          },
        },
      },
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return json(
        { error: "Please sign in again to search for cities." },
        401,
      );
    }

    const url = new URL(
      "https://geocoding-api.open-meteo.com/v1/search",
    );

    url.searchParams.set("name", query);
    url.searchParams.set("count", "6");
    url.searchParams.set("language", "en");
    url.searchParams.set("format", "json");

    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return json(
        {
          error:
            response.status === 429
              ? "City search is busy. Please try again shortly."
              : "We couldn’t reach city search. Please try again.",
        },
        502,
      );
    }

    const payload: unknown = await response.json();

    if (!payload || typeof payload !== "object") {
      return json(
        { error: "City search returned an unexpected response." },
        502,
      );
    }

    const data = payload as Record<string, unknown>;

    if (data.error) {
      return json(
        { error: "We couldn’t search that location. Try another name." },
        502,
      );
    }

    const rawResults = Array.isArray(data.results)
      ? data.results
      : [];

    const results = rawResults
      .map(parseCity)
      .filter((city): city is City => city !== null);

    return json({ results });
  } catch {
    return json(
      {
        error:
          "City search couldn’t finish. Check your connection and try again.",
      },
      503,
    );
  }
}