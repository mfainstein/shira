"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/poems", label: "Poems" },
  { href: "/admin/review", label: "Review" },
  { href: "/admin/queue", label: "Queue" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/" className="text-xl poem-title">
            Shira
          </Link>
          <p className="text-xs text-charcoal-light mt-1">Admin</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded text-sm mb-1 transition-colors ${
                pathname.startsWith(item.href)
                  ? "bg-sepia/10 text-sepia font-medium"
                  : "text-charcoal-light hover:bg-ivory-dark"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
            className="text-sm text-charcoal-light hover:text-charcoal w-full text-left px-4 py-2"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
