# Admin, inbox and insights

The admin lives at `/admin/`. It is a separate bundle that only loads on that page.

## First sign-in

1. In Supabase, open the `portfolio` project, then Authentication, URL Configuration. Set **Site URL** to the live site address and add `https://your-domain/admin/` to **Redirect URLs**. Confirmation and password-reset emails link back there.
2. Open `/admin/`, choose "First time? Create account", and sign up with the admin email address. The address is kept in the database (`private.admin_emails`), not in this repository; it is separate from the public contact address.
3. Open the confirmation email, then sign in.
4. Press "Import content" once. This copies the project, journal entry and links the site was built with into the database. From then on the database is the source of the site's content.

Only confirmed accounts whose email is listed in `private.admin_emails` can read or change anything. Anyone else who signs up sees "This account can't manage the site."

## What each section edits

| Section | Edits | Stored in |
| --- | --- | --- |
| Work | Case studies: name, description, cover, details, rich text body | `projects` |
| Journal | Entries: title, summary, date, topic, rich text body | `articles` |
| Toolbox | Links: address, name, category, description, highlight | `resources` |
| About | Opening statement, portrait, rich text body, "What I do" | `site_content` (`about`) |
| Inbox | Messages from the contact form | `messages` |
| Insights | Page views, visits, top pages, journal reads, sources | `page_views` via `insights()` |

Images and video upload to the public `media` storage bucket (50 MB per file).

## How changes reach the site

Every page is built as static HTML, then asks the database for current content when it loads. A saved change shows up on the next page load, with no deploy. A new entry's address works straight away too: the 404 page looks the address up before saying it doesn't exist.

The static HTML itself (what search engines and link previews read) refreshes on the next deploy. `pnpm run build` reads from the database; if it can't be reached, or `CONTENT_FROM_FILES=1` is set, it builds from the files in `/content`. `pnpm run check` always builds from the files so tests don't depend on live data.

## Visit counting

Each page load on the public site records the path, the referring site, the time and a random id kept in `sessionStorage` until the tab closes. No cookies, no IP addresses. Browsers sending Do Not Track are not counted. The admin is never counted.

## Database

The schema was applied as the `portfolio_schema` migration in the Supabase project: six tables with row-level security, the `is_admin()` and `insights()` functions, and the `media` bucket with its policies. The project address and publishable key are in `content/site.json` under `backend`; the publishable key is safe to ship because access is decided by the database rules.
