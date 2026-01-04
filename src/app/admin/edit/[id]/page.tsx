"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Trash2, Plus, XCircle } from "lucide-react";
import Link from "next/link";
import type EasyMDE from "easymde";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

export default function EditPost() {
  const router = useRouter();
  const params = useParams(); 
  const id = params.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Gallery State
  const [mediaGallery, setMediaGallery] = useState<{name: string, url: string}[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // Editor Instance
  const [editorInstance, setEditorInstance] = useState<EasyMDE | null>(null);

  const getMdeInstance = useCallback((instance: EasyMDE) => {
    setEditorInstance(instance);
  }, []);

  // 1. Fetch Data
  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).single();
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category);
        setExcerpt(data.excerpt || "");
        setContent(data.content);
      }
      setLoadingData(false);
    };

    const fetchGallery = async () => {
        setLoadingGallery(true);
        const { data } = await supabase.storage.from('images').list();
        if (data) {
            const images = data.map(file => {
                const { data: urlData } = supabase.storage.from('images').getPublicUrl(file.name);
                return { name: file.name, url: urlData.publicUrl };
            });
            // Sort by newest
            setMediaGallery(images);
        }
        setLoadingGallery(false);
    };

    if (id) { fetchPost(); fetchGallery(); }
  }, [id]);

  // 2. Actions
  const insertImageMarkdown = (url: string) => {
    // --- CHANGED THIS PART ---
    // Instead of Markdown ![](), we insert HTML <img /> 
    // This lets you edit 'width' directly in the text editor.
    const imageHtml = `<img src="${url}" alt="Image" width="600" />`;

    if (editorInstance) {
        const cm = editorInstance.codemirror;
        const cursor = cm.getCursor();
        cm.replaceRange(`\n${imageHtml}\n`, cursor);
    } else {
        setContent((prev) => prev + `\n${imageHtml}\n`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error } = await supabase.storage.from('images').upload(fileName, file);
        if (error) throw error;

        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        
        // Update gallery immediately
        setMediaGallery(prev => [{ name: fileName, url: data.publicUrl }, ...prev]);
        insertImageMarkdown(data.publicUrl); // Auto insert
    } catch (error: any) {
        alert("Upload failed: " + error.message);
    } finally {
        setUploading(false);
    }
  };

  // Delete Image Function
  const handleDeleteImage = async (imageName: string) => {
      if (!confirm("Are you sure you want to delete this image? It will break any posts using it.")) return;

      try {
          const { error } = await supabase.storage.from('images').remove([imageName]);
          if (error) throw error;

          setMediaGallery(prev => prev.filter(img => img.name !== imageName));
      } catch (error: any) {
          alert("Delete failed: " + error.message);
      }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const { error } = await supabase.from("posts").update({ title, slug, category, excerpt, content }).eq("id", id);
        if (error) throw error;
        router.push("/admin/dashboard");
        router.refresh();
    } catch (error: any) {
        alert("Error: " + error.message);
    } finally {
        setSaving(false);
    }
  };

  const mdeOptions = useMemo(() => ({
      spellChecker: false,
      placeholder: "Write your masterpiece...",
      status: false,
      autosave: { enabled: false, uniqueId: "edit_post", delay: 1000 },
  }), []);

  if (loadingData) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto"> 
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <Link href="/admin/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Post</h1>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* --- LEFT COLUMN: ASSETS & TOOLS --- */}
            <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-8 order-2 lg:order-1">
                
                {/* 1. Upload Card */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <ImageIcon size={18} /> Asset Manager
                    </h3>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {uploading ? <Loader2 className="animate-spin text-blue-500" size={24}/> : <ImageIcon className="text-slate-400 group-hover:text-blue-500 transition-colors" size={24}/>}
                            <p className="mb-1 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {uploading ? "Uploading..." : "Click to Upload Image"}
                            </p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                </div>

                {/* 2. Gallery Grid */}
                {mediaGallery.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-h-[600px] overflow-y-auto custom-scrollbar">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Library ({mediaGallery.length})</p>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {mediaGallery.map((img, idx) => (
                                <div key={idx} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                    <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                    
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                        <button 
                                            type="button"
                                            title="Insert into Post"
                                            onClick={() => insertImageMarkdown(img.url)}
                                            className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full hover:bg-blue-700 flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Insert
                                        </button>
                                        <button 
                                            type="button"
                                            title="Delete Permanently"
                                            onClick={() => handleDeleteImage(img.name)}
                                            className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full hover:bg-red-700 flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </aside>

            {/* --- RIGHT COLUMN: MAIN EDITOR --- */}
            <div className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
                            <input title="text" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Slug</label>
                            <input title="slug" type="text" required value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
                        <input title="category" type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Excerpt</label>
                        <textarea title="excerpt" required value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
                    </div>

                    {/* Markdown Editor */}
                    <div className="prose-editor-wrapper">
                         <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
                         <SimpleMDE 
                            value={content} 
                            onChange={setContent} 
                            options={mdeOptions} 
                            className="dark:bg-slate-950"
                            getMdeInstance={getMdeInstance}
                         />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                >
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    Update Post
                </button>
            </div>

        </form>
      </div>
    </div>
  );
}