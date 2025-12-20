"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
        let result;
        if (isSignUp) {
            result = await supabase.auth.signUp({ email, password });
        } else {
            result = await supabase.auth.signInWithPassword({ email, password });
        }

        if (result.error) throw result.error;

        if (isSignUp) {
            setMessage("Check your email for the confirmation link!");
        } else {
            router.back(); // Go back to the blog post they were reading
        }
    } catch (error: any) {
        setMessage(error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="w-full max-w-sm bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h1 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-white">
                {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            
            {message && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm rounded-lg">
                    {message}
                </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                    <input 
                        id="email"
                        type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                    <input 
                        id="password"
                        type="password" required value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <button 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors flex justify-center"
                >
                    {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? "Sign Up" : "Log In")}
                </button>
            </form>

            <div className="mt-6 text-center text-sm">
                <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-slate-500 hover:text-blue-600 underline"
                >
                    {isSignUp ? "Already have an account? Log In" : "Need an account? Sign Up"}
                </button>
            </div>
            
             <div className="mt-4 text-center">
                <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">Back to Home</Link>
            </div>
        </div>
    </div>
  );
}