"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Mail,
  Zap,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/audience", label: "Audience", icon: Users },
  { href: "/campaigns", label: "Campaigns", icon: Mail },
  { href: "/automations", label: "Automations", icon: Zap },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/forms", label: "Forms", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
              <Mail className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              <span className="text-gray-900">Mail</span>
              <span className="text-indigo-600">CRM</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/") ||
                (item.href === "/audience" && pathname.startsWith("/audience"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all duration-150",
                    isActive
                      ? "text-indigo-700 bg-indigo-50/80"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
                  )}
                >
                  <item.icon className={cn("h-3.5 w-3.5", isActive && "text-indigo-600")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Search (subtle) */}
          <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-gray-200 bg-gray-50/50 text-xs text-gray-400 hover:bg-gray-100/60 hover:text-gray-500 transition-colors">
            <Search className="h-3.5 w-3.5" />
            <span>Search...</span>
            <kbd className="ml-3 text-[10px] font-mono bg-white border border-gray-200 px-1.5 py-0.5 rounded">
              /
            </kbd>
          </button>

          {/* Notifications */}
          <button className="relative h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/60 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
          </button>

          {/* User menu */}
          <div className="relative ml-1">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg p-1 hover:bg-gray-100/60 transition-colors"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-500 to-violet-500">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-3 w-3 text-gray-400 hidden sm:block" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-60 rounded-xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50 py-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 text-gray-400" />
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 py-1">
                    <button
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LogOut className="h-4 w-4 text-gray-400" />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-lg">
          <div className="px-3 py-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-indigo-700 bg-indigo-50"
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
