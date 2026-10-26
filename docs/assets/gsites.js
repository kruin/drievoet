'use strict';
(()=>{
 const pages=window.ARK_GSITES.pages,main=document.getElementById('tour'),menu=document.getElementById('tour-menu');
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safe=url=>{try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
 const external=(url,label,cls='')=>safe(url)?`<a class="${cls}" href="${esc(safe(url))}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`:esc(label);
 function picture(item){
  const src='../'+item.path,areas=item.areas||[];
  let visual=`<img src="${esc(src)}" alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy">`;
  if(areas.length){visual=`<svg class="linked-cloud" viewBox="0 0 ${item.width} ${item.height}" role="group" aria-label="${esc(item.alt)} · aanklikbare bronlinks"><image href="${esc(src)}" width="${item.width}" height="${item.height}"/>${areas.map(a=>{const n=a.coords.split(',').map(Number);if(!safe(a.href)||n.some(x=>!Number.isFinite(x)))return '';let shape='';if(a.shape==='poly'&&n.length>=6&&n.length%2===0)shape=`<polygon points="${n.reduce((v,x,i)=>v+(i%2?' ':',')+x,'').slice(1)}"/>`;else if(a.shape==='rect'&&n.length===4)shape=`<rect x="${n[0]}" y="${n[1]}" width="${n[2]-n[0]}" height="${n[3]-n[1]}"/>`;else if(a.shape==='circle'&&n.length===3)shape=`<circle cx="${n[0]}" cy="${n[1]}" r="${n[2]}"/>`;return `<a href="${esc(safe(a.href))}" target="_blank" rel="noopener noreferrer" aria-label="${esc(a.label)}"><title>${esc(a.label)}</title>${shape}</a>`;}).join('')}</svg>`;}
  else if(safe(item.href))visual=`<a href="${esc(safe(item.href))}" target="_blank" rel="noopener noreferrer">${visual}</a>`;
  return `<figure class="source-picture">${visual}<figcaption>${external(item.source_page,'Oorspronkelijke pagina')} · <a href="${esc(src)}" target="_blank">Open afbeelding op ware grootte</a></figcaption>${areas.length?`<div class="cloud-links" aria-label="Dezelfde bronlinks als op de afbeelding">${areas.map(a=>external(a.href,a.label,'button')).join('')}</div>`:''}</figure>`;
 }
 function render(){
  let id;try{id=decodeURIComponent(location.hash.slice(1))}catch{id='ark'}
  const page=pages.find(p=>p.id===id)||pages[0],index=pages.indexOf(page);
  menu.innerHTML=pages.map(p=>`<a class="button" href="#${p.id}" ${p===page?'aria-current="page"':''}>${esc(p.title)}</a>`).join('');
  main.innerHTML=`<p class="eyebrow">Rondleiding · ${index+1} van ${pages.length}</p><h1>${esc(page.title)}</h1><p class="lead">${esc(page.intro)}</p>${page.body.map(p=>`<p class="tour-copy">${esc(p)}</p>`).join('')}${page.id==='dekken'?'<p><a class="button primary" href="../index.html#dekken">Bekijk de dekken en hutten</a></p>':''}${page.id==='velden'?'<p><a class="button primary" href="../meerlingen/index.html">Onderzoek de meerlingen</a></p>':''}<div class="source-gallery">${page.images.map(picture).join('')}</div>${page.id!=='velden'?`<details class="source-links"><summary>Verder lezen · ${page.links.length} oorspronkelijke links</summary><ul>${page.links.map(l=>`<li>${external(l.url,l.text)}</li>`).join('')}</ul>${page.original_images.length?`<p>Ook beschikbaar op de oorspronkelijke pagina:</p><ul>${page.original_images.map((url,i)=>`<li>${external(url,'Oorspronkelijke afbeelding '+(i+1))}</li>`).join('')}</ul>`:''}</details><p class="caption">Bron: ${external(page.url,page.title)}</p>`:''}<nav class="tour-next" aria-label="Volg het verhaal">${index?`<a class="button" href="#${pages[index-1].id}">← ${esc(pages[index-1].title)}</a>`:''}${index+1<pages.length?`<a class="button primary" href="#${pages[index+1].id}">${esc(pages[index+1].title)} →</a>`:'<a class="button" href="../index.html">Naar de ark</a>'}</nav>`;
  window.scrollTo(0,0);
 }
 window.addEventListener('hashchange',render);render();
})();
