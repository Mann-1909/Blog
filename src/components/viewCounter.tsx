"use client";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ViewCounter({ postId }: { postId: string }) {
  useEffect(() => {
    const supabase = createClient();
    // Call the RPC function we made in SQL
    supabase.rpc("increment_views", { post_id: postId }).then(({ error }) => {
      if (error) console.error("Error incrementing view:", error);
    });
  }, [postId]);

  return null; // It renders nothing visually
}