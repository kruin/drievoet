'use strict';
window.ArkTekst=(()=>{
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fields=[['krs','F · KRS'],['formantisch_toelichting','F · Toelichting'],['semantisch','S · Gedeelde lezing'],['semantisch_toelichting','S · Toelichting'],['historisch_toelichting','H · Onderbouwing'],['bronnen','H · Bronnen']];
 const key=id=>(location.pathname.includes('/testark/')?'ark-test-tekst-ok:':'ark-tekst-ok:')+id;
 const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),clone=x=>JSON.parse(JSON.stringify(x));
 const stored=x=>{try{return JSON.parse(localStorage.getItem(key(x.nummer))||'null')}catch{return null}};
 const source=x=>window.ArkSfh.source(x);
 function status(x){
  const local=stored(x),current=window.ArkSfh.patch(x),baseline=source(x);
  if(window.ARK_TEKST_OK?.[x.nummer]&&equal(current,baseline))return 'database';
  if(local&&equal(local.correctie?.voorstel,current)&&equal(local.voor,baseline))return 'klaar';
  return 'open';
 }
 function badge(x){const s=status(x);return `<span class="tekst-ok" data-tekst-status="${s}" title="Tekstgoedkeuring staat los van de bronwaardering OK 6–10">${s==='database'?'✓ Hutteksten OK · database':s==='klaar'?'☑ Hutteksten OK · wacht op database':'☐ Hutteksten nog beoordelen'}</span>`;}
 function format(value){return Array.isArray(value)?value.map(v=>typeof v==='string'?v:v.tekst+' | '+v.url).join('\n'):value;}
 function open(x,opts){
  const resume=opts.pause(),before=source(x),draft=window.ArkSfh.patch(x),dialog=document.createElement('dialog');dialog.className='sfh-editor tekst-editor';
  dialog.setAttribute('aria-labelledby','tekst-title');let previewed=false;
  const selected=()=>{const result=clone(before);for(const input of dialog.querySelectorAll('[data-tekst-field]:checked'))result[input.dataset.tekstField]=clone(draft[input.dataset.tekstField]);return result;};
  dialog.innerHTML=`<form><div class="sfh-editor-head"><h2 id="tekst-title">Hutteksten beoordelen</h2><button type="button" data-close>Sluiten</button></div><p>${esc(x.woorden.join(' / '))}</p><p>Dit OK geldt alleen voor de specifieke teksten en bronnen van deze hut. Algemene uitleg wordt één keer beoordeeld via Kruin → Algemene teksten.</p><p>Vergelijk de huidige databasetekst met je testtekst. Kies wat je wilt meenemen en bekijk de preview. Na jouw OK kan deze selectie naar de private database; productie publiceren blijft een afzonderlijke stap.</p><p>De huidige productieversie is hier niet als tekstbron beschikbaar. Deze vergelijking gebruikt de databasebasis van deze testversie.</p><div class="tekst-comparison">${fields.map(([field,label])=>{const changed=!equal(before[field],draft[field]);return `<fieldset><legend><label><input type="checkbox" data-tekst-field="${field}" ${changed?'checked':''}> ${label} · ${changed?'gewijzigd':'gelijk'}</label></legend><div class="tekst-columns"><div><strong>Databasebasis</strong><pre>${esc(format(before[field]))||'Niet ingevuld'}</pre></div><div><strong>Testtekst</strong><pre>${esc(format(draft[field]))||'Niet ingevuld'}</pre></div></div></fieldset>`}).join('')}</div><button type="button" id="tekst-preview">Bekijk preview</button><section id="tekst-preview-content" hidden aria-label="Preview geselecteerde teksten"></section><fieldset><legend>OK voor database</legend><label for="tekst-reason">Reden / beoordeling</label><textarea id="tekst-reason" rows="2"></textarea><p>Kies de bronvermelding(en) waarop je goedkeuring geldt.</p>${x.bronrecord_ids.map(id=>`<label><input type="checkbox" data-tekst-record="${id}" ${x.bronrecord_ids.length===1?'checked':''}> Werkrecord ${id}</label>`).join('')}<label><input type="checkbox" id="tekst-approved"> Ik heb de preview beoordeeld en keur deze teksten goed als Kruin.</label></fieldset><p id="tekst-message" role="status" aria-live="polite"></p><div class="sfh-editor-footer"><button type="submit">OK · klaar voor database</button><button type="button" id="tekst-transfer">Overzetten naar database</button></div><p>Een vinkje met ‘wacht op database’ is lokaal. ‘Tekst OK · database’ verschijnt na gecontroleerde verwerking en verversen van de testbasis.</p></form>`;
  document.body.append(dialog);
  const message=s=>dialog.querySelector('#tekst-message').textContent=s;
  const invalidate=()=>{previewed=false;dialog.querySelector('#tekst-approved').checked=false;dialog.querySelector('#tekst-preview-content').hidden=true;};
  dialog.querySelectorAll('[data-tekst-field]').forEach(el=>el.onchange=invalidate);
  dialog.querySelector('#tekst-preview').onclick=()=>{const p=selected(),box=dialog.querySelector('#tekst-preview-content');box.innerHTML=`<h3>Preview · ${esc(p.woorden.join(' / '))}</h3>${opts.preview?opts.preview(p):''}${fields.map(([f,label])=>`<h4>${label}</h4><p style="white-space:pre-wrap">${esc(format(p[f]))||'Niet ingevuld'}</p>`).join('')}`;box.hidden=false;previewed=true;message('Controleer de geselecteerde tekst en geef daarna OK.');};
  const review=()=>{
   if(!previewed||!dialog.querySelector('#tekst-approved').checked)throw Error('Bekijk eerst de preview en geef expliciet OK.');
   const reason=dialog.querySelector('#tekst-reason').value.trim(),targets=[...dialog.querySelectorAll('[data-tekst-record]:checked')].map(el=>Number(el.dataset.tekstRecord));
   if(!reason||!targets.length)throw Error('Vul je beoordeling in en kies minstens één bronvermelding.');
   const p=selected(),old=stored(x);
   if(old&&equal(old.correctie.voorstel,p)&&equal(old.voor,before)&&old.correctie.reden===reason&&equal(old.correctie.werkrecords,targets))return old;
   const at=new Date().toISOString();return {format:'ark-tekstgoedkeuring',versie:1,voor:before,vorige_correctie:window.ARK_TEKST_OK?.[x.nummer]?.correctie_id||null,correctie:{id:'tekst-'+crypto.randomUUID(),status:'goedgekeurd',goedgekeurd_door:'Kruin',goedgekeurd_op:at,reden:reason,werkrecords:targets,voorstel:p}};
  };
  dialog.querySelector('form').onsubmit=e=>{e.preventDefault();try{const entry=review();localStorage.setItem(key(x.nummer),JSON.stringify(entry));message('Tekst OK is lokaal bewaard. Kies Overzetten naar database voor verwerking.');}catch(e){message(e.message)}};
  dialog.querySelector('#tekst-transfer').onclick=()=>{try{const entry=review();localStorage.setItem(key(x.nummer),JSON.stringify(entry));const url=URL.createObjectURL(new Blob([JSON.stringify(entry,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=entry.correctie.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);let link=dialog.querySelector('#tekst-upload');if(!link){link=document.createElement('a');link.id='tekst-upload';link.target='_blank';link.rel='noopener';link.href='https://github.com/kruin/Drievoet-Beheer/upload/main/overdrachten/teksten';link.textContent='Upload de goedgekeurde selectie privé';dialog.querySelector('#tekst-message').after(link);}message('Overdracht gedownload. Upload het bestand via de private link. Na groene verwerking staat de tekst in de database.');}catch(e){message(e.message)}};
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{resume();dialog.remove();opts.render('vorm')},{once:true});dialog.showModal();
 }
 return {badge,status,open};
})();
