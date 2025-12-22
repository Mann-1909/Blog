"use server";

import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewsletter(postId: string, postTitle: string, postSlug: string) {
  const supabase = await createClient();

  // 1. Get all subscribers
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("email");

  if (!subscribers || subscribers.length === 0) {
    return { success: false, message: "No subscribers found." };
  }

  const emailList = subscribers.map((s) => s.email);
  const postUrl = `https://mannblog.io/blog/${postSlug}`; // Replace with your real domain

  try {
    // 2. Send the email via Resend
    // Note: 'from' must be "Onboarding <onboarding@resend.dev>" UNTIL you verify your domain.
    // Once verified, change it to "Mann <newsletter@mannblog.io>"
    const data = await resend.emails.send({
      from: "Mann <onboarding@resend.dev>", 
      to: emailList, 
      subject: `New Post: ${postTitle} 🚀`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h1>New Drop: ${postTitle}</h1>
          <p>I just published a new article in the Digital Garden.</p>
          <a href="${postUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
            Read it now
          </a>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">
            (If you didn't sign up for this, I'm sorry! You can reply to unsubscribe.)
          </p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}