"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "./Sidebar";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? "active" : ""}
          aria-current={pathname === item.href ? "page" : undefined}
        >
          <span aria-hidden="true">{item.symbol}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}