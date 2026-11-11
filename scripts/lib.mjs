export const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const slug = value => String(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function safeWebUrl(value) {
  try { const u = new URL(value); return ['http:','https:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
export function parseArticle(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error('Article must start with JSON metadata between --- lines.');
  return { ...JSON.parse(match[1]), body: match[2].trim() };
}
export function markdown(text, url = p => p) {
  function inline(value) {
    return html(value).replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      const decoded = href.replace(/&amp;/g,'&');
      if (!(decoded.startsWith('/') && !decoded.startsWith('//')) && !safeWebUrl(decoded)) return label;
      const destination = decoded.startsWith('/') ? url(decoded) : decoded;
      return `<a href="${html(destination)}"${safeWebUrl(decoded) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
    }).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g,'<code>$1</code>');
  }
  return text.split(/\n\s*\n/).map(block => {
    if (/^## /.test(block)) { const title = block.slice(3).trim(); return `<h2 id="${slug(title)}">${inline(title)}</h2>`; }
    if (/^### /.test(block)) return `<h3>${inline(block.slice(4).trim())}</h3>`;
    if (/^- /.test(block)) return `<ul>${block.split('\n').map(line=>`<li>${inline(line.replace(/^- /,''))}</li>`).join('')}</ul>`;
    if (/^> /.test(block)) return `<blockquote>${inline(block.replace(/^> /gm,''))}</blockquote>`;
    return `<p>${inline(block.replace(/\n/g,' '))}</p>`;
  }).join('\n');
}
export function readingTime(body) { return Math.max(1, Math.ceil(body.split(/\s+/).length / 200)); }
export function validateContent(site, projects, articles, resources) {
  if (!site.name || !safeWebUrl(site.origin) || !site.email || (site.instagram && !safeWebUrl(site.instagram))) throw new Error('Site name, origin, and email are required.');
  const ids = new Set();
  for (const item of [...projects,...articles]) {
    if (!item.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error('Invalid content slug.');
    if (!item.title || !item.description) throw new Error(`Missing title or description: ${item.slug}`);
    const id = `${'sections' in item ? 'project' : 'article'}:${item.slug}`;
    if (ids.has(id)) throw new Error(`Duplicate content: ${id}`);
    ids.add(id);
    for (const key of ['liveUrl','sourceUrl']) if (item[key] && !safeWebUrl(item[key])) throw new Error(`Invalid ${key}: ${item.slug}`);
    if (item.published && 'body' in item && (!/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !item.topic)) throw new Error(`Article metadata is incomplete: ${item.slug}`);
  }
  const resourceIds = new Set(), urls = new Set();
  for (const r of resources) {
    if (!safeWebUrl(r.url) || !/^[a-z0-9-]+$/.test(r.id) || !r.category || !r.title || !r.description) throw new Error(`Invalid resource: ${r.id}`);
    if (resourceIds.has(r.id) || urls.has(r.url)) throw new Error(`Duplicate resource: ${r.id}`);
    resourceIds.add(r.id); urls.add(r.url);
  }
}
