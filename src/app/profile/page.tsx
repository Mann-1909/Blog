"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form Fields
  const [username, setUsername] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [bio, setBio] = useState<string>("");
  
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Fetch profile data
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url, full_name, bio`)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username || "");
        setFullName(data.full_name || "");
        setWebsite(data.website || "");
        setBio(data.bio || "");
      }
    } catch (error: any) {
      alert("Error loading user data!");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: user?.id as string,
        full_name: fullName,
        username,
        website,
        bio,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      alert('Profile updated successfully!');
      
    } catch (error: any) {
      alert('Error updating the data!');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
     return <div className="min-h-screen flex justify-center items-center"><Loader2 className="animate-spin"/></div>
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1">
                <ArrowLeft size={16}/> Back Home
            </Link>
        </div>

        {/* Avatar Circle (Static for now) */}
        <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400 border-4 border-white dark:border-slate-800 shadow-sm">
                {fullName ? fullName[0] : (user?.email?.[0].toUpperCase() ?? "U")}
            </div>
        </div>

        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input 
                    type="text" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username (Alias)</label>
                <div className="relative">
                    <span className="absolute left-4 top-2 text-slate-400">@</span>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="johndoe"
                        className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
                <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself..."
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Website</label>
                <input 
                    type="url" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            <button
                onClick={updateProfile}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
            >
                {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
}