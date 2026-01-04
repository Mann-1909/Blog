"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Send, Share2, Check, Trash2, Ban, ShieldAlert } from "lucide-react"; // <--- Import Ban, ShieldAlert
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";

export default function BlogInteraction({ postId }: { postId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); // <--- NEW: Track if CURRENT user is blocked
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.3 }); 

  // Likes & Comments State
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Check User, Admin Status, AND Blocked Status
    const checkUserStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin, is_blocked') // <--- Fetch is_blocked
                .eq('id', user.id)
                .single();
            
            if (profile) {
                setIsAdmin(profile.is_admin || false);
                setIsBlocked(profile.is_blocked || false); // <--- Set blocked state
            }
        }
    };

    checkUserStatus();
    fetchLikes();
    fetchComments();
    
    const channel = supabase
      .channel('realtime-interactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchComments)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchLikes)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const fetchLikes = async () => {
    const { count } = await supabase.from("likes").select("*", { count: 'exact', head: true }).eq("post_id", postId);
    setLikes(count || 0);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data } = await supabase.from("likes").select("*").eq("post_id", postId).eq("user_id", user.id).single();
        setHasLiked(!!data);
    }
  };

 const fetchComments = async () => {
    const { data, error } = await supabase
        .from("comments")
        .select(`*, profiles (full_name, username, avatar_url, is_blocked)`) // <--- Fetch blocked status of commenters too
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
    
    if (data) setComments(data);
  };

  const handleLike = async () => {
    if (!user) return router.push("/login");
    const previousLikes = likes;
    const previousHasLiked = hasLiked;

    if (hasLiked) {
        setHasLiked(false);
        setLikes(prev => prev - 1);
        const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
        if(error) { setHasLiked(previousHasLiked); setLikes(previousLikes); }
    } else {
        setHasLiked(true);
        setLikes(prev => prev + 1);
        const { error } = await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
         if(error) { setHasLiked(previousHasLiked); setLikes(previousLikes); }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push("/login");
    
    // Double check locally, though DB policy will also catch it
    if (isBlocked) {
        alert("You are blocked from commenting.");
        return;
    }

    if (!newComment.trim()) return;

    setLoadingComment(true);
    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: newComment,
        email: user.email 
    });

    if (error) {
        alert("Error posting comment. You might be blocked.");
    } else {
        setNewComment("");
        fetchComments();
    }
    setLoadingComment(false);
  };

  const handleShare = async () => {
      const url = window.location.href;
      const shareData = { title: "Check out this post!", text: `Read this on Digital Garden.`, url: url };
      if (navigator.share) {
          try { await navigator.share(shareData); return; } catch (err) {}
      }
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // --- ADMIN ACTIONS ---
  const handleDeleteComment = async (commentId: string) => {
      if (!confirm("Are you sure you want to delete this comment?")) return;
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) alert("Failed to delete: " + error.message);
      else fetchComments();
  };

  const handleBlockUser = async (userId: string) => {
      if (!confirm("Are you sure you want to BLOCK this user? They won't be able to comment anymore.")) return;
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: true })
        .eq("id", userId);

      if (error) alert("Failed to block: " + error.message);
      else {
          alert("User blocked.");
          fetchComments(); // Refresh to update UI
      }
  };

  return (
    <div ref={containerRef} className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 relative">
      
      {/* Floating Heart */}
      <AnimatePresence>
        {!isInView && (
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }} className="fixed bottom-8 right-8 z-40">
                <button title="like" onClick={handleLike} className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-blue-900/20 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 hover:scale-110 transition-transform">
                    <Heart size={28} className={hasLiked ? "fill-pink-500 text-pink-500" : "text-slate-400 dark:text-slate-500"} />
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Static Actions */}
      <div className="flex items-center gap-4 mb-8">
         <motion.button whileTap={{ scale: 0.9 }} onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${hasLiked ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"}`}>
            <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
            <span className="font-bold">{likes}</span>
            <span className="text-sm">Likes</span>
         </motion.button>

         <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
            <span className={copied ? "text-green-600 dark:text-green-400 font-medium" : ""}>{copied ? "Copied!" : "Share"}</span>
         </motion.button>
      </div>

      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
         <MessageCircle size={20} />
         Comments ({comments.length})
      </h3>

      <div className="space-y-6 mb-8">
        {comments.map((comment) => {
            const profile = comment.profiles;
            const displayName = profile?.full_name || profile?.username || comment.email?.split('@')[0] || "Anonymous";
            const initial = displayName[0].toUpperCase();
            
            // Check if THIS specific commenter is blocked (for UI display)
            const isCommenterBlocked = profile?.is_blocked; 

            return (
                <div key={comment.id} className={`flex gap-3 group ${isCommenterBlocked ? "opacity-50 grayscale" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center text-sm font-bold text-slate-500 overflow-hidden border border-slate-300 dark:border-slate-600">
                        {profile?.avatar_url ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" /> : initial}
                    </div>
                    <div className="flex-1">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {displayName}
                                        {isCommenterBlocked && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Blocked</span>}
                                    </span>
                                    <span className="text-xs text-slate-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* --- ADMIN ACTIONS --- */}
                                    {/* 1. Block Button (Only Admin sees this, can't block self or already blocked) */}
                                    {isAdmin && !isCommenterBlocked && comment.user_id !== user?.id && (
                                        <button onClick={() => handleBlockUser(comment.user_id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Block User">
                                            <Ban size={14} />
                                        </button>
                                    )}

                                    {/* 2. Delete Button (Admin OR Author) */}
                                    {(isAdmin || user?.id === comment.user_id) && (
                                        <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Delete Comment">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                        </div>
                    </div>
                </div>
            );
        })}
        {comments.length === 0 && <p className="text-slate-500 italic text-sm">No comments yet.</p>}
      </div>

      {/* --- COMMENT FORM OR BLOCKED MESSAGE --- */}
      {user ? (
        !isBlocked ? (
             <form onSubmit={handleComment} className="relative">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add to the discussion..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-14 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24" />
                <button title="send" disabled={loadingComment || !newComment.trim()} className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all">
                    <Send size={16} />
                </button>
             </form>
        ) : (
            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-xl text-center border border-red-200 dark:border-red-900/30 flex flex-col items-center gap-2">
                <ShieldAlert className="text-red-500" size={32} />
                <p className="text-red-600 dark:text-red-400 font-bold">Account Restricted</p>
                <p className="text-sm text-red-500 dark:text-red-400/80">You have been blocked from commenting on this blog.</p>
            </div>
        )
      ) : (
         <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 mb-3">Log in to join the conversation.</p>
            <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">Log In</Link>
         </div>
      )}
    </div>
  );
}