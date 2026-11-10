import { PAGE_SIZE, filterResources, parseState, serializeState, importFavorites, migrateFavorites } from './resource-model.mjs';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const base = document.body.dataset.base || '';
const html = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;
function notify(message) {
  const toast = $('#toast');
  toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>toast.classList.remove('show'),3500);
}
const menu = $('.menu-toggle');
if (menu) document.querySelector('.site-header').classList.add('menu-ready');
menu?.addEventListener('click',()=>{
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded',String(open));
  document.querySelector('.site-header').classList.toggle('menu-open',open);
});
document.addEventListener('keydown',event=>{
  if (event.key==='Escape' && menu?.getAttribute('aria-expanded')==='true') {
    menu.click(); menu.focus();
  }
});
$$('[data-share]').forEach(button=>button.addEventListener('click',async()=>{
  try { await navigator.clipboard.writeText(location.href); notify('Link copied.'); }
  catch { notify('Copy the page address from your browser to share it.'); }
}));
$$('[data-topic]').forEach(button=>button.addEventListener('click',()=>{
  $$('[data-topic]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  $$('[data-article-topic]').forEach(article=>{article.hidden = button.dataset.topic!=='all' && article.dataset.articleTopic!==button.dataset.topic;});
}));
const progress = $('.reading-progress');
if (progress) {
  let scheduled = false;
  const update = ()=>{
    const article = $('.article-body');
    const start = article.offsetTop-window.innerHeight*.35;
    const distance = article.offsetHeight-window.innerHeight*.3;
    progress.style.transform = `scaleX(${Math.max(0,Math.min(1,(window.scrollY-start)/Math.max(1,distance)))})`;
    scheduled = false;
  };
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',update); update();
}
if ($('[data-save]') || $('#resource-grid')) initResources();
async function initResources() {
  let resources;
  try {
    const response = await fetch(`${base}/resources.json`);
    if (!response.ok) throw new Error('Collection unavailable');
    resources = await response.json();
  } catch {
    if ($('#result-count')) $('#result-count').textContent='Search is temporarily unavailable. All resources are listed below.';
    $$('[data-save],#featured-filter,#saved-filter,#export-favorites,#import-favorites,.category-button,#resource-sort,#mobile-category').forEach(el=>{el.disabled=true;});
    if ($('#resource-search')) $('#resource-search').disabled=true;
    return;
  }
  const key = 'leo-toolbox-favorites-v1';
  let saved = new Set(), storageAvailable = true;
  try {
    const current = localStorage.getItem(key);
    const raw = JSON.parse(current ?? localStorage.getItem('design-practice-saved') ?? '[]');
    saved = migrateFavorites(raw,resources);
    localStorage.setItem(key,JSON.stringify([...saved]));
  } catch { storageAvailable = false; }
  const categories = [...new Set(resources.map(r=>r.category))];
  let state = parseState(location.search,categories), limit = PAGE_SIZE;
  const grid = $('#resource-grid');
  function syncSaveButtons() {
    $$('[data-save]').forEach(button=>{
      const on = saved.has(button.dataset.save);
      button.setAttribute('aria-pressed',String(on));
      button.setAttribute('aria-label',`${on?'Unsave':'Save'} ${button.dataset.title}`);
      const icon = button.querySelector('[aria-hidden]'); if (icon) icon.textContent=on?'♥':'♡';
      const label = button.querySelector('.save-label'); if (label) label.textContent=on?'Saved resource':'Save resource';
    });
    const label = $('#saved-filter span'); if (label) label.textContent=`Saved${saved.size?' ('+saved.size+')':''}`;
  }
  function persist() {
    try { localStorage.setItem(key,JSON.stringify([...saved])); storageAvailable=true; }
    catch { storageAvailable=false; }
  }
  function card(r) {
    return `<article class="resource-card" data-resource-id="${r.id}"><div class="resource-top"><span class="resource-icon" aria-hidden="true">${html(r.title[0].toUpperCase())}</span><button class="save-button" data-save="${r.id}" data-title="${html(r.title)}" aria-label="Save ${html(r.title)}" aria-pressed="false"><span aria-hidden="true">♡</span></button></div><h3><a href="${base}/toolbox/${r.id}/">${html(r.title)}</a></h3><p>${html(r.description)}</p><div class="resource-bottom"><a href="${base}/toolbox/?category=${encodeURIComponent(r.category)}">${html(r.category)}</a><a href="${html(r.url)}" class="external-arrow" target="_blank" rel="noopener noreferrer" aria-label="Visit ${html(r.title)} (opens in a new tab)">↗</a></div></article>`;
  }
  function syncControls() {
    if (!grid) return;
    $('#resource-search').value=state.q;
    $('#resource-sort').value=state.sort;
    $('#mobile-category').value=state.category;
    $('#saved-filter').setAttribute('aria-pressed',String(state.saved));
    $('#featured-filter').setAttribute('aria-pressed',String(state.featured));
    $$('.category-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
    $('#clear-filters').hidden=!(state.q||state.category!=='all'||state.saved||state.featured||state.sort!=='curated');
  }
  function render({updateUrl=false}={}) {
    if (!grid) {syncSaveButtons();return;}
    const results = filterResources(resources,state,saved);
    grid.innerHTML=results.length?results.slice(0,limit).map(card).join(''):`<div class="empty-state"><span aria-hidden="true">⌕</span><h2>${state.saved?'Your next favorite is out there.':'No matches, yet.'}</h2><p>${state.saved&&!saved.size?'Tap the heart on a resource to keep it here.':'Try a different search or clear the filters.'}</p><button class="button secondary" data-reset>Explore all resources</button></div>`;
    $('#result-count').textContent=`${results.length} resource${results.length===1?'':'s'} · ${state.category==='all'?'All categories':state.category}${state.saved?' · Saved':''}${state.featured?' · Highlights':''}`;
    $('#load-more').hidden=results.length<=limit;
    if(results.length>limit) $('#load-more').textContent=`Explore more resources (${results.length-limit} more) ↓`;
    syncControls(); syncSaveButtons();
    if (updateUrl) {
      const query = serializeState(state);
      history.replaceState(null,'',`${location.pathname}${query?'?'+query:''}${location.hash}`);
    }
  }
  function setState(patch) {state={...state,...patch};limit=PAGE_SIZE;render({updateUrl:true});}
  document.addEventListener('click',event=>{
    const button = event.target.closest('[data-save]');
    if (!button || button.disabled) return;
    const id = button.dataset.save, on = !saved.has(id);
    on?saved.add(id):saved.delete(id); persist();
    if (grid && state.saved) {
      const previous = [...grid.querySelectorAll('[data-save]')].indexOf(button);
      render();
      const next = grid.querySelectorAll('[data-save]')[Math.max(0,previous-1)];
      (next||$('#saved-filter')).focus();
    } else syncSaveButtons();
    notify(storageAvailable?(on?'Resource saved.':'Removed from favorites.'):'Saved for this visit only. Export a copy to keep your favorites.');
  });
  if (grid) {
    let searchTimer;
    $('#search-form').addEventListener('submit',event=>{event.preventDefault();clearTimeout(searchTimer);setState({q:$('#resource-search').value.trim()});});
    $('#resource-search').addEventListener('input',event=>{const value=event.target.value;clearTimeout(searchTimer);searchTimer=setTimeout(()=>setState({q:value}),180);});
    $$('.category-button').forEach(button=>button.addEventListener('click',()=>setState({category:button.dataset.category})));
    $('#mobile-category').addEventListener('change',event=>setState({category:event.target.value}));
    $('#resource-sort').addEventListener('change',event=>setState({sort:event.target.value}));
    $('#saved-filter').addEventListener('click',()=>setState({saved:!state.saved}));
    $('#featured-filter').addEventListener('click',()=>setState({featured:!state.featured}));
    const reset=()=>setState({q:'',category:'all',saved:false,featured:false,sort:'curated'});
    $('#clear-filters').addEventListener('click',reset);
    grid.addEventListener('click',event=>{if(event.target.closest('[data-reset]')){reset();$('#resource-search').focus();}});
    $('#load-more').addEventListener('click',()=>{
      const previous=limit;limit+=PAGE_SIZE;render();
      grid.querySelectorAll('.resource-card h3 a')[previous]?.focus({preventScroll:true});
    });
    document.addEventListener('keydown',event=>{
      if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest('input,textarea,select,[contenteditable]')){event.preventDefault();$('#resource-search').focus();}
    });
    addEventListener('popstate',()=>{state=parseState(location.search,categories);limit=PAGE_SIZE;render();});
    $('#export-favorites').addEventListener('click',()=>{
      if(!saved.size){notify('Save a resource first, then export your favorites.');return;}
      const data={version:1,collection:'Leo Battiste — Toolbox',favorites:resources.filter(r=>saved.has(r.id)).map(r=>({id:r.id,title:r.title,url:r.url}))};
      const link=document.createElement('a');const objectUrl=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
      link.href=objectUrl;link.download='leo-toolbox-favorites.json';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),1000);notify('Favorites exported.');
    });
    $('#import-favorites').addEventListener('change',async event=>{
      const file=event.target.files[0];if(!file)return;
      try {
        if(file.size>1024*1024)throw new Error('Choose a favorites file smaller than 1 MB.');
        const ids=importFavorites(JSON.parse(await file.text()),resources);
        const before=saved.size;ids.forEach(id=>saved.add(id));persist();render();
        notify(ids.length?`${saved.size-before} new favorites imported.${storageAvailable?'':' Saved for this visit only.'}`:'No matching resources found in that file.');
      } catch(error){notify(error instanceof SyntaxError?'That file is not valid JSON. Choose a Toolbox favorites export.':error.message);}
      finally {event.target.value='';}
    });
    render();
  } else syncSaveButtons();
  addEventListener('storage',event=>{
    if(event.key!==key&&event.key!==null)return;
    try{saved=migrateFavorites(JSON.parse(event.newValue||'[]'),resources);render();}catch{/* Keep the current valid favorites. */}
  });
}
