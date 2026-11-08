/* Local, read-only mirror controls. No fetch, forms, votes, tracking or account actions. */
(()=>{'use strict';
const all=(s,r=document)=>Array.from(r.querySelectorAll(s));
const root=document.documentElement;
all('[data-latest-nav]').forEach(n=>n.hidden=false);
document.getElementById('seedLabel')?.remove();document.getElementById('stage')?.setAttribute('aria-label','פתיחה');
all('[data-copy-source-root] pre').forEach(pre=>{if(/[א-ת]/.test(pre.textContent)){pre.classList.add('he-prose-copy');pre.dir='rtl';}});
const ageFormatter=new Intl.RelativeTimeFormat('he',{numeric:'auto'});all('time[data-latest-age][datetime]').forEach(t=>{const date=new Date(t.dateTime);const seconds=Math.max(0,(Date.now()-date.getTime())/1000);if(!Number.isFinite(seconds))return;const unit=seconds<3600?'minute':seconds<86400?'hour':'day';const value=Math.floor(seconds/(unit==='minute'?60:unit==='hour'?3600:86400));t.textContent=ageFormatter.format(-value,unit);t.title=new Intl.DateTimeFormat('he-IL',{timeZone:'Asia/Jerusalem',dateStyle:'short',timeStyle:'short'}).format(date)+' שעון ישראל';if(seconds>86400)t.removeAttribute('data-fresh');});
all('[data-nav-drawer]').forEach(d=>{all('a[href],[data-nav-scrim]',d).forEach(a=>a.addEventListener('click',()=>d.open=false));});
all('[data-theme-toggle]').forEach(b=>{b.hidden=false;b.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';});});
all('[data-copy-trigger]').forEach(b=>{b.hidden=false;b.addEventListener('click',async()=>{const r=b.closest('[data-copy-root]')||b.parentElement;const t=r.querySelector('template[data-copy]')||b.closest('[data-copy-source-root]')?.querySelector('template[data-copy]');const text=t?.getAttribute('data-copy')||b.getAttribute('data-copy')||b.closest('[data-copy-source-root]')?.querySelector('pre')?.textContent;if(!text)return;try{if(navigator.clipboard&&isSecureContext)await navigator.clipboard.writeText(text);else{const a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.opacity='0';document.body.append(a);a.select();document.execCommand('copy');a.remove();}const label=b.querySelector('[data-copy-label]')||b;const old=label.textContent;label.textContent='הועתק';setTimeout(()=>{label.textContent=old;},1800);}catch{const box=document.createElement('textarea');box.value=text;b.after(box);box.select();}});});
all('[data-home-tab]').forEach(button=>button.addEventListener('click',()=>{const v=button.dataset.homeTab;all('[data-home-panel]').forEach(p=>{p.hidden=p.dataset.homePanel!==v;});}));
all('[data-home-view]').forEach(button=>button.addEventListener('click',()=>{const v=button.dataset.homeView;all('[data-home-view-panel]').forEach(p=>{p.hidden=p.dataset.homeViewPanel!==v;});}));
all('[data-latest-scroll]').forEach(b=>b.addEventListener('click',()=>{const track=document.querySelector('[data-latest-track]');track?.scrollBy({left:Number(b.dataset.latestScroll)*-400,behavior:'smooth'});}));
const rows=all('[data-template-row],[data-plugin-row]');
if(rows.length){
 const form=document.querySelector('[data-template-filter]');
 let input=form?.querySelector('[data-template-search]');
 if(!input){input=document.createElement('input');input.type='search';input.className='he-search';input.placeholder='חיפוש בוטים בעמוד הזה';input.setAttribute('aria-label',input.placeholder);document.querySelector('main')?.prepend(input);}
 const selected=new Map();
 function apply(){
  const terms=input.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);let count=0;
  rows.forEach(row=>{const text=(row.textContent+' '+(row.dataset.templateText||'')).toLocaleLowerCase();const tags=new Set((row.dataset.templateTags||'').split(/\s+/));const facets=Array.from(selected.values()).every(set=>!set.size||Array.from(set).some(t=>tags.has(t)));row.hidden=!(facets&&terms.every(t=>text.includes(t)));if(!row.hidden)count++;});
  const counter=document.querySelector('[data-template-count]');if(counter)counter.textContent=count+' מתוך '+rows.length+' בוטים';
  all('[data-template-section]').forEach(section=>{const visible=all('[data-template-row]',section).filter(r=>!r.hidden).length;section.hidden=!visible;const n=section.querySelector('[data-template-section-count]');if(n)n.textContent=visible;});
  const empty=document.querySelector('[data-template-empty]');if(empty)empty.hidden=count>0;
 }
 const initial=new URLSearchParams(root.dataset.sourceQuery||location.search);if(initial.get('q'))input.value=initial.get('q');
 const initialTags=initial.getAll('tags').flatMap(v=>v.split(',')).filter(Boolean);
 for(const tag of initialTags){const b=all('[data-template-tag]').find(b=>b.dataset.templateTag===tag);const facet=b?.dataset.templateTagFacet||'all';const set=selected.get(facet)||new Set();set.add(tag);selected.set(facet,set);b?.setAttribute('aria-pressed','true');}
 if(initialTags.length||input.value)apply();
 input.addEventListener('input',apply);
 if(form){form.hidden=false;form.addEventListener('submit',e=>{e.preventDefault();apply();});
  all('[data-template-tag]',form).forEach(b=>b.addEventListener('click',()=>{const facet=b.dataset.templateTagFacet||'all';const set=selected.get(facet)||new Set();const tag=b.dataset.templateTag;if(set.has(tag))set.delete(tag);else set.add(tag);selected.set(facet,set);b.setAttribute('aria-pressed',String(set.has(tag)));apply();}));
  form.querySelector('[data-template-clear]')?.addEventListener('click',()=>{selected.clear();input.value='';all('[data-template-tag]',form).forEach(b=>b.setAttribute('aria-pressed','false'));apply();input.focus();});
 }
}
const searchData=document.getElementById('he-search-data');
if(searchData){
 const items=JSON.parse(searchData.textContent);const input=document.querySelector('[data-search-input]');const results=document.querySelector('[data-search-results]');const status=document.querySelector('[data-search-status]');const params=new URLSearchParams(location.search);
 all('[data-filter-bar] a[href]').forEach(a=>a.dataset.heFilter=new URL(a.href,location.href).search);
 const norm=s=>s.toLocaleLowerCase().replace(/[^a-z0-9א-ת]+/g,'-').replace(/^-|-$/g,'');
 if(input)input.value=params.get('q')||'';
 function render(){
  const q=(input?.value||'').trim();if(q)params.set('q',q);else params.delete('q');
  const terms=q.toLocaleLowerCase().split(/\s+/).filter(Boolean);const category=params.get('category');const integration=params.get('integration');const type=params.get('type');
  const found=items.filter(item=>terms.every(t=>(item.title+' '+item.description+' '+item.english).toLocaleLowerCase().includes(t))&&(!category||item.categories.some(c=>norm(c)===norm(category)))&&(!integration||item.integrations.some(c=>norm(c)===norm(integration)))&&(!type||item.type===type));
  results.replaceChildren();found.slice(0,150).forEach(item=>{const card=document.createElement('article');card.className='he-search-result';const heading=document.createElement('h2');const a=document.createElement('a');a.href=item.url;a.textContent=item.title;heading.append(a);card.append(heading);if(item.description){const p=document.createElement('p');p.textContent=item.description;card.append(p);}results.append(card);});
  status.classList.remove('hidden');status.hidden=false;status.textContent='נמצאו '+found.length+' עמודים'+(found.length>150?' — מוצגות 150 התוצאות הראשונות':'');
  all('[data-filter-bar] a[href]').forEach(a=>{const target=new URLSearchParams(a.dataset.heFilter);const next=target.size?new URLSearchParams(params):new URLSearchParams();target.forEach((v,k)=>next.set(k,v));a.setAttribute('href','index.html'+(next.size?'?'+next.toString():''));});
  try{history.replaceState(null,'','index.html'+(params.size?'?'+params.toString():''));}catch{}
 }
 input?.addEventListener('input',render);all('[data-search-form]').forEach(form=>form.addEventListener('submit',e=>{e.preventDefault();render();}));render();
}
all('[data-yt-embed]').forEach(figure=>{const src=figure.dataset.ytSrc;if(!src?.startsWith('https://www.youtube-nocookie.com/embed/'))return;const mount=figure.querySelector('[data-yt-mount]');if(!mount)return;const b=document.createElement('button');b.type='button';b.className='he-video-play';b.textContent='הפעלת הסרטון כאן · YouTube';b.addEventListener('click',()=>{const frame=document.createElement('iframe');frame.src=src;frame.title=figure.dataset.ytTitle||'סרטון YouTube';frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.style.cssText='width:100%;aspect-ratio:16/9;border:0';mount.replaceChildren(frame);figure.dataset.ytState='loaded';});mount.append(b);});
all('[data-connect-dismiss]').forEach(b=>b.addEventListener('click',()=>b.closest('[data-connect-nudge]')?.remove()));
all('[data-install-close]').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.install-modal:target')?.removeAttribute('data-open');}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){all('details[open]').forEach(d=>d.open=false);if(document.querySelector('.install-modal:target'))location.hash='main';}});
})();
