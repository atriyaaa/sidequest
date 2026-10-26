import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  const failureUrl = new URL(
    "/login?confirmation=failed",
    request.url,
  );

  if (!code) {
    return NextResponse.redirect(failureUrl);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return NextResponse.redirect(failureUrl);
  }

  const cookieStore = await cookies();

  // Successful confirmation sends the visitor home.
  const response = NextResponse.redirect(
    new URL("/", request.url),
  );

  response.headers.set("Cache-Control", "no-store");

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const { error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(failureUrl);
    }

    return response;
  } catch {
    return NextResponse.redirect(failureUrl);
  }
}