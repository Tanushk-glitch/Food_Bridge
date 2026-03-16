import Link from "next/link";
import { Leaf } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/impact", label: "Our Impact" },
  { href: "/#partners", label: "Partners" },
  { href: "/#about", label: "About" }
];

export function Navbar() {
  return (
    <header className="relative z-40">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </div>
          <h2 className="font-display text-xl font-extrabold tracking-tight">FoodBridge</h2>
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-bold text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Button asChild variant="ghost" className="text-sm font-bold">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40">
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/signup">Donate Food</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
