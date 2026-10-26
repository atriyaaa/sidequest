import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "../components/AuthProvider";
import { QuestProvider } from "../components/QuestProvider";
import AuthGate from "../components/AuthGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "SideQuest — Little adventures, good stories",
  description:
    "Find everyday adventures, collect memories, and grow at your own pace.",
};

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
            <AuthGate>{children}</AuthGate>
          </QuestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}