"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { sendNewsletter } from "@/app/actions/sendNewsLetter";

export default function NotifyButton({ postId, postTitle, postSlug }: { postId: string, postTitle: string, postSlug: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleNotify = async () => {
    const confirm = window.confirm(`Are you sure you want to email all subscribers about "${postTitle}"?`);
    if (!confirm) return;

    setStatus("loading");
    const res = await sendNewsletter(postId, postTitle, postSlug);
    
    if (res.success) {
      setStatus("success");
      alert("Emails sent! 🚀");
    } else {
      setStatus("idle");
      alert("Error sending emails.");
    }
  };

  if (status === "success") {
    return <button className="text-green-600 p-2" title="Newsletter sent"><Check size={18} /></button>;
  }

  return (
    <button 
      onClick={handleNotify} 
      disabled={status === "loading"}
      title="Send Email Newsletter"
      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    >
      {status === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Bell size={18} />}
    </button>
  );
}