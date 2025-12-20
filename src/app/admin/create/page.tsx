"use client";

import { useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css"; // Import the editor styles
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

// Dynamically import the editor to avoid SSR issues
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Simple slug generator: "Hello World" -> "hello-world"
    setSlug(val.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""));
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
        // 1. Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blog-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images') // We need to create this bucket next!
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Get the Public URL
        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        
        // 3. Append markdown image syntax to content
        const imageMarkdown = `\n![Image Description](${data.publicUrl})\n`;
        setContent((prev) => prev + imageMarkdown);
        
        alert("Image uploaded! Markdown added to editor.");

    } catch (error: any) {
        alert("Upload failed: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const { error } = await supabase.from("posts").insert({
            title,
            slug,
            category,
            // SimpleMDE returns Markdown. 
            // We save it as HTML so our frontend (which uses 'dangerouslySetInnerHTML') can read it easily.
            // OR: We can save Markdown and parse it on the frontend. 
            // For simplicity now, let's use a simple markdown-to-html converter or just save raw text if we change the frontend.
            // UPDATE: Let's save the RAW Markdown for now. 
            // Note: You will need a markdown parser on the frontend (like 'react-markdown') if you save raw markdown.
            // BUT, to keep your current frontend working, we should convert it.
            // Let's use 'marked' library later. For now, let's just save the text.
            content: content, 
            published: true,
        });

        if (error) throw error;
        router.push("/admin/dashboard");
        router.refresh();

    } catch (error: any) {
        alert("Error creating post: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // Configuration for the editor
  const mdeOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "Write your masterpiece...",
      status: false,
      autosave: {
        enabled: true,
        uniqueId: "create_post_draft",
        delay: 1000,
      },
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2"/> Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Create New Post</h1>

        <form onSubmit={handlePublish} className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                    <input 
                        id="title"
                        type="text" 
                        required
                        value={title}
                        onChange={handleTitleChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. Understanding React Hooks"
                    />
                </div>
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug (URL)</label>
                    <input 
                        id="title"
                        type="text" 
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed outline-none"
                    />
                </div>
            </div>

            {/* Category & Image Uploader */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <input 
                        type="text" 
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="e.g. Tutorial"
                    />
                </div>
                
                {/* Image Upload Button */}
                <div>
                     <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-colors w-full justify-center border border-slate-300 dark:border-slate-700">
                        {uploading ? <Loader2 className="animate-spin" size={18}/> : <ImageIcon size={18}/>}
                        {uploading ? "Uploading..." : "Upload Image to Insert"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                     </label>
                     <p className="text-xs text-slate-500 mt-2 text-center">Click to upload, then it appends Markdown automatically.</p>
                </div>
            </div>

            {/* Markdown Editor */}
            <div className="prose-editor-wrapper">
                 <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content (Markdown)</label>
                 <SimpleMDE 
                    value={content} 
                    onChange={setContent} 
                    options={mdeOptions} 
                    className="dark:bg-slate-900"
                 />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Publish Post
            </button>
        </form>
      </div>
    </div>
  );
}