"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Send, Share2, Check, Trash2 } from "lucide-react"; // <--- Import Trash2
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";

export default function BlogInteraction({ postId }: { postId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false); // <--- NEW: Track if user is admin
  
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.3 }); 

  // Likes State
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  // Share State
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. Get User AND Check if Admin
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
            // Check the profile table to see if is_admin is true
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();
            
            setIsAdmin(profile?.is_admin || false);
        }
    };

    checkUser();
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
        .select(`*, profiles (full_name, username, avatar_url)`)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
    
    if (error) console.error(error);
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
    if (!newComment.trim()) return;

    setLoadingComment(true);
    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: newComment,
        email: user.email 
    });

    if (!error) {
        setNewComment("");
        fetchComments();
    }
    setLoadingComment(false);
  };

  // --- NEW: DELETE FUNCTION ---
  const handleDeleteComment = async (commentId: string) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
      if (!confirmDelete) return;

      const { error } = await supabase.from('comments').delete().eq('id', commentId);

      if (error) {
          alert("Error deleting: " + error.message);
      } else {
          fetchComments(); // Refresh list immediately
      }
  };

  // --- SMART SHARE FUNCTION ---
  const handleShare = async () => {
      const shareData = {
          title: "Check out this post!", 
          text: `I just read this amazing article on Digital Garden.`,
          url: window.location.href,
      };

      if (navigator.share) {
          try {
              await navigator.share(shareData);
              return; 
          } catch (err) {
              console.log("Error sharing or user cancelled:", err);
          }
      }

      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={containerRef} className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 relative">
      
      {/* FLOATING BUTTON (Just Heart) */}
      <AnimatePresence>
        {!isInView && (
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                className="fixed bottom-8 right-8 z-40"
            >
                <button
                    title="like"
                    onClick={handleLike}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-blue-900/20 bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700/50 hover:scale-110 transition-transform"
                >
                    <Heart size={28} className={hasLiked ? "fill-pink-500 text-pink-500" : "text-slate-400 dark:text-slate-500"} />
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- STATIC DOCKED ACTIONS --- */}
      <div className="flex items-center gap-4 mb-8">
         {/* Like Button */}
         <motion.button 
           whileTap={{ scale: 0.9 }}
           onClick={handleLike}
           className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
             hasLiked 
             ? "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" 
             : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
           }`}
         >
            <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
            <span className="font-bold">{likes}</span>
            <span className="text-sm">Likes</span>
         </motion.button>

         {/* Share Button */}
         <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
         >
            {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
            <span className={copied ? "text-green-600 dark:text-green-400 font-medium" : ""}>
                {copied ? "Copied!" : "Share"}
            </span>
         </motion.button>
      </div>

      {/* COMMENT SECTION */}
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
         <MessageCircle size={20} />
         Comments ({comments.length})
      </h3>

      <div className="space-y-6 mb-8">
        {comments.map((comment) => {
            const profile = comment.profiles;
            const displayName = profile?.full_name || profile?.username || comment.email?.split('@')[0] || "Anonymous";
            const initial = displayName[0].toUpperCase();
            
            // Check if user is the author OR if user is Admin
            const canDelete = (user && user.id === comment.user_id) || isAdmin;

            return (
                <div key={comment.id} className="flex gap-3 group"> {/* Added group class for hover effect */}
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center text-sm font-bold text-slate-500 overflow-hidden border border-slate-300 dark:border-slate-600">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            initial
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 relative">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {displayName}
                                    </span>
                                    {profile?.username && (
                                        <span className="text-xs text-slate-400">@{profile.username}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">
                                        {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                    
                                    {/* --- DELETE BUTTON (Only shows if canDelete is true) --- */}
                                    {canDelete && (
                                        <button 
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete Comment"
                                        >
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
        
        {comments.length === 0 && (
            <p className="text-slate-500 italic text-sm">No comments yet. Be the first!</p>
        )}
      </div>

      {user ? (
         <form onSubmit={handleComment} className="relative">
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add to the discussion..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 pr-14 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
            />
            <button 
                title="send"
                disabled={loadingComment || !newComment.trim()}
                className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
            >
                <Send size={16} />
            </button>
         </form>
      ) : (
         <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl text-center border border-slate-200 dark:border-slate-800">
            <p className="text-slate-600 dark:text-slate-400 mb-3">Log in to join the conversation.</p>
            <Link href="/login" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors">
                Log In
            </Link>
         </div>
      )}
    </div>
  );
}