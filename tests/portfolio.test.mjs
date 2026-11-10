import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
import { filterResources,parseState,serializeState,importFavorites,migrateFavorites } from '../src/resource-model.mjs';
import { markdown,parseArticle,safeWebUrl,validateContent } from '../scripts/lib.mjs';
const resources=JSON.parse(await readFile(new URL('../dist/resources.json',import.meta.url),'utf8'));
const sample=[{id:'a',title:'Écriture',description:'Type families',domain:'type.test',category:'Typography',tags:['Open source'],featured:false,order:0,url:'https://type.test/'},{id:'b',title:'Grid',description:'UI components',domain:'grid.test',category:'UI & development',tags:[],featured:true,order:1,url:'https://grid.test/'}];
test('search matches accents, descriptions, and tags, with all terms required',()=>{
 assert.equal(filterResources(sample,{q:'ecriture open'}).length,1);
 assert.equal(filterResources(sample,{q:'type families'}).length,1);
 assert.equal(filterResources(sample,{q:'families grid'}).length,0);
});
test('category, highlights, and saved filters intersect',()=>{
 assert.deepEqual(filterResources(sample,{category:'Typography',saved:true},new Set(['b'])),[]);
 assert.deepEqual(filterResources(sample,{featured:true},new Set()).map(x=>x.id),['b']);
 assert.deepEqual(filterResources(sample,{saved:true},new Set(['a'])).map(x=>x.id),['a']);
});
test('sorting leaves original collection untouched',()=>{
 assert.deepEqual(filterResources(sample,{}).map(x=>x.id),['b','a']);
 assert.deepEqual(filterResources(sample,{sort:'az'}).map(x=>x.id),['a','b']);
 assert.deepEqual(sample.map(x=>x.id),['a','b']);
});
test('filter URLs preserve a shared state and reject invalid values',()=>{
 const state={q:'type & icons',category:'Typography',sort:'za',saved:true,featured:true};
 assert.deepEqual(parseState('?'+serializeState(state),['Typography']),state);
 assert.deepEqual(parseState('?category=Unknown&sort=bad&saved=false',[]),{q:'',category:'all',sort:'curated',saved:false,featured:false});
});
test('favorites import only accepts a supported export and known IDs',()=>{
 assert.deepEqual(importFavorites({version:1,favorites:[{id:'a'},'a','not-in-collection',null]},sample),['a']);
 assert.throws(()=>importFavorites({version:2,favorites:[]},sample));
 assert.deepEqual([...migrateFavorites(['https://grid.test/','a','unknown'],sample)],['b','a']);
});
test('Markdown escapes markup and prevents script URLs',()=>{
 const rendered=markdown('<script>alert(1)</script>\n\n[bad](javascript:alert)\n\n[good](/about/)',p=>'/Portfolio-'+p);
 assert.ok(!rendered.includes('<script>'));assert.ok(!rendered.includes('href="javascript:'));
 assert.ok(rendered.includes('href="/Portfolio-/about/"'));
 assert.equal(safeWebUrl('javascript:alert(1)'),false);
 assert.equal(safeWebUrl('https://user:password@example.com/'),false);
});
test('published collection excludes missing pages and account dashboards',()=>{
 assert.ok(resources.length>300);
 for(const r of resources){
  assert.notEqual(r.linkStatus,'broken');assert.ok(safeWebUrl(r.url));
  assert.ok(!/analytics\.google|editor\.wix|dashboard\.stripe|drive\.google|outlook\.office/.test(r.url));
 }
 assert.equal(new Set(resources.map(x=>x.id)).size,resources.length);
 assert.equal(new Set(resources.map(x=>x.url)).size,resources.length);
});
const out=new URL('../dist/',import.meta.url);
async function htmlFiles(dir){const entries=await readdir(dir,{withFileTypes:true});const files=[];for(const entry of entries){const p=path.join(dir,entry.name);if(entry.isDirectory())files.push(...await htmlFiles(p));else if(entry.name.endsWith('.html'))files.push(p);}return files;}
test('every generated page has a title, unique main heading, and canonical metadata',async()=>{
 const files=await htmlFiles(out.pathname);
 const info=JSON.parse(await readFile(new URL('build-info.json',out),'utf8'));
 assert.equal(files.length,info.pages+1); // Includes the noindex 404 page.
 for(const file of files){const text=await readFile(file,'utf8');
  assert.equal((text.match(/<h1(?:\s|>)/g)||[]).length,1,file);
  assert.ok(/<title>.+?<\/title>/.test(text),file);assert.ok(text.includes('rel="canonical"'),file);
  assert.ok(text.includes('class="skip"'),file);assert.ok(text.includes('<html lang="en">'),file);
  const ids=[...text.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,'duplicate IDs: '+file);
  for(const m of text.matchAll(/<img\b([^>]+)>/g))assert.ok(/\balt="/.test(m[1]),'image missing alt: '+file);
 }
});
test('every internal route and asset resolves in the built site',async()=>{
 const fs=await import('node:fs/promises');const info=JSON.parse(await readFile(new URL('build-info.json',out),'utf8'));
 const files=await htmlFiles(out.pathname);
 for(const file of files){const text=await readFile(file,'utf8');
  for(const match of text.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){
   let pathname=decodeURIComponent(match[1]);
   if(info.basePath){assert.ok(pathname.startsWith(info.basePath+'/'),'link missing base path');pathname=pathname.slice(info.basePath.length);}
   const target=path.join(out.pathname,pathname.endsWith('/')?pathname+'index.html':pathname);
   await assert.doesNotReject(()=>fs.access(target),`${file}: ${pathname}`);
  }
 }
});
test('draft stories and sample concepts are not published',async()=>{
 await assert.rejects(()=>readFile(new URL('journal/designing-pheelm/index.html',out)));
 const home=await readFile(new URL('index.html',out),'utf8');
 assert.ok(home.includes('Leo Battiste'));assert.ok(home.includes('Pheelm'));assert.ok(!home.includes('CONCEPT PROJECT'));
 const project=await readFile(new URL('work/pheelm/index.html',out),'utf8');
 assert.ok(project.includes('https://www.pheelm.com/'));assert.ok(project.includes('naming, logo, brand identity'));
});
test('feeds and sitemap include real pages and exclude drafts',async()=>{
 const sitemap=await readFile(new URL('sitemap.xml',out),'utf8');
 const feed=await readFile(new URL('feed.xml',out),'utf8');
 assert.ok(sitemap.includes('/work/pheelm/'));assert.ok(!sitemap.includes('designing-pheelm'));
 assert.ok(feed.includes('inside-the-toolbox'));assert.ok(!feed.includes('designing-pheelm'));
});
