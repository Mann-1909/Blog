import { supabase } from "@/lib/supabase";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown"; // <--- Import this
import remarkGfm from "remark-gfm";         // <--- Import this (adds support for tables, strikethrough, etc)
import BlogInteraction from "@/components/blogInteraction";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <Navbar />

      <main className="container mx-auto px-4 max-w-3xl mt-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <header className="mb-10">
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium mb-4">
            <span className="uppercase tracking-wider">{post.category}</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-slate-500 text-sm border-b border-slate-200 dark:border-slate-800 pb-8">
             <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </header>

        <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          {/* REPLACED: dangerouslySetInnerHTML 
            WITH: ReactMarkdown component
          */}
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Optional: Custom styling for specific elements if needed
              img: ({node, ...props}) => (
                <img {...props} className="rounded-xl border border-slate-200 dark:border-slate-800 my-8 w-full" />
              )
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>
        <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Add the Interaction Component here */}
        <BlogInteraction postId={post.id} />

      </main>
    </div>
  );
}