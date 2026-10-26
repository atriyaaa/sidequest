"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navigation = [
  { href: "/", label: "Home", symbol: "⌂" },
  { href: "/explore", label: "Explore", symbol: "✧" },
  { href: "/saved", label: "Saved", symbol: "♡" },
  { href: "/journal", label: "Journal", symbol: "▤" },
  { href: "/profile", label: "Profile", symbol: "☺" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span aria-hidden="true">✳</span> sidequest.
      </Link>

      <p className="eyebrow sidebar-caption">
        A little more everyday
      </p>

      <nav aria-label="Main navigation">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${
              pathname === item.href ? "active" : ""
            }`}
            aria-current={
              pathname === item.href ? "page" : undefined
            }
          >
            <span aria-hidden="true">{item.symbol}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-note">
        <span className="little-flower" aria-hidden="true">✳</span>
        <p>Small steps.<br />Good stories.</p>
        <small>You don’t have to go far to find a little wonder.</small>
      </div>
    </aside>
  );
}