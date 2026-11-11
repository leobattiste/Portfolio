import { backend } from "./site";

// Small write-only calls from the public site. Reading happens in content-model.
function send(table: string, row: Record<string, unknown>) {
  return fetch(`${backend.url}/rest/v1/${table}`, {
    method: "POST",
    keepalive: true,
    headers: {
      apikey: backend.key,
      Authorization: `Bearer ${backend.key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
}

export async function sendMessage(message: {
  name: string;
  email: string;
  message: string;
}) {
  const response = await send("messages", message);
  if (!response.ok) throw new Error(String(response.status));
}

/* Counts one page view. No cookie and nothing kept after the tab closes:
   the id lives in sessionStorage so one visit isn't counted as several people. */
export function recordView(path: string) {
  try {
    if (navigator.doNotTrack === "1") return;
    let visitor = sessionStorage.getItem("leo-visit");
    if (!visitor) {
      visitor = crypto.randomUUID();
      sessionStorage.setItem("leo-visit", visitor);
    }
    let referrer = "";
    try {
      const from = new URL(document.referrer);
      if (from.host !== location.host) referrer = from.hostname.replace(/^www\./, "");
    } catch {}
    send("page_views", { path, referrer, visitor }).catch(() => {});
  } catch {}
}
