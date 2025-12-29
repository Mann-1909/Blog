"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const initUser = async () => {
      try {
        // FIX: Use getUser() instead of getSession(). 
        // getUser() is safer and ensures the user is actually valid/logged in on load.
        const { data: { user } } = await supabase.auth.getUser();
        
        if (mounted && user?.email) {
          setEmail(user.email);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Auth check failed", error);
      } finally {
        if (mounted) setIsLoadingUser(false);
      }
    };

    initUser();

    // 2. Listen for changes (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (session?.user?.email) {
        setEmail(session.user.email);
        setIsLoggedIn(true);
        // Ensure loading stops if the event fires after init
        setIsLoadingUser(false); 
      } else if (event === "SIGNED_OUT") {
        setIsLoggedIn(false);
        setEmail("");
        setIsLoadingUser(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("success");
      setMessage("You're in! Thanks for joining.");
    } else {
      setStatus("error");
      setMessage(data.error || "Something went wrong.");
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 rounded-tl-3xl rounded-tr-3xl p-8 md:p-12 text-center ">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Join the Digital Garden 🌱
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        Get an email whenever I drop a new post. No spam, just code and stories.
      </p>

      {status === "success" ? (
        <div className="flex items-center justify-center gap-2 text-green-600 font-medium bg-green-50 dark:bg-green-900/20 p-4 rounded-xl max-w-md mx-auto animate-in fade-in zoom-in">
          <CheckCircle size={20} />
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
          
          <div className="relative flex-1">
             <input
                type="email"
                placeholder="example@gmail.com"
                value={isLoadingUser ? "Checking..." : email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggedIn || isLoadingUser} 
                className={`w-full px-4 py-3 rounded-xl border outline-none transition-all ${
                    isLoggedIn || isLoadingUser
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700 cursor-not-allowed"
                    : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                }`}
              />
              {isLoggedIn && !isLoadingUser && (
                  <span className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 bg-slate-200 dark:bg-slate-800 pl-2">
                      (Logged in)
                  </span>
              )}
          </div>

          <button
            disabled={status === "loading" || isLoadingUser}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === "loading" ? <Loader2 className="animate-spin" /> : <Send size={18} />}
            {isLoggedIn ? "Subscribe Me" : "Subscribe"}
          </button>
        </form>
      )}
      
      {status === "error" && (
        <p className="text-red-500 text-sm mt-3">{message}</p>
      )}
    </div>
  );
}