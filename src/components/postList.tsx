"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1 // Delay between each item
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 }, // Start slightly down and invisible
  show: { opacity: 1, y: 0 }     // Move up and fade in
};

export default function PostList({ posts }: { posts: any[] }) {
  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10"
    >
      {posts.map((post) => (
        <motion.article key={post.id} variants={item} className="group">
          <Link href={`/blog/${post.slug}`} className="block">
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{post.category}</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {post.excerpt}
              </p>
          </Link>
        </motion.article>
      ))}
    </motion.div>
  );
}