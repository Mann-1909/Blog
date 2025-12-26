"use client";

import Navbar from "@/components/navbar";
import { motion } from "framer-motion";
import { Code2, Dumbbell, BookOpen, MapPin, Github, Twitter, Linkedin, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function About() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
        
      <main className="container mx-auto px-4 max-w-4xl py-12 md:py-20">
        <Link href="/" className="inline-flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2"/> Back to Home
        </Link>
        {/* HERO SECTION */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp} 
          className="mb-20"
        >
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
            Architecting Apps & <br />
            <span className="text-blue-600 dark:text-blue-400">Building a Better Self.</span>
          </h1>
          <div className="prose prose-lg dark:prose-invert text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
            <p>
              Hi, I’m <strong>Mann</strong> 👋. I speak fluent JavaScript and Dart, but I’m still figuring out the rest. 
            </p>
            <p>
              I’m a developer who loves the discipline of the gym, the escape of a good book, and the perspective found in travel. 
              Though I usually keep to myself, this website is my attempt to be loud—sharing my tech expertise and personal experiences with the world.
            </p>
            <p>
              I created this platform not just to share what I know, but to grow by sharing it. Welcome to my journey.
            </p>
          </div>
        </motion.section>

        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-20"></div>

        {/* 3 PILLARS GRID */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20"
        >
          {/* Card 1: The Tech */}
          <motion.div variants={fadeInUp} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
              <Code2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Builder 🚀</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              My digital weapons of choice are <strong>React</strong>, <strong>Next.js</strong>, and <strong>Flutter</strong>. 
              I love the architecture phase—deciding how data flows, how state is managed, and how to make things scale.
            </p>
            <div className="flex gap-2 flex-wrap">
              {["TypeScript", "Dart", "Supabase", "Tailwind"].map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Card 2: The Gym (Discipline) */}
          <motion.div variants={fadeInUp} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 mb-6">
              <Dumbbell size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Iron ⚡</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Coding is mental; the gym is physical meditation. The discipline required to push through a heavy set is the same discipline needed to debug a complex race condition. It teaches me consistency over intensity.
            </p>
          </motion.div>

          {/* Card 3: Books (Learning) */}
          <motion.div variants={fadeInUp} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 mb-6">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Library 📚</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              I read to live a thousand lives. Whether it's technical manuals, philosophy, or sci-fi, books are my primary source of upgrades. Currently reading about system design and stoicism.
            </p>
          </motion.div>

           {/* Card 4: Travel (Ambivert) */}
           <motion.div variants={fadeInUp} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">The Explorer 🌏</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              As an ambivert, travel forces me out of my shell. I love getting lost in new cities, trying food I can't pronounce, and finding that perfect coffee shop to write code in.
            </p>
          </motion.div>
        </motion.section>

        {/* CONNECT SECTION */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl p-12 relative overflow-hidden"
        >
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Let's Connect 🤝</h2>
            <p className="text-slate-300 dark:text-slate-600 mb-8 max-w-xl mx-auto">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of your visions.
            </p>
            
            <div className="flex justify-center gap-6">
                <a 
                  href="https://github.com/Mann-1909" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="p-3 bg-white/10 dark:bg-slate-200/50 rounded-full hover:bg-white/20 dark:hover:bg-slate-300 transition-colors backdrop-blur-sm"
                >
                    <Github size={24} />
                </a>
                <a 
                  href="https://x.com/MannSaxena35760" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="p-3 bg-white/10 dark:bg-slate-200/50 rounded-full hover:bg-white/20 dark:hover:bg-slate-300 transition-colors backdrop-blur-sm"
                >
                    <Twitter size={24} />
                </a>
                <a 
                  href="www.linkedin.com/in/mann-saxena-nitc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="p-3 bg-white/10 dark:bg-slate-200/50 rounded-full hover:bg-white/20 dark:hover:bg-slate-300 transition-colors backdrop-blur-sm"
                >
                    <Linkedin size={24} />
                </a>
                <a 
                  href="mailto:saxena.mann2005@gmail.com"
                  aria-label="Email Me"
                  className="p-3 bg-white/10 dark:bg-slate-200/50 rounded-full hover:bg-white/20 dark:hover:bg-slate-300 transition-colors backdrop-blur-sm"
                >
                    <Mail size={24} />
                </a>
            </div>
          </div>
        </motion.section>

      </main>
    </div>
  );
}