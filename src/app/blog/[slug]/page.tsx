import { supabase } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import BlogInteraction from "@/components/blogInteraction";
export const revalidate = 0;
import ViewCounter from "@/components/viewCounter";
import { Eye } from "lucide-react";
import ScrollProgress from "@/components/scrollProgress";
import { calculateReadingTime } from "@/lib/utils";
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .eq("slug", slug)
    .single();

  if (!post) {
    notFound();
  }
  const readTime = calculateReadingTime(post.content || "");

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <Navbar />

      <main className="container mx-auto px-4 max-w-3xl mt-10">
        <ScrollProgress>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <header className="mb-10">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* ... inside the header metadata div ... */}
            <div className="flex items-center gap-1 text-sm text-slate-500 mb-6">
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              <span>•</span>

              <span className="text-blue-600">{post.category}</span>

              {/* VIEW COUNTER UI */}
              <div className="flex items-center gap-1 ml-auto">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{readTime}</span>
                </div>

                <span>•</span>
                <Eye size={16} />
                <span>{post.views || 0} views</span>
              </div>
            </div>

            {/* PLACE THE INVISIBLE COUNTER HERE */}
            <ViewCounter postId={post.id} />
          </header>

          <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
            {/* REPLACED: dangerouslySetInnerHTML 
            WITH: ReactMarkdown component
          */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Optional: Custom styling for specific elements if needed
                img: ({ node, ...props }) => (
                  <img
                    {...props}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 my-8 w-full"
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </article>
        </ScrollProgress>

        {/* Add the Interaction Component here */}
        <BlogInteraction postId={post.id} />
      </main>
    </div>
  );
}
