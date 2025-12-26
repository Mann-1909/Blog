"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function EditPost() {
  const router = useRouter();
  const params = useParams(); 
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState(""); // <--- 1. NEW STATE
  const [content, setContent] = useState("");
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch the existing post
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        alert("Error fetching post: " + error.message);
        router.push("/admin/dashboard");
      } else if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category);
        setExcerpt(data.excerpt || ""); // <--- 2. LOAD EXCERPT (handle nulls)
        setContent(data.content);
      }
      setLoadingData(false);
    };

    if (id) fetchPost();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `blog-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);
        const imageMarkdown = `\n![Image Description](${data.publicUrl})\n`;
        setContent((prev) => prev + imageMarkdown);
        
    } catch (error: any) {
        alert("Upload failed: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
        const { error } = await supabase
            .from("posts")
            .update({
                title,
                slug,
                category,
                excerpt, // <--- 3. SAVE EXCERPT
                content, 
            })
            .eq("id", id);

        if (error) throw error;
        
        router.push("/admin/dashboard");
        router.refresh();

    } catch (error: any) {
        alert("Error updating post: " + error.message);
    } finally {
        setSaving(false);
    }
  };

 const mdeOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "Write your masterpiece...",
      status: false,
      autosave: {
        enabled: false,
        uniqueId: "edit_post_temp_id",
        delay: 1000,
      },
    };
  }, []);

  if (loadingData) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Back to Dashboard
            </Link>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Edit Post</h1>

        <form onSubmit={handleUpdate} className="space-y-6">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                    <input 
                        id="title"
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug (URL)</label>
                    <input 
                        id="slug"
                        type="text" 
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 outline-none"
                    />
                </div>
            </div>

            {/* 4. NEW EXCERPT FIELD */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt (Short Summary)</label>
                <textarea 
                    required
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    placeholder="A short description that appears on the home page card..."
                />
            </div>

            {/* Category & Image Uploader */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                    <input 
                        id="category"
                        type="text" 
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                
                <div>
                      <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg transition-colors w-full justify-center border border-slate-300 dark:border-slate-700">
                        {uploading ? <Loader2 className="animate-spin" size={18}/> : <ImageIcon size={18}/>}
                        {uploading ? "Uploading..." : "Upload Image to Insert"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      </label>
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
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Update Post
            </button>
        </form>
      </div>
    </div>
  );
}