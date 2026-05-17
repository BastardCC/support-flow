"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/support", label: "Support" },
  { href: "/dashboard", label: "Tableau de bord" },
] as const;

export function SupportNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/support"
          className="text-sm font-semibold uppercase tracking-wide text-sky-600 transition hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
        >
          SupportFlow
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navigation principale">
          {links.map(({ href, label }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "font-semibold text-zinc-900 dark:text-zinc-50"
                    : "font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
