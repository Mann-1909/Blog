"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, LogOut, LayoutDashboard } from "lucide-react"; // Added LayoutDashboard icon
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// // HARDCODE YOUR ADMIN EMAIL HERE FOR THE UI CHECK
// const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ;

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  if (!mounted) return null;

  // Check if current user is the admin
  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  return (
    <nav className="w-full border-b border-slate-200 dark:border-slate-800 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-3xl flex justify-between items-center">
        <Link
          href="/"
          className="font-bold text-xl tracking-tight text-slate-900 dark:text-white"
        >
          {process.env.NEXT_PUBLIC_WEBSITE_TITLE}
        </Link>

        <div className="flex items-center gap-4">
          {/* CONDITIONALLY RENDER DASHBOARD LINK */}
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
          )}

          <Link
            href="/about"
            className="hidden sm:block text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            About
          </Link>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              {/* Make the Avatar clickable -> Goes to Profile */}
              <Link
                href="/profile"
                title="Go to Profile"
                className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold hover:ring-2 ring-blue-500 transition-all"
              >
                {user.email?.charAt(0).toUpperCase()}
              </Link>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="text-slate-500 hover:text-red-500 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
