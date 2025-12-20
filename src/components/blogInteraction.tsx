"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function BlogInteraction({ postId }: { postId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  // Likes State
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Comments State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComment, setLoadingComment] = useState(false);

  useEffect(() => {
    // 1. Get current user
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    // 2. Load Likes Count
    fetchLikes();

    // 3. Load Comments
    fetchComments();
    
    // 4. Realtime Subscription (Optional: See updates instantly)
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

    // Check if I liked it
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data } = await supabase.from("likes").select("*").eq("post_id", postId).eq("user_id", user.id).single();
        setHasLiked(!!data);
    }
  };

 const fetchComments = async () => {
    // Select all comment fields, PLUS the linked 'profiles' data
    const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
    
    if (error) console.error(error);
    if (data) setComments(data);
  };
  const handleLike = async () => {
    if (!user) return router.push("/login");

    if (hasLiked) {
        // Unlike
        await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", user.id);
        setHasLiked(false);
        setLikes(prev => prev - 1);
    } else {
        // Like
        await supabase.from("likes").insert({ post_id: postId, user_id: user.id });
        setHasLiked(true);
        setLikes(prev => prev + 1);
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
        email: user.email // Store email for display simply
    });

    if (!error) {
        setNewComment("");
        fetchComments(); // Refresh list
    }
    setLoadingComment(false);
  };

  return (
    <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8">
      {/* LIKE SECTION */}
      <div className="flex items-center gap-6 mb-8">
         <motion.button 
           whileTap={{ scale: 0.8 }} // <--- Shrinks when clicked!
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
      </div>

      {/* COMMENT SECTION */}
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
         <MessageCircle size={20} />
         Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-6 mb-8">
        {comments.map((comment) => {
            // Helper to get the display name
            const profile = comment.profiles;
            const displayName = profile?.full_name || profile?.username || comment.email?.split('@')[0] || "Anonymous";
            const initial = displayName[0].toUpperCase();

            return (
                <div key={comment.id} className="flex gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0 flex items-center justify-center text-sm font-bold text-slate-500 overflow-hidden border border-slate-300 dark:border-slate-600">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                            initial
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                                        {displayName}
                                    </span>
                                    {profile?.username && (
                                        <span className="text-xs text-slate-400">@{profile.username}</span>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                </span>
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

      {/* Comment Input */}
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