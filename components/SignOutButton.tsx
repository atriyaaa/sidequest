"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function SignOutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setPending(true);
    setError("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signOut({
        scope: "local",
      });

      if (error) throw error;

      // AuthGate redirects after the account state updates.
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Couldn’t sign out. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="account-profile-link">
      <button
        type="button"
        className="button secondary"
        disabled={pending}
        onClick={handleSignOut}
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>

      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}