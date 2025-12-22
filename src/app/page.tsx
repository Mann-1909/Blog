import { supabase } from "@/lib/supabase"; // Import the client
import Navbar from "@/components/navbar";
import Link from "next/link";
import PostList from "@/components/postList"
import Typewriter2 from "@/components/typewriter/typewriter2";
import Newsletter from "@/components/newsLetter";
// 1. Remove the old Dummy Data array
// 2. Add this specific instruction to stop Next.js from caching old data forever
export const revalidate = 0; 

export default async function Home() {
  // 3. Fetch data from Supabase
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true) // Only show published posts
    .order('created_at', { ascending: false });

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />

      <div className="container mx-auto px-4 max-w-4xl py-12">
        {/* Hero Section (Keep this the same) */}
        <section className="mb-16 space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-slate-900 dark:text-white">
            Welcome to My Blogs!
          </h1>
          <Typewriter2 
            text="Read more about my journey, the experiences that shape me, and the new things I learn every day.
                  Step inside my digital garden." 
            style="text-xl text-slate-600 dark:text-slate-400 leading-relaxed"
          />
        </section>

        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-12"></div>

        {/* Blog Feed */}
        <section>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-8">Latest Writing</h2>
            
            {/* Pass the data to the client component */}
            <PostList posts={posts || []} />

            {(!posts || posts.length === 0) && (
              <p className="text-slate-500">No posts found.</p>
            )}
        </section>
      </div>
      <Newsletter />
    </main>
  );
}