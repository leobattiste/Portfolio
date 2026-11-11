import { useEffect, useRef, useState, type ReactNode } from "react";
import { site, href } from "@/lib/site";
import { recordView } from "@/lib/backend";

const navigation = [
  { label: "Work", path: "/work/" },
  { label: "Journal", path: "/journal/" },
  { label: "Toolbox", path: "/toolbox/" },
  { label: "About", path: "/about/" },
  { label: "Contact", path: "/contact/" },
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
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  useEffect(() => recordView(path), [path]);
  useEffect(() => {
    if (!open) return;

    const mobile = window.matchMedia("(max-width: 47.99rem)");
    if (!mobile.matches) {
      setOpen(false);
      return;
    }

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    navRef.current?.querySelector("a")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const links = Array.from(
        document.querySelectorAll<HTMLElement>(".site-header a, .site-header button"),
      );
      const first = links[0], last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    function onScreenChange() {
      if (!mobile.matches) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    mobile.addEventListener("change", onScreenChange);

    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeyDown);
      mobile.removeEventListener("change", onScreenChange);
    };
  }, [open]);
  return (
    <div className="page">
      <a className="skip" href="#main" tabIndex={open ? -1 : undefined}>
        Skip to content
      </a>
      <header className="site-header row">
        <a className="site-name" href={href("/")}>
          {site.name}
        </a>
        <div className="site-bar">
          <nav
            ref={navRef}
            id="site-nav"
            className="site-nav"
            aria-label="Main"
            data-open={open ? "" : undefined}
          >
            {navigation.map((n) => (
              <a
                key={n.path}
                href={href(n.path)}
                onClick={() => setOpen(false)}
                aria-current={path.startsWith(n.path) ? "page" : undefined}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <button
            ref={menuRef}
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls="site-nav"
            onClick={() => setOpen(!open)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 5.5h12M2 10.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </header>
      <main id="main" inert={open}>{children}</main>
      <footer className="site-footer row" inert={open}>
        <span>© {site.updated.slice(0, 4)}</span>
        <nav aria-label="Footer">
          <a href={`mailto:${site.email}`}>Email</a>
          {site.instagram ? (
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          ) : null}
          <a href={href("/privacy/")}>Privacy</a>
          <a href={href("/terms/")}>Terms</a>
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
