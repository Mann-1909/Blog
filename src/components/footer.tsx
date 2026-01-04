export default function Footer() {
  return (
    <footer className="py-2 text-center text-sm border-t border-slate-300 dark:border-slate-800 bg-slate-200 dark:bg-slate-900/50 text-slate-800 dark:text-slate-400 mt-auto">
      <p>
        &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_WEBSITE_TITLE}. All Rights Reserved.
      </p>
    </footer>
  );
}