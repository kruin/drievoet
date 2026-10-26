'use strict';
window.ArkAlgemeen=(()=>{
 const data=window.ARK_ALGEMENE_TEKSTEN,base=Object.fromEntries(Object.entries(data.teksten).map(([k,v])=>[k,v.tekst]));
 const key=(location.pathname.includes('/testark/')?'ark-test-':'ark-')+'algemene-teksten-v1',approvalKey=key+'-ok';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const equal=(a,b)=>Object.keys(base).every(k=>a?.[k]===b?.[k]);
 function stored(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}}
 let draft=stored(key)||{};
 function text(k){return typeof draft[k]==='string'?draft[k]:base[k]||'';}
 function status(){const current=Object.fromEntries(Object.keys(base).map(k=>[k,text(k)]));if(data.goedkeuring&&equal(current,base))return '✓ Algemene teksten OK · database';const p=stored(approvalKey);return p&&equal(p.na,current)&&equal(p.voor,base)?'☑ Algemene teksten OK · wacht op database':'☐ Algemene teksten nog beoordelen';}
 function attach(app,render){
  if(!['kruin','woorden'].includes(window.ARK_PAGE))return;
  const box=document.createElement('section');box.className='algemene-tekst-status';box.innerHTML=`<p>${esc(status())}</p><button type="button" data-general-texts>Algemene teksten · eenmalig</button>`;app.querySelector('h1')?.after(box);box.querySelector('button').onclick=()=>open(render);
 }
 function open(render){
  const d=document.createElement('dialog');d.className='sfh-editor tekst-editor';d.setAttribute('aria-labelledby','algemeen-title');let previewed=false;
  d.innerHTML=`<form><div class="sfh-editor-head"><h2 id="algemeen-title">Algemene teksten · eenmalig</h2><button type="button" data-close>Sluiten</button></div><p>Deze teksten zijn gedeeld door de hele site. Eén goedkeuring geldt overal; je hoeft ze niet in iedere hut opnieuw goed te keuren. Hutteksten en hun OK blijven afzonderlijk.</p>${Object.entries(data.teksten).map(([k,v])=>`<fieldset><legend>${esc(v.label)}</legend><strong>Databasebasis</strong><p>${esc(base[k])}</p><label><input type="checkbox" data-general-select="${k}" checked> Meenemen</label><label for="general-${k}">Testtekst</label><textarea id="general-${k}" data-general-field="${k}" rows="3">${esc(text(k))}</textarea></fieldset>`).join('')}<div class="sfh-editor-footer"><button type="button" id="general-save">Bewaar concept</button><button type="button" id="general-preview">Bekijk preview</button></div><section id="general-preview-content" hidden></section><label>Beoordeling<textarea id="general-reason" rows="2"></textarea></label><label><input type="checkbox" id="general-approved"> Ik heb de algemene teksten eenmalig beoordeeld en keur deze selectie goed als Kruin.</label><p id="general-message" role="status"></p><button type="submit">OK · klaar voor database</button><button type="button" id="general-transfer">Overzetten naar database</button></form>`;
  document.body.append(d);
  const values=()=>Object.fromEntries([...d.querySelectorAll('[data-general-field]')].map(el=>[el.dataset.generalField,el.value]));
  const selected=()=>{const result={...base},v=values();d.querySelectorAll('[data-general-select]:checked').forEach(el=>result[el.dataset.generalSelect]=v[el.dataset.generalSelect]);return result;};
  const message=s=>d.querySelector('#general-message').textContent=s;
  const invalidate=()=>{previewed=false;d.querySelector('#general-approved').checked=false;d.querySelector('#general-preview-content').hidden=true;};
  d.querySelectorAll('textarea[data-general-field],input[data-general-select]').forEach(el=>el.addEventListener(el.type==='checkbox'?'change':'input',invalidate));
  d.querySelector('#general-save').onclick=()=>{draft=values();localStorage.setItem(key,JSON.stringify(draft));message('Algemeen concept bewaard op dit apparaat. Nog geen databasewijziging.');};
  d.querySelector('#general-preview').onclick=()=>{const p=selected(),box=d.querySelector('#general-preview-content');box.innerHTML='<h3>Preview · algemene teksten</h3>'+Object.entries(p).map(([k,v])=>`<h4>${esc(data.teksten[k].label)}</h4><p style="white-space:pre-wrap">${esc(v)}</p>`).join('');box.hidden=false;previewed=true;};
  const review=()=>{if(!previewed||!d.querySelector('#general-approved').checked)throw Error('Bekijk eerst de preview en geef expliciet OK.');const reason=d.querySelector('#general-reason').value.trim();if(!reason)throw Error('Vul je beoordeling in.');const after=selected(),old=stored(approvalKey);if(old&&equal(old.voor,base)&&equal(old.na,after)&&old.reden===reason)return old;return {format:'ark-algemene-tekstgoedkeuring',versie:1,id:'algemeen-'+crypto.randomUUID(),goedgekeurd_door:'Kruin',goedgekeurd_op:new Date().toISOString(),reden:reason,vorige_correctie:data.goedkeuring?.correctie_id||null,voor:{...base},na:after};};
  function save(){const p=review();localStorage.setItem(approvalKey,JSON.stringify(p));draft=values();localStorage.setItem(key,JSON.stringify(draft));return p;}
  d.querySelector('form').onsubmit=e=>{e.preventDefault();try{save();message('Algemene teksten eenmalig OK; klaar voor private databaseverwerking.');}catch(e){message(e.message)}};
  d.querySelector('#general-transfer').onclick=()=>{try{const p=save(),url=URL.createObjectURL(new Blob([JSON.stringify(p,null,2)+'\n'],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=p.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);message('Upload deze goedgekeurde selectie privé voor databaseverwerking.');let link=d.querySelector('[data-upload]');if(!link){link=document.createElement('a');link.dataset.upload='';link.href='https://github.com/kruin/Drievoet-Beheer/upload/main/overdrachten/teksten';link.target='_blank';link.rel='noopener';link.textContent='Open private tekstupload';d.querySelector('#general-message').after(link)}}catch(e){message(e.message)}};
  d.querySelector('[data-close]').onclick=()=>d.close();d.addEventListener('close',()=>{d.remove();render()},{once:true});d.showModal();
 }
 return {text,attach,status};
})();
