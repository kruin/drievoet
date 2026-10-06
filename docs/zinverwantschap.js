let items=[],current=null;const E=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));function C(a,w,l,s,k){return `<g class="${k}"><circle cx="${k=="L"?245:375}" cy="190" r="125" fill="${k=="L"?"#7aa7ff":"#ff9b91"}" fill-opacity=".2" stroke="${k=="L"?"#496fc0":"#bf625b"}" stroke-width="3"/><text class="word" x="${w}" y="92">${E(a.woord).toUpperCase()}</text><g class="phase p1"><text class="lab" x="${l}" y="150">K</text><text class="seg" x="${s}" y="150">${E(a.K)}</text><text class="lab" x="${l}" y="185">R</text><text class="seg" x="${s}" y="185">${E(a.R)}</text><text class="lab" x="${l}" y="220">S</text><text class="seg" x="${s}" y="220">${E(a.S)}</text></g></g>`}function safeURL(value){try{const u=new URL(value);return ["http:","https:"].includes(u.protocol)&&!u.username&&!u.password?u.href:"";}catch{return "";}}
function link(text,url){const href=safeURL(url);return href?`<a class="source-link" href="${E(href)}" target="_blank" rel="noopener noreferrer">${E(text)}</a>`:E(text);}
function render(x){
 pair.textContent=`${x.w1} ↔ ${x.w2}`;
 document.getElementById("corpus-count").textContent=`Corpus · testronde 0.1 · ${items.length} woordparen`;
 document.getElementById("corpus-zinv").textContent=x.zinv||"Betekenisnotitie niet ingevuld.";
 document.getElementById("corpus-findings").innerHTML=[1,2].map(i=>{
  const text=x["vondst"+i],source=x["bron"+i],url=x["bron"+i+"_url"];
  if(!text||["--","?"].includes(text.trim()))return "";
  return `<article class="finding"><div>${i===2?"<strong>Daar ook:</strong> ":""}${link(text,x["vondst"+i+"_url"])}</div>${source||url?`<div class="source">Bron: ${link(source||"Vindplaats",url)}</div>`:""}</article>`;
 }).join("")||'<p>Vondsten nog niet ingevuld.</p>';
 stage.innerHTML=`<svg viewBox="0 0 620 390" aria-label="KRS van ${E(x.w1)} en ${E(x.w2)}">${C(x.links,190,140,180,"L")}${C(x.rechts,430,390,430,"R")}<g class="phase p1"><text class="rel" x="310" y="270">FORMANTISCH · ${E(x.anker)}</text></g><g class="phase p2"><ellipse cx="310" cy="190" rx="55" ry="100" fill="#8064c9" fill-opacity=".3"/><text class="rel" x="310" y="165">SEMANTISCH</text><foreignObject x="252" y="178" width="116" height="92"><div xmlns="http://www.w3.org/1999/xhtml" class="overlap">${E(x.zinv||"Niet ingevuld")}</div></foreignObject></g><g class="phase p3"><text class="rel" x="310" y="175">BRONNEN</text><text class="rel" x="310" y="205">Zie de vondsten hieronder</text></g></svg>`;
}
function pick(){let p=items.length>1?items.filter(x=>x.id!==current?.id):items;current=p[Math.floor(Math.random()*p.length)];render(current)}fetch("data/corpus-test-0.1.json?v=corpus22-root").then(r=>{if(!r.ok)throw new Error("Gegevens niet bereikbaar");return r.json();}).then(corpus=>{
 items=corpus.items.map((row,id)=>{
  function parts(value,woord){const p=(value||"").split("-");return {woord,K:p[0]||"—",R:p[1]||"—",S:p.slice(2).join("-")||"—"};}
  const links=parts(row.krs1,row.w1),rechts=parts(row.krs2,row.w2);
  const common=["K","R","S"].filter(k=>links[k]!=="—"&&links[k].toLowerCase()===rechts[k].toLowerCase());
  return {...row,id,links,rechts,anker:common.length?common.join("/")+"-ANKER":"KRS"};
 });
 if(!items.length)throw new Error("Geen testrecords");pick();
}).catch(()=>{pair.textContent="Corpusgegevens konden niet worden geladen.";random.disabled=true;});
random.onclick=()=>{if(items.length)pick();};
