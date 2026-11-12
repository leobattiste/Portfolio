import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { site, initial, href, host, media, prettyDate } from "@/lib/site";
import {
  slugify,
  fromProject,
  fromArticle,
  fromResource,
} from "../content-model.mjs";
import { db, upload, problem } from "./db";
import { RichText } from "./RichText";
import "./admin.css";

// Rows come straight from the database, so their shape is checked there.
type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const views = [
  { id: "inbox", label: "Inbox" },
  { id: "insights", label: "Insights" },
  { id: "work", label: "Work" },
  { id: "journal", label: "Journal" },
  { id: "toolbox", label: "Toolbox" },
  { id: "about", label: "About" },
] as const;

const readHash = () =>
  location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
function useHash() {
  const [parts, setParts] = useState<string[]>(readHash);
  useEffect(() => {
    const change = () => setParts(readHash());
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  return parts;
}
const go = (path: string) => {
  location.hash = "#/" + path;
};

/* A delete that asks once more before it runs. */
function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  return armed ? (
    <span className="confirm">
      <button type="button" className="text-button danger" onClick={onConfirm}>
        Delete for good
      </button>
      <button type="button" className="text-button" onClick={() => setArmed(false)}>
        Keep
      </button>
    </span>
  ) : (
    <button type="button" className="text-button" onClick={() => setArmed(true)}>
      Delete
    </button>
  );
}

function Shell({ rail, children }: { rail?: ReactNode; children: ReactNode }) {
  return (
    <div className="page admin">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header row">
        <a className="site-name" href={href("/")}>
          {site.name}
        </a>
        <span className="muted">Admin</span>
      </header>
      <main id="main" className="row admin-main">
        {rail ?? <div className="rail-empty" />}
        <div>{children}</div>
      </main>
    </div>
  );
}

/* Sign in ------------------------------------------------------------ */
function SignIn({ recovering }: { recovering: boolean }) {
  const [mode, setMode] = useState<"in" | "create" | "reset">("in");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const redirect = location.origin + location.pathname;
    setBusy(true);
    setNote("");
    try {
      if (recovering) {
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        location.replace(location.pathname);
      } else if (mode === "in") {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "create") {
        const { error } = await db.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirect },
        });
        if (error) throw error;
        setNote("Check your inbox and open the confirmation link, then sign in here.");
        setMode("in");
      } else {
        const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: redirect });
        if (error) throw error;
        setNote("If that address has an account, a reset link is on its way.");
        setMode("in");
      }
    } catch (error) {
      setNote(problem(error));
    }
    setBusy(false);
  }
  const title = recovering
    ? "Choose a new password"
    : mode === "create"
      ? "Create the admin account"
      : mode === "reset"
        ? "Reset your password"
        : "Sign in";
  const action = recovering
    ? "Save password"
    : mode === "in"
      ? "Sign in"
      : mode === "create"
        ? "Create account"
        : "Send reset link";
  return (
    <Shell>
      <div className="admin-head">
        <h1 className="statement">{title}</h1>
        {mode === "create" ? (
          <p className="statement">Use the email address set as this site’s admin.</p>
        ) : null}
      </div>
      <form className="form" onSubmit={submit}>
        {recovering ? null : (
          <label>
            <span>Email</span>
            <input name="email" type="email" required autoComplete="username" />
          </label>
        )}
        {mode === "reset" && !recovering ? null : (
          <label>
            <span>{recovering ? "New password" : "Password"}</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "in" && !recovering ? "current-password" : "new-password"}
            />
          </label>
        )}
        <div className="form-end">
          <button className="button" type="submit" disabled={busy}>
            {action}
          </button>
          {recovering ? null : mode !== "in" ? (
            <button type="button" className="text-button" onClick={() => setMode("in")}>
              Sign in instead
            </button>
          ) : (
            <>
              <button type="button" className="text-button" onClick={() => setMode("create")}>
                First time? Create account
              </button>
              <button type="button" className="text-button" onClick={() => setMode("reset")}>
                Forgot password
              </button>
            </>
          )}
        </div>
        {note ? (
          <p className="form-note" role="status">
            {note}
          </p>
        ) : null}
      </form>
    </Shell>
  );
}

/* Save bar: the same controls at the foot of every editor ------------- */
function SaveBar({
  row,
  set,
  onSave,
  onDelete,
  note,
  busy,
  viewPath,
}: {
  row: Row;
  set?: (patch: Row) => void;
  onSave: () => void;
  onDelete?: () => void;
  note: string;
  busy: boolean;
  viewPath?: string;
}) {
  return (
    <div className="savebar">
      <button type="button" className="button" onClick={onSave} disabled={busy}>
        {busy ? "Saving" : "Save"}
      </button>
      {set ? (
        <label className="check">
          <input
            type="checkbox"
            checked={!!row.published}
            onChange={(e) => set({ published: e.target.checked })}
          />
          Published
        </label>
      ) : null}
      <span className="savebar-note" role="status">
        {note}
      </span>
      {viewPath ? (
        <a className="text-button" href={href(viewPath)} target="_blank" rel="noopener noreferrer">
          View page
        </a>
      ) : null}
      {onDelete ? <DeleteButton onConfirm={onDelete} /> : null}
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="fact">
      <span>{label}</span>
      <span>
        {children}
        {hint ? <small>{hint}</small> : null}
      </span>
    </label>
  );
}

/* Loads one row of a table for editing, or a blank one for "new". */
function useRecord(table: string, view: string, id: string, blank: Row) {
  const [row, setRow] = useState<Row | null>(id === "new" ? blank : null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (id === "new") return;
    let active = true;
    db.from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error || !data) setNote(error ? problem(error) : "This entry no longer exists.");
        else setRow(data);
      });
    return () => {
      active = false;
    };
  }, [table, id]);
  const set = useCallback(
    (patch: Row) => setRow((current) => ({ ...(current || {}), ...patch })),
    [],
  );
  async function save() {
    if (!row) return;
    if (!String(row.title || "").trim()) return setNote("Add a title before saving.");
    const fields = { ...row };
    delete fields.id;
    delete fields.created_at;
    const payload = {
      ...fields,
      slug: slugify(row.slug || row.title),
      updated_at: new Date().toISOString(),
    };
    if (!payload.slug) return setNote("The address needs at least one letter or number.");
    setBusy(true);
    const { data, error } =
      id === "new"
        ? await db.from(table).insert(payload).select().single()
        : await db.from(table).update(payload).eq("id", id).select().single();
    setBusy(false);
    if (error)
      return setNote(
        error.code === "23505"
          ? "Another entry already uses this address. Change the address and save again."
          : problem(error),
      );
    setRow(data);
    setNote(data.published ? "Saved and live on the site." : "Saved as a draft.");
    if (id === "new") go(`${view}/${data.id}`);
  }
  async function remove() {
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) setNote(problem(error));
    else go(view);
  }
  return { row, set, save, remove, note, busy };
}

/* A list of entries with drafts marked ------------------------------- */
function EntryList({
  table,
  view,
  title,
  lead,
  order,
  noun,
  note,
}: {
  table: string;
  view: string;
  title: string;
  lead: string;
  order: string;
  noun: string;
  note: (row: Row) => string;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    db.from(table)
      .select("*")
      .order(order, { ascending: order === "sort" })
      .then(({ data, error }) => (error ? setError(problem(error)) : setRows(data)));
  }, [table, order]);
  return (
    <>
      <div className="admin-head">
        <h1 className="statement">{title}</h1>
        <p className="statement">{lead}</p>
        <button type="button" className="button" onClick={() => go(`${view}/new`)}>
          New {noun}
        </button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {rows && !rows.length ? (
        <p className="muted">Nothing here yet. Start with “New {noun}”.</p>
      ) : null}
      <ul className="lines">
        {(rows || []).map((row) => (
          <li key={row.id}>
            <a className="line" href={`#/${view}/${row.id}`}>
              <span className="line-title">{row.title}</span>
              <span className="line-note">{note(row)}</span>
              <span className="line-end">{row.published ? "Published" : "Draft"}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/* Cover or portrait: shows the image where the page shows it ---------- */
function ImageSlot({
  value,
  onChange,
  className,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  className: string;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState("");
  async function choose(file?: File) {
    if (!file) return;
    setState("Uploading");
    try {
      onChange(await upload(file));
      setState("");
    } catch (error) {
      setState(problem(error));
    }
  }
  return (
    <div
      className={`slot ${className}${value ? "" : " slot-empty"}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        choose(e.dataTransfer.files[0]);
      }}
    >
      {value ? <img src={media(value)} alt="" /> : null}
      <div className="slot-actions">
        <button type="button" className="chip" onClick={() => input.current?.click()}>
          {value ? `Replace ${label}` : `Add ${label}`}
        </button>
        {value ? (
          <button type="button" className="chip" onClick={() => onChange("")}>
            Remove
          </button>
        ) : null}
        {state ? (
          <span className="chip" role="status">
            {state}
          </span>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        aria-label={`Upload ${label}`}
        onChange={(e) => {
          choose(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* Work: laid out like a case study page ------------------------------ */
const blankProject = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  cover: "",
  cover_alt: "",
  disciplines: [],
  role: "",
  platform: "",
  status: "",
  live_url: "",
  source_url: "",
  content: "",
  published: false,
  sort: 0,
};
function ProjectEditor({ id }: { id: string }) {
  const { row, set, save, remove, note, busy } = useRecord("projects", "work", id, blankProject);
  if (!row) return <p className="muted">{note || "Loading"}</p>;
  const text = (key: string, placeholder = "") => (
    <input
      value={row[key] ?? ""}
      placeholder={placeholder}
      onChange={(e) => set({ [key]: e.target.value })}
    />
  );
  return (
    <>
      <a className="back" href="#/work">
        All work
      </a>
      <h1 className="sr-only">{id === "new" ? "New project" : "Edit project"}</h1>
      <textarea
        className="statement title-input"
        rows={1}
        value={row.title}
        placeholder="Project name"
        aria-label="Project name"
        onChange={(e) => set({ title: e.target.value })}
      />
      <textarea
        className="statement title-input lead-input"
        rows={2}
        value={row.description}
        placeholder="What it is and who it’s for, in a sentence or two"
        aria-label="Description"
        onChange={(e) => set({ description: e.target.value })}
      />
      <ImageSlot className="cover" label="cover" value={row.cover} onChange={(cover) => set({ cover })} />
      <section className="admin-section">
        <h2 className="label">Details</h2>
        <div className="facts">
          <Field label="One-liner" hint="Shown beside the name in lists">
            {text("subtitle")}
          </Field>
          <Field label="Cover text" hint="Describes the cover for people who can’t see it">
            {text("cover_alt")}
          </Field>
          <Field label="Role">{text("role")}</Field>
          <Field label="Platform">{text("platform")}</Field>
          <Field label="Status">{text("status", "Live, In progress, Concept")}</Field>
          <Field label="Disciplines" hint="Separate with commas">
            <input
              defaultValue={(row.disciplines || []).join(", ")}
              onChange={(e) =>
                set({
                  disciplines: e.target.value
                    .split(",")
                    .map((d) => d.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="Live link">{text("live_url", "https://")}</Field>
          <Field label="Source link">{text("source_url", "https://")}</Field>
          <Field label="Address" hint={`/work/${slugify(row.slug || row.title) || "…"}/`}>
            {text("slug", slugify(row.title))}
          </Field>
          <Field label="Order" hint="Lower numbers come first">
            <input
              type="number"
              value={row.sort ?? 0}
              onChange={(e) => set({ sort: Number(e.target.value) })}
            />
          </Field>
        </div>
      </section>
      <section className="admin-section">
        <h2 className="label">Case study</h2>
        <RichText
          value={row.content}
          onChange={(content) => set({ content })}
          placeholder="Tell the story: the problem, the decisions, what changed."
        />
      </section>
      <SaveBar
        row={row}
        set={set}
        note={note}
        busy={busy}
        onSave={save}
        onDelete={id === "new" ? undefined : remove}
        viewPath={id !== "new" && row.published ? `/work/${row.slug}/` : undefined}
      />
    </>
  );
}

/* Journal: laid out like an entry ------------------------------------ */
const blankArticle = () => ({
  title: "",
  slug: "",
  description: "",
  topic: "",
  date: new Date().toISOString().slice(0, 10),
  content: "",
  published: false,
});
function ArticleEditor({ id }: { id: string }) {
  const blank = useMemo(blankArticle, []);
  const { row, set, save, remove, note, busy } = useRecord("articles", "journal", id, blank);
  if (!row) return <p className="muted">{note || "Loading"}</p>;
  return (
    <>
      <a className="back" href="#/journal">
        All entries
      </a>
      <h1 className="sr-only">{id === "new" ? "New journal entry" : "Edit journal entry"}</h1>
      <textarea
        className="statement title-input"
        rows={1}
        value={row.title}
        placeholder="Title"
        aria-label="Title"
        onChange={(e) => set({ title: e.target.value })}
      />
      <textarea
        className="statement title-input lead-input"
        rows={2}
        value={row.description}
        placeholder="A one-sentence summary"
        aria-label="Summary"
        onChange={(e) => set({ description: e.target.value })}
      />
      <div className="entry-meta">
        <label>
          <span>Date</span>
          <input type="date" value={row.date} onChange={(e) => set({ date: e.target.value })} />
        </label>
        <label>
          <span>Topic</span>
          <input value={row.topic} placeholder="Process" onChange={(e) => set({ topic: e.target.value })} />
        </label>
        <label>
          <span>Address</span>
          <input value={row.slug} placeholder={slugify(row.title)} onChange={(e) => set({ slug: e.target.value })} />
        </label>
      </div>
      <RichText
        value={row.content}
        onChange={(content) => set({ content })}
        placeholder="Write the entry. Drop in images or video anywhere."
      />
      <SaveBar
        row={row}
        set={set}
        note={note}
        busy={busy}
        onSave={save}
        onDelete={id === "new" ? undefined : remove}
        viewPath={id !== "new" && row.published ? `/journal/${row.slug}/` : undefined}
      />
    </>
  );
}

/* Toolbox: a list of links, edited in place -------------------------- */
function LinkForm({
  row,
  categories,
  onSave,
  onDelete,
  onCancel,
}: {
  row: Row;
  categories: string[];
  onSave: (row: Row) => Promise<string | void>;
  onDelete?: () => void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(row);
  const [note, setNote] = useState("");
  const set = (patch: Row) => setDraft((d) => ({ ...d, ...patch }));
  async function submit(event: FormEvent) {
    event.preventDefault();
    setNote((await onSave(draft)) || "");
  }
  const lists = `categories-${row.id || "new"}`;
  return (
    <form className="link-form" onSubmit={submit}>
      <input
        required
        type="url"
        placeholder="https://"
        aria-label="Link"
        value={draft.url}
        onChange={(e) => set({ url: e.target.value })}
      />
      <input
        required
        placeholder="Name"
        aria-label="Name"
        value={draft.title}
        onChange={(e) => set({ title: e.target.value })}
      />
      <input
        required
        placeholder="Category"
        aria-label="Category"
        list={lists}
        value={draft.category}
        onChange={(e) => set({ category: e.target.value })}
      />
      <input
        className="wide"
        placeholder="What it’s good for (optional)"
        aria-label="Description"
        value={draft.description}
        onChange={(e) => set({ description: e.target.value })}
      />
      <datalist id={lists}>
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="link-form-end">
        <button className="button" type="submit">
          {row.id ? "Save" : "Add link"}
        </button>
        <label className="check">
          <input
            type="checkbox"
            checked={!!draft.featured}
            onChange={(e) => set({ featured: e.target.checked })}
          />
          Highlight
        </label>
        {onCancel ? (
          <button type="button" className="text-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
        {onDelete ? <DeleteButton onConfirm={onDelete} /> : null}
        <span role="status" className="muted">
          {note}
        </span>
      </div>
    </form>
  );
}

function ToolboxManager() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState("");
  const [fresh, setFresh] = useState(0);
  const load = useCallback(() => {
    db.from("resources")
      .select("*")
      .order("category")
      .order("sort")
      .limit(2000)
      .then(({ data }) => setRows(data || []));
  }, []);
  useEffect(load, [load]);
  const categories = useMemo(
    () => [...new Set((rows || []).map((r) => r.category))].sort(),
    [rows],
  );
  const shown = (rows || []).filter((r) =>
    `${r.title} ${r.url} ${r.category} ${r.description}`.toLowerCase().includes(q.toLowerCase()),
  );
  async function add(draft: Row) {
    const row = {
      ...draft,
      id: `${slugify(draft.title).slice(0, 48) || "link"}-${crypto.randomUUID().slice(0, 6)}`,
      sort: Math.max(0, ...(rows || []).map((r) => r.sort)) + 1,
    };
    const { error } = await db.from("resources").insert(row);
    if (error)
      return error.code === "23505" ? "That link is already in the toolbox." : problem(error);
    setFresh((n) => n + 1);
    load();
  }
  async function update(draft: Row) {
    const fields = { ...draft };
    delete fields.id;
    delete fields.created_at;
    const { error } = await db.from("resources").update(fields).eq("id", draft.id);
    if (error)
      return error.code === "23505" ? "Another entry already uses that link." : problem(error);
    setEditing("");
    load();
  }
  async function remove(id: string) {
    await db.from("resources").delete().eq("id", id);
    setEditing("");
    load();
  }
  return (
    <>
      <div className="admin-head">
        <h1 className="statement">Toolbox</h1>
        <p className="statement">
          {rows ? `${rows.length} links.` : "Loading."} Add one, or pick a link to change it.
        </p>
      </div>
      <section className="admin-section">
        <h2 className="label">New link</h2>
        <LinkForm
          key={fresh}
          row={{ url: "", title: "", category: "", description: "", featured: false }}
          categories={categories}
          onSave={add}
        />
      </section>
      <section className="admin-section">
        <h2 className="label">All links</h2>
        <div className="filter">
          <input
            type="search"
            placeholder="Filter links"
            aria-label="Filter links"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <ul className="link-list">
          {shown.map((r) =>
            editing === r.id ? (
              <li key={r.id} className="link-editing">
                <LinkForm
                  row={r}
                  categories={categories}
                  onSave={update}
                  onDelete={() => remove(r.id)}
                  onCancel={() => setEditing("")}
                />
              </li>
            ) : (
              <li key={r.id}>
                <button type="button" className="line" onClick={() => setEditing(r.id)}>
                  <span className="line-title">{r.title}</span>
                  <span className="line-note">{host(r.url)}</span>
                  <span className="line-end">
                    {r.featured ? "Highlight, " : ""}
                    {r.category}
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>
        {rows && !shown.length ? <p className="muted">No links match “{q}”.</p> : null}
      </section>
    </>
  );
}

/* About: laid out like the About page -------------------------------- */
function AboutEditor() {
  const [row, setRow] = useState<Row | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    db.from("site_content")
      .select("value")
      .eq("key", "about")
      .maybeSingle()
      .then(({ data }) => setRow({ ...initial.about, ...(data?.value || {}) }));
  }, []);
  if (!row) return <p className="muted">Loading</p>;
  const set = (patch: Row) => setRow((current) => ({ ...current, ...patch }));
  async function save() {
    if (!row) return;
    setBusy(true);
    const value = {
      ...row,
      disciplines: (row.disciplines || []).map((d: string) => d.trim()).filter(Boolean),
    };
    const { error } = await db
      .from("site_content")
      .upsert({ key: "about", value, updated_at: new Date().toISOString() });
    setBusy(false);
    setNote(error ? problem(error) : "Saved and live on the site.");
  }
  return (
    <>
      <h1 className="sr-only">Edit the About page</h1>
      <textarea
        className="statement title-input"
        rows={3}
        value={row.statement}
        placeholder="One sentence about how you work"
        aria-label="Opening statement"
        onChange={(e) => set({ statement: e.target.value })}
      />
      <section className="admin-section about-grid">
        <ImageSlot
          className="portrait-slot"
          label="portrait"
          value={row.portrait}
          onChange={(portrait) => set({ portrait })}
        />
        <RichText
          value={row.html}
          onChange={(html) => set({ html })}
          placeholder="Who you are, what you care about, what you’re doing now."
        />
      </section>
      <section className="admin-section">
        <h2 className="label">What I do</h2>
        <textarea
          className="plain-area"
          rows={Math.max(3, (row.disciplines || []).length + 1)}
          value={(row.disciplines || []).join("\n")}
          aria-label="What I do, one per line"
          placeholder="One per line"
          onChange={(e) => set({ disciplines: e.target.value.split("\n") })}
        />
      </section>
      <SaveBar row={row} note={note} busy={busy} onSave={save} viewPath="/about/" />
    </>
  );
}

/* Inbox --------------------------------------------------------------- */
const when = (stamp: string) =>
  new Date(stamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
function Inbox({ onCount }: { onCount: (n: number) => void }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [open, setOpen] = useState("");
  const load = useCallback(() => {
    db.from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => {
        setRows(data || []);
        onCount((data || []).filter((m) => !m.read).length);
      });
  }, [onCount]);
  useEffect(load, [load]);
  async function mark(id: string, read: boolean) {
    await db.from("messages").update({ read }).eq("id", id);
    load();
  }
  return (
    <>
      <div className="admin-head">
        <h1 className="statement">Inbox</h1>
        <p className="statement">Messages sent from the contact page.</p>
      </div>
      {rows && !rows.length ? (
        <p className="muted">
          No messages yet. They’ll appear here when someone writes to you.
        </p>
      ) : null}
      <ul className="inbox">
        {(rows || []).map((m) => (
          <li key={m.id} className={m.read ? undefined : "unread"}>
            <button
              type="button"
              className="line"
              aria-expanded={open === m.id}
              onClick={() => {
                setOpen(open === m.id ? "" : m.id);
                if (!m.read) mark(m.id, true);
              }}
            >
              <span className="line-title">{m.name}</span>
              <span className="line-note">{m.message}</span>
              <span className="line-end">{when(m.created_at)}</span>
            </button>
            {open === m.id ? (
              <div className="message">
                <p className="message-body">{m.message}</p>
                <div className="message-end">
                  <a
                    className="button"
                    href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message")}`}
                  >
                    Reply to {m.email}
                  </a>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      mark(m.id, false);
                      setOpen("");
                    }}
                  >
                    Mark unread
                  </button>
                  <DeleteButton
                    onConfirm={async () => {
                      await db.from("messages").delete().eq("id", m.id);
                      load();
                    }}
                  />
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}

/* Insights ------------------------------------------------------------ */
const shortDay = (value: string) =>
  new Date(value + "T12:00:00Z").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
function Ranked({ rows, name }: { rows: Row[]; name: (row: Row) => string }) {
  const top = Math.max(1, ...rows.map((r) => r.views));
  return (
    <ul className="ranked">
      {rows.map((r) => (
        <li key={name(r)} style={{ "--share": `${(r.views / top) * 100}%` } as CSSProperties}>
          <span>{name(r)}</span>
          <span>{Number(r.views).toLocaleString()}</span>
        </li>
      ))}
    </ul>
  );
}
function Insights() {
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<{ days: number; data: Row } | null>(null);
  const [titles, setTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    db.rpc("insights", { days }).then(({ data }) => {
      if (active)
        setResult({
          days,
          data: data || { views: 0, visitors: 0, daily: [], pages: [], referrers: [] },
        });
    });
    return () => {
      active = false;
    };
  }, [days]);
  useEffect(() => {
    Promise.all([
      db.from("projects").select("slug,title"),
      db.from("articles").select("slug,title"),
    ]).then(([projects, articles]) => {
      const map: Record<string, string> = {
        "/": "Home",
        "/work/": "Work",
        "/journal/": "Journal",
        "/toolbox/": "Toolbox",
        "/about/": "About",
        "/contact/": "Contact",
        "/privacy/": "Privacy",
        "/playground/": "Playground",
        "/playground/aspect-ratio/": "Aspect ratio",
      };
      for (const p of projects.data || []) map[`/work/${p.slug}/`] = p.title;
      for (const a of articles.data || []) map[`/journal/${a.slug}/`] = a.title;
      setTitles(map);
    });
  }, []);
  const data = result?.days === days ? result.data : null;
  const peak = Math.max(1, ...(data?.daily || []).map((d: Row) => d.views));
  const reads = (data?.pages || []).filter((p: Row) => /^\/journal\/.+/.test(p.path));
  const name = (r: Row) => titles[r.path] || r.path;
  return (
    <>
      <div className="admin-head">
        <h1 className="statement">Insights</h1>
        <p className="statement">What’s being read, counted without cookies.</p>
        <div className="cats" role="group" aria-label="Period">
          {[7, 30, 90].map((n) => (
            <button key={n} type="button" aria-pressed={days === n} onClick={() => setDays(n)}>
              Last {n} days
            </button>
          ))}
        </div>
      </div>
      {!data ? (
        <p className="muted">Loading</p>
      ) : (
        <>
          <dl className="totals">
            <div>
              <dt>Page views</dt>
              <dd>{Number(data.views).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Visits</dt>
              <dd>{Number(data.visitors).toLocaleString()}</dd>
            </div>
          </dl>
          <section className="admin-section">
            <h2 className="label">Views per day</h2>
            {data.views ? (
              <>
                <div
                  className="bars"
                  role="img"
                  aria-label={`Views per day over the last ${days} days. The busiest day had ${peak} views.`}
                >
                  {data.daily.map((d: Row) => (
                    <span
                      key={d.day}
                      title={`${shortDay(d.day)}: ${d.views} views, ${d.visitors} visits`}
                      style={{ height: `${d.views ? Math.max(3, (d.views / peak) * 100) : 0.5}%` }}
                    />
                  ))}
                </div>
                <div className="bars-axis">
                  <span>{shortDay(data.daily[0].day)}</span>
                  <span>Busiest day: {peak}</span>
                  <span>{shortDay(data.daily[data.daily.length - 1].day)}</span>
                </div>
              </>
            ) : (
              <p className="muted">
                No views in this period yet. Counting starts once the site is live.
              </p>
            )}
          </section>
          {data.pages.length ? (
            <section className="admin-section">
              <h2 className="label">Pages</h2>
              <Ranked rows={data.pages.slice(0, 12)} name={name} />
            </section>
          ) : null}
          {reads.length ? (
            <section className="admin-section">
              <h2 className="label">Journal reads</h2>
              <Ranked rows={reads} name={name} />
            </section>
          ) : null}
          {data.referrers.length ? (
            <section className="admin-section">
              <h2 className="label">Where visitors came from</h2>
              <Ranked rows={data.referrers} name={(r) => r.referrer} />
            </section>
          ) : null}
        </>
      )}
    </>
  );
}

/* First run: copy the content the site was built with into the database */
function ImportContent({ onDone }: { onDone: () => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      const steps: [string, Row[], string][] = [
        ["projects", initial.projects.map(fromProject), "slug"],
        ["articles", initial.articles.map(fromArticle), "slug"],
        ["resources", initial.resources.map(fromResource), "id"],
      ];
      for (const [table, rows, key] of steps)
        for (let i = 0; i < rows.length; i += 200) {
          setNote(`Importing ${table}`);
          const { error } = await db
            .from(table)
            .upsert(rows.slice(i, i + 200), { onConflict: key });
          if (error) throw error;
        }
      const { error } = await db.from("site_content").upsert([
        { key: "about", value: initial.about },
        { key: "seeded", value: true },
      ]);
      if (error) throw error;
      onDone();
    } catch (error) {
      setNote(problem(error));
    }
    setBusy(false);
  }
  return (
    <div className="banner">
      <p>
        Your current content isn’t in the database yet. Import{" "}
        {initial.projects.length} project, {initial.articles.length} journal entry
        and {initial.resources.length} links so you can edit them here. Until you
        do, the site keeps showing the content it was built with.
      </p>
      <button type="button" className="button" onClick={run} disabled={busy}>
        {busy ? note || "Importing" : "Import content"}
      </button>
      {!busy && note ? <p role="alert">{note}</p> : null}
    </div>
  );
}

/* The admin ----------------------------------------------------------- */
export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [recovering, setRecovering] = useState(false);
  const [access, setAccess] = useState<{ user: string; allowed: boolean } | null>(null);
  const [seeded, setSeeded] = useState<boolean | null>(null);
  const [unread, setUnread] = useState(0);
  const [view = "inbox", id] = useHash();

  useEffect(() => {
    document.title = `Admin | ${site.name}`;
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      setSession(next);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const user = session?.user.id;
  useEffect(() => {
    if (!user) return;
    db.rpc("is_admin").then(({ data }) => setAccess({ user, allowed: !!data }));
  }, [user]);
  const allowed = access && access.user === user ? access.allowed : null;
  useEffect(() => {
    if (!allowed) return;
    db.from("site_content")
      .select("key")
      .eq("key", "seeded")
      .maybeSingle()
      .then(({ data }) => setSeeded(!!data));
    db.from("messages")
      .select("id", { count: "exact", head: true })
      .eq("read", false)
      .then(({ count }) => setUnread(count || 0));
  }, [allowed]);

  if (session === undefined)
    return (
      <Shell>
        <p className="muted">Loading</p>
      </Shell>
    );
  if (!session || recovering) return <SignIn recovering={recovering && !!session} />;
  if (allowed === null)
    return (
      <Shell>
        <p className="muted">Checking access</p>
      </Shell>
    );
  if (!allowed)
    return (
      <Shell>
        <div className="admin-head">
          <h1 className="statement">This account can’t manage the site.</h1>
          <p className="statement">
            You’re signed in as {session.user.email}, which isn’t this site’s admin address.
          </p>
          <button type="button" className="button" onClick={() => db.auth.signOut()}>
            Sign out
          </button>
        </div>
      </Shell>
    );

  let page: ReactNode;
  if (view === "insights") page = <Insights />;
  else if (view === "work")
    page = id ? (
      <ProjectEditor key={id} id={id} />
    ) : (
      <EntryList
        table="projects"
        view="work"
        title="Work"
        noun="project"
        order="sort"
        lead="Case studies, in the order they appear on the site."
        note={(r) => r.subtitle}
      />
    );
  else if (view === "journal")
    page = id ? (
      <ArticleEditor key={id} id={id} />
    ) : (
      <EntryList
        table="articles"
        view="journal"
        title="Journal"
        noun="entry"
        order="date"
        lead="Entries, newest first."
        note={(r) => prettyDate(r.date)}
      />
    );
  else if (view === "toolbox") page = <ToolboxManager />;
  else if (view === "about") page = <AboutEditor />;
  else page = <Inbox onCount={setUnread} />;

  return (
    <Shell
      rail={
        <nav className="admin-nav" aria-label="Admin">
          {views.map((v) => (
            <a key={v.id} href={`#/${v.id}`} aria-current={view === v.id ? "page" : undefined}>
              {v.label}
              {v.id === "inbox" && unread ? <span>{unread}</span> : null}
            </a>
          ))}
          <hr />
          <a href={href("/")} target="_blank" rel="noopener noreferrer">
            View site
          </a>
          <button type="button" onClick={() => db.auth.signOut()}>
            Sign out
          </button>
        </nav>
      }
    >
      {seeded === false ? <ImportContent onDone={() => setSeeded(true)} /> : null}
      {page}
    </Shell>
  );
}
