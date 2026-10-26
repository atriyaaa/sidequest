"use client";

import {
  Suspense,
  useState,
  type FormEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Mode = "signin" | "signup";

function LoginForm() {
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [confirmationDismissed, setConfirmationDismissed] =
    useState(false);

  const confirmationError =
    !confirmationDismissed &&
    searchParams.get("confirmation") === "failed"
      ? "We couldn’t finish signing you in from that link. " +
        "Try signing in below—your email may already be confirmed. " +
        "Open confirmation links in the same browser you used to sign up."
      : "";

  const displayedError = error || confirmationError;

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setPassword("");
    setEmailSent(false);
    setError("");
    setConfirmationDismissed(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (pending) return;

    setPending(true);
    setError("");
    setConfirmationDismissed(true);

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo:
                `${window.location.origin}/auth/callback`,
            },
          });

        if (signUpError) throw signUpError;

        setPassword("");

        if (!data.session) {
          setEmailSent(true);
        }

        // AuthGate redirects signed-in users to the home page.
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) throw signInError;

        setPassword("");

        // AuthProvider updates, then AuthGate redirects home.
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="page-heading">
        <p className="eyebrow">
          A little place of your own
        </p>

        <h1>
          {emailSent ? (
            <>
              Check your <em>inbox.</em>
            </>
          ) : mode === "signup" ? (
            <>
              Start your <em>story.</em>
            </>
          ) : (
            <>
              Welcome <em>back.</em>
            </>
          )}
        </h1>
      </div>

      <div className="auth-card">
        {emailSent ? (
          <>
            <span
              className="auth-flower"
              aria-hidden="true"
            >
              ✉
            </span>

            <h2>One little click, then you’re in.</h2>

            <p className="muted">
              If a confirmation email was sent to{" "}
              <strong>{email.trim()}</strong>, click its{" "}
              <strong>Confirm email address</strong> link.
              You’ll return to your SideQuest home page.
            </p>

            <p className="auth-help">
              Check your spam folder too. Open the link
              on this computer, in the same browser you
              used to create your account.
            </p>

            <button
              type="button"
              className="auth-back text-link"
              onClick={() => changeMode("signin")}
            >
              Already confirmed? Sign in
            </button>
          </>
        ) : (
          <>
            <div className="auth-switch">
              <button
                type="button"
                aria-pressed={mode === "signin"}
                disabled={pending}
                onClick={() => changeMode("signin")}
              >
                Sign in
              </button>

              <button
                type="button"
                aria-pressed={mode === "signup"}
                disabled={pending}
                onClick={() => changeMode("signup")}
              >
                Create account
              </button>
            </div>

            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                disabled={pending}
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "signup"
                    ? "new-password"
                    : "current-password"
                }
                minLength={
                  mode === "signup" ? 8 : undefined
                }
                required
                disabled={pending}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
              />

              {mode === "signup" && (
                <p className="auth-help">
                  Use at least 8 characters. We’ll send
                  a link to confirm your email address.
                </p>
              )}

              <button
                type="submit"
                className="button"
                disabled={pending}
              >
                {pending
                  ? "One moment…"
                  : mode === "signup"
                    ? "Create my account ↗"
                    : "Sign in ↗"}
              </button>
            </form>
          </>
        )}

        {displayedError && (
          <p className="auth-error" role="alert">
            {displayedError}
          </p>
        )}
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="auth-page">
          <p className="gentle-note" role="status">
            Getting your sign-in screen ready…
          </p>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}