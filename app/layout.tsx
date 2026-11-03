import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";

import { AuthProvider } from "../components/AuthProvider";
import { QuestProvider } from "../components/QuestProvider";
import AuthGate from "../components/AuthGate";

import "./globals.css";

export const metadata: Metadata = {
  title: "SideQuest — Little adventures, good stories",
  description:
    "Find everyday adventures, collect memories, and grow at your own pace.",
};

function AppLoading() {
  return (
    <div className="auth-loading" role="status">
      <span aria-hidden="true">✳</span>
      <p>Finding your little corner…</p>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QuestProvider>
            <Suspense fallback={<AppLoading />}>
              <AuthGate>{children}</AuthGate>
            </Suspense>
          </QuestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}