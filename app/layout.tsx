import type { Metadata } from "next";
import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import MobileNav from "../components/MobileNav";
import { QuestProvider } from "../components/QuestProvider";
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
        <QuestProvider>
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
        </QuestProvider>
      </body>
    </html>
  );
}