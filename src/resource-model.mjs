export const PAGE_SIZE = 18;
export function normalize(value) { return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }
export function filterResources(resources, state, saved = new Set()) {
  const terms = normalize(state.q || '').split(/\s+/).filter(Boolean);
  const result = resources.filter(r =>
    (!state.category || state.category === 'all' || r.category === state.category) &&
    (!state.saved || saved.has(r.id)) &&
    (!state.featured || r.featured) &&
    terms.every(term => normalize(`${r.title} ${r.description} ${r.domain} ${r.category} ${(r.tags || []).join(' ')}`).includes(term))
  );
  if (state.sort === 'az') result.sort((a,b) => a.title.localeCompare(b.title));
  else if (state.sort === 'za') result.sort((a,b) => b.title.localeCompare(a.title));
  else result.sort((a,b) => Number(b.featured)-Number(a.featured) || a.order-b.order);
  return result;
}
export function parseState(search, categories) {
  const p = new URLSearchParams(search), category = p.get('category');
  return {q:(p.get('q')||'').slice(0,200),category:categories.includes(category)?category:'all',saved:p.get('saved')==='1',featured:p.get('featured')==='1',sort:['az','za'].includes(p.get('sort'))?p.get('sort'):'curated'};
}
export function serializeState(state) {
  const p = new URLSearchParams();
  if (state.q) p.set('q',state.q);
  if (state.category && state.category !== 'all') p.set('category',state.category);
  if (state.saved) p.set('saved','1');
  if (state.featured) p.set('featured','1');
  if (state.sort && state.sort !== 'curated') p.set('sort',state.sort);
  return p.toString();
}
export function importFavorites(value, resources) {
  if (!value || value.version !== 1 || !Array.isArray(value.favorites)) throw new Error('Choose a Toolbox favorites export (version 1).');
  const known = new Map(resources.map(r=>[r.id,r]));
  return [...new Set(value.favorites.map(item => typeof item==='string'?item:item?.id).filter(id=>typeof id==='string'&&known.has(id)))];
}
export function migrateFavorites(raw, resources) {
  if (!Array.isArray(raw)) return new Set();
  const lookup = new Map(resources.flatMap(r=>[[r.id,r.id],[r.url,r.id]]));
  return new Set(raw.map(id=>lookup.get(id)).filter(Boolean));
}
