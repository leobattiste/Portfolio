import { useEffect, useState, type ReactNode } from "react";
import { site, href } from "@/lib/site";

const navigation = [
  { label: "Work", path: "/work/" },
  { label: "Journal", path: "/journal/" },
  { label: "Toolbox", path: "/toolbox/" },
  { label: "About", path: "/about/" },
];
const storageKey = "leo-appearance";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    );
  }, []);
  function apply(next: "light" | "dark") {
    document.documentElement.dataset.theme = next;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", next === "dark" ? "#131417" : "#fafafb");
    try {
      localStorage.setItem(storageKey, next);
    } catch {}
    setTheme(next);
  }
  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || still) return apply(next);
    // The new theme opens as a circle from the button that was pressed.
    const box = event.currentTarget.getBoundingClientRect();
    root.style.setProperty("--tx", `${box.left + box.width / 2}px`);
    root.style.setProperty("--ty", `${box.top + box.height / 2}px`);
    root.classList.add("theme-switch");
    document
      .startViewTransition(() => apply(next))
      .finished.finally(() => root.classList.remove("theme-switch"));
  }
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor" />
      </svg>
    </button>
  );
}

export function Layout({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div className="page">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header row">
        <a className="site-name" href={href("/")}>
          {site.name}
        </a>
        <nav className="site-nav" aria-label="Main">
          {navigation.map((n) => (
            <a
              key={n.path}
              href={href(n.path)}
              aria-current={path.startsWith(n.path) ? "page" : undefined}
            >
              {n.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>
      </header>
      <main id="main">{children}</main>
      <footer className="site-footer row">
        <span>© {site.updated.slice(0, 4)}</span>
        <nav aria-label="Footer">
          <a href={site.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={href("/feed.xml")}>RSS</a>
          <a href={href("/privacy/")}>Privacy</a>
        </nav>
      </footer>
    </div>
  );
}

/* Every block of a page is a row: a label in the rail, content beside it. */
export function Section({
  label,
  count,
  className = "section",
  children,
}: {
  label: string;
  count?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`row ${className}`}>
      <h2 className="label">
        {label}
        {count === undefined ? null : <span>{count}</span>}
      </h2>
      <div>{children}</div>
    </section>
  );
}

export function Intro({
  rail,
  children,
}: {
  rail?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="row intro">
      {rail ?? <div className="rail-empty" />}
      <div>{children}</div>
    </div>
  );
}
