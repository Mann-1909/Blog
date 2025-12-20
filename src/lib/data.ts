export const BLOG_POSTS = [
  {
    id: 1,
    title: "Understanding Server Components in Next.js 14",
    excerpt: "A deep dive into how RSC changes the way we fetch data...",
    content: `
      <p>React Server Components (RSC) allow you to write UI that can be rendered and optionally cached on the server.</p>
      <h2>Why does this matter?</h2>
      <p>Traditionally, React rendered entirely on the client. This meant waiting for the JavaScript bundle to load before seeing anything.</p>
      <ul>
        <li>Faster initial page loads</li>
        <li>Smaller client bundles</li>
        <li>Direct database access</li>
      </ul>
      <p>This is a game changer for building <strong>high-performance</strong> web applications.</p>
    `,
    date: "Oct 24, 2023",
    category: "Next.js",
    slug: "understanding-server-components",
    author: "Your Name"
  },
  {
    id: 2,
    title: "Why I choose Flutter for cross-platform development",
    excerpt: "Analyzing the performance benefits of Skia rendering...",
    content: "<p>Flutter uses the Skia graphics engine to render pixels directly...</p>",
    date: "Oct 10, 2023",
    category: "Flutter",
    slug: "why-flutter",
    author: "Your Name"
  },
];