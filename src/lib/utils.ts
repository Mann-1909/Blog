export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200; // Average reading speed
  // Strip HTML/Markdown tags to get actual words
  const text = content.replace(/[#*`\[\]()]/g, ""); 
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wordsPerMinute);
  return `${time} min read`;
}