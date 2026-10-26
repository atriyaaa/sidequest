"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AuthGate({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (loading) return;

    if (!user && !isLoginPage) {
      router.replace("/login");
    } else if (user && isLoginPage) {
      router.replace("/");
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="auth-loading" role="status">
        <span aria-hidden="true">✳</span>
        <p>Finding your little corner…</p>
      </div>
    );
  }

  if (!user) {
    if (!isLoginPage) {
      return (
        <div className="auth-loading" role="status">
          <p>Taking you to sign in…</p>
        </div>
      );
    }

    return (
      <main className="login-shell">
        <div className="login-brand">
          <span aria-hidden="true">✳</span>
          sidequest.
        </div>

        {children}
      </main>
    );
  }

  if (isLoginPage) {
    return (
      <div className="auth-loading" role="status">
        <p>You’re signed in. Let’s explore…</p>
      </div>
    );
  }

  return (
    <>
      <Sidebar />

      <div className="app-shell">
        <header className="topbar">
          <span>Your everyday, reimagined.</span>
          <span>A little curiosity goes a long way ✧</span>
        </header>

        <main id="main-content">{children}</main>

        <footer className="footer">
          <span>Made for the moments in between.</span>
          <span>Take the scenic route. ↗</span>
        </footer>
      </div>

      <MobileNav />
    </>
  );
}