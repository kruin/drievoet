let items=[],current=null,currentSelection=null;const E=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));function C(a,w,l,s,k){return `<g class="${k}"><circle cx="${k=="L"?245:375}" cy="190" r="125" fill="${k=="L"?"#7aa7ff":"#ff9b91"}" fill-opacity=".2" stroke="${k=="L"?"#496fc0":"#bf625b"}" stroke-width="3"/><text class="word" x="${w}" y="92">${E(a.woord).toUpperCase()}</text><g class="phase p2"><text class="lab" x="${l}" y="150">K</text><text class="seg" x="${s}" y="150">${E(a.K)}</text><text class="lab" x="${l}" y="185">R</text><text class="seg" x="${s}" y="185">${E(a.R)}</text><text class="lab" x="${l}" y="220">S</text><text class="seg" x="${s}" y="220">${E(a.S)}</text></g></g>`}function safeURL(value){try{const u=new URL(value);return ["http:","https:"].includes(u.protocol)&&!u.username&&!u.password?u.href:"";}catch{return "";}}
function link(text,url){const href=safeURL(url);return href?`<a class="source-link" href="${E(href)}" target="_blank" rel="noopener noreferrer">${E(text)}</a>`:E(text);}
function samePlace(x){
 function canonical(value){const safe=safeURL(value);if(!safe)return "";const u=new URL(safe);u.hash="";u.searchParams.sort();return u.href;}
 const a=canonical(x.bron1_url),b=canonical(x.bron2_url);
 if(a||b)return Boolean(a&&b&&a===b);
 const clean=v=>String(v||"").trim().replace(/\s+/g," ").toLowerCase();
 const name=clean(x.bron1);return Boolean(name&&!["--","?"].includes(name)&&name===clean(x.bron2));
}
function hasFinding(value){return Boolean(value&&!["--","?"].includes(value.trim()));}
function render(x){
 pair.textContent=`${x.w1} ↔ ${x.w2}`;
 document.getElementById("corpus-count").textContent=`${currentSelection?.name||"Selectie"} · ${items.length} ${items.length===1?"woordpaar":"woordparen"}`;
 document.getElementById("corpus-zinv").textContent=x.zinv||"Betekenisnotitie niet ingevuld.";
 document.getElementById("corpus-findings").innerHTML=[1,2].map(i=>{
  const text=x["vondst"+i],source=x["bron"+i],url=x["bron"+i+"_url"];
  if(!text||["--","?"].includes(text.trim()))return "";
  return `<article class="finding"><div>${i===2&&hasFinding(x.vondst1)&&samePlace(x)?"<strong>Ook daar:</strong> ":""}${link(text,x["vondst"+i+"_url"])}</div>${source||url?`<div class="source">Bron: ${link(source||"Vindplaats",url)}</div>`:""}</article>`;
 }).join("")||'<p>Vondsten nog niet ingevuld.</p>';
 stage.innerHTML=`<svg viewBox="0 0 620 390" aria-label="Semantisch, Formantisch en Historisch van ${E(x.w1)} en ${E(x.w2)}"><g class="phase-title t1"><text class="phase-heading" x="310" y="34">Semantisch</text></g><g class="phase-title t2"><text class="phase-heading" x="310" y="34">Formantisch</text></g><g class="phase-title t3"><text class="phase-heading" x="310" y="34">Historisch</text></g>${C(x.links,190,140,180,"L")}${C(x.rechts,430,390,430,"R")}<g class="phase p1"><ellipse cx="310" cy="190" rx="55" ry="100" fill="#8064c9" fill-opacity=".3"/><foreignObject x="252" y="152" width="116" height="110"><div xmlns="http://www.w3.org/1999/xhtml" class="overlap">${E(x.zinv||"Niet ingevuld")}</div></foreignObject></g><g class="phase p2"><text class="rel" x="310" y="270">${E(x.anker)}</text></g><g class="phase p3"><text class="rel" x="310" y="175">Vondsten en vindplaatsen</text><text class="rel" x="310" y="205">Zie de bronlinks hieronder</text></g></svg>`;
}
function pick(){if(!items.length)return;let p=items.length>1?items.filter(x=>x.id!==current?.id):items;current=p[Math.floor(Math.random()*p.length)];render(current)}
const appBase=new URL(".",document.currentScript.src);
const selectionControl=document.getElementById("selectie");
const selectionLink=document.getElementById("selectie-link");
const description=document.getElementById("selectie-beschrijving");
const pageSelection=document.querySelector("main").dataset.selectie||"";
function selectionURL(id){return new URL(`selecties/${id}/`,appBase).href;}
function prepareItems(rows){
 if(!Array.isArray(rows)||!rows.length)throw new Error("Deze selectie bevat geen woordparen.");
 return rows.map((row,id)=>{
  if(!row||typeof row.w1!=="string"||!row.w1.trim()||typeof row.w2!=="string"||!row.w2.trim())throw new Error("Een woordpaar mist w1 of w2.");
  function parts(value,woord){const p=String(value||"").split("-");return {woord,K:p[0]||"—",R:p[1]||"—",S:p.slice(2).join("-")||"—"};}
  const links=parts(row.krs1,row.w1),rechts=parts(row.krs2,row.w2);
  const common=["K","R","S"].filter(k=>links[k]!=="—"&&links[k].toLowerCase()===rechts[k].toLowerCase());
  return {...row,id,links,rechts,anker:common.length?common.join("/")+"-ANKER":"KRS"};
 });
}
async function readJSON(url){const r=await fetch(url);if(!r.ok)throw new Error("Selectiegegevens zijn niet bereikbaar.");return r.json();}
async function initialize(){
 random.disabled=true;
 const manifest=await readJSON(new URL("data/selecties.json",appBase));
 const selections=manifest.selections;
 if(!Array.isArray(selections)||!selections.length)throw new Error("Er zijn geen selecties gepubliceerd.");
 const seen=new Set();
 for(const s of selections){
  if(!s||typeof s.id!=="string"||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s.id)||seen.has(s.id)||typeof s.name!=="string"||!s.name.trim()||s.file!==`data/selecties/${s.id}.json`)throw new Error("De selectielijst is ongeldig.");
  seen.add(s.id);
 }
 const requested=pageSelection||manifest.default;
 currentSelection=selections.find(s=>s.id===requested);
 if(!currentSelection)throw new Error("Deze selectie is niet meer gepubliceerd. Kies een andere selectie.");
 selectionControl.innerHTML=selections.map(s=>`<option value="${E(s.id)}">${E(s.name)}</option>`).join("");
 selectionControl.value=requested;
 selectionControl.disabled=false;
 selectionControl.onchange=()=>{window.location.href=selectionURL(selectionControl.value);};
 selectionLink.href=selectionURL(requested);
 description.textContent=currentSelection.description||"";
 const corpus=await readJSON(new URL(currentSelection.file,appBase));
 items=prepareItems(corpus.items);
 current=null;pick();random.disabled=false;
}
initialize().catch(error=>{
 pair.textContent=error.message||"Selectiegegevens konden niet worden geladen.";
 document.getElementById("corpus-count").textContent="Selectie niet geladen";
 random.disabled=true;
});
random.onclick=()=>{if(items.length)pick();};
