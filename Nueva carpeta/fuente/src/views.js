
/* ===================== Navegación ===================== */
const ICON={
 diag:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21M7.5 10.5h1.6l1-2 1.8 4 1-2h1.6"/>',
 prog:'<path d="M2.5 12h2M19.5 12h2M6.5 8v8M17.5 8v8M4.5 9.5v5M19.5 9.5v5M6.5 12h11"/>',
 seg:'<path d="M3 20h18M4 16l5-5 4 3 7-8"/><circle cx="20" cy="6" r="1.2"/>',
 lib:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zM4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7h8M8 10.5h6"/>',
 panel:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 13h3M8 16h6"/><circle cx="17" cy="14.5" r="1.6"/>',
 guia:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.3 2.4c-.6.3-.9.8-.9 1.4v.6M12 17h.01"/>',
 aj:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
 more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'
};
const isPro=()=>S.settings.role==='pro';
function VIEWS(){return [
 {id:'diagnostico',n:'Diagnóstico',i:'diag',m:1},
 {id:'programa',n:'Programa',i:'prog',m:1},
 {id:'seguimiento',n:'Seguimiento',i:'seg',m:1},
 {id:'lesiones',n:'Biblioteca',i:'lib',m:1,also:['pruebas','ejercicios']},
 {id:'panel',n:isPro()?'Panel':'Profesional',i:'panel'},
 {id:'guia',n:'Guía',i:'guia'},
 {id:'ajustes',n:'Ajustes',i:'aj'}
]}
const ROUTES=['diagnostico','programa','seguimiento','lesiones','pruebas','ejercicios','panel','guia','ajustes'];
const curView=()=>{const h=location.hash.replace('#','');return ROUTES.includes(h)?h:'diagnostico'};
const svgI=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
function renderNav(){
  const v=curView();const V=VIEWS();
  const on=x=>x.id===v||(x.also||[]).includes(v);
  const desk=V.map(x=>`<button class="nv d" data-act="go" data-v="${x.id}" ${on(x)?'aria-current="page"':''}>${svgI(x.i)}<span>${x.n}</span>${x.id==='panel'&&panelBadge()?`<b class="dot">${panelBadge()}</b>`:''}</button>`).join('');
  const mob=V.filter(x=>x.m).map(x=>`<button class="nv m" data-act="go" data-v="${x.id}" ${on(x)?'aria-current="page"':''}>${svgI(x.i)}<span>${x.n}</span></button>`).join('')+
    `<button class="nv m" data-act="more" ${V.filter(x=>!x.m).some(on)?'aria-current="page"':''}>${svgI('more')}<span>Más</span>${panelBadge()?`<b class="dot">${panelBadge()}</b>`:''}</button>`;
  $('#nav').innerHTML=desk+mob;
  const sel=$('#case_sel');
  sel.innerHTML=(S.cases.length?S.cases.map(c=>`<option value="${c.id}" ${c.id===S.active?'selected':''}>${esc(c.name)}</option>`).join(''):'<option value="">Sin casos</option>')+'<option value="__new">+ Nuevo caso…</option>';
  const st=$('#cloud_chip');if(st){const m={local:['Este dispositivo','info'],sync:['Sincronizado','ok'],saving:['Guardando…','warn'],readonly:['Solo lectura en la nube','warn'],error:['Sin conexión a la nube','bad']}[CL.status]||['Este dispositivo','info'];st.className='cloud '+m[1];st.textContent=m[0];st.title=CL.status==='local'?'Los datos se guardan solo en este navegador':'Los datos se guardan en tu cuenta'}
}
function panelBadge(){if(!isPro())return CL.msgs.filter(m=>m.pro&&m.ts>(S.settings.msgSeen||0)).length||0;const red=S.cases.filter(c=>!c.example&&caseSummary(c).st==='rojo').length+CL.patients.filter(p=>p.id!==CL.uid&&(p.cases||[]).some(x=>x.st==='rojo')).length;return red||0}
let renderQueued=false;
function renderSoft(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;if(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&$('#main').contains(document.activeElement)){renderNav();return}render(true)})}
function render(keepFocus){
  const f=keepFocus&&document.activeElement&&document.activeElement.dataset?{...document.activeElement.dataset}:null;
  renderNav();
  const v=curView();const m=$('#main');
  const fn={diagnostico:vDiag,programa:vProg,seguimiento:vTrack,lesiones:vLib,pruebas:vTests,ejercicios:vExCat,panel:vPanel,guia:vGuide,ajustes:vSettings}[v];
  m.innerHTML=`<div class="wrap">${fn()}</div>`;
  if(f&&f.act){const sel=['act','k','z','id','p','i','l','v','t'].filter(k=>f[k]!=null).map(k=>`[data-${k}="${CSS.escape(f[k])}"]`).join('');const el=m.querySelector(sel);if(el)el.focus({preventScroll:true})}
  if(v==='pruebas'&&UI.testSel){const el=document.getElementById('t_'+UI.testSel);if(el)el.scrollIntoView({block:'center'})}
}
const pillSt=st=>({rojo:'<span class="pill bad">Atención</span>',ambar:'<span class="pill warn">Revisar</span>',verde:'<span class="pill ok">En curso</span>'})[st];

/* ===================== Diagnóstico ===================== */
const HS={front:{cabeza:[110,36],cuello:[110,62],hombro:[154,80],codo:[164,150],muneca:[164,228],lumbar:[110,158],cadera:[124,198],muslo:[125,252],rodilla:[125,302],pierna:[125,340],tobillo:[125,376],pie:[142,394]},
 back:{cabeza:[110,36],cuello:[110,62],hombro:[66,80],codo:[56,150],muneca:[56,228],lumbar:[110,162],cadera:[95,196],muslo:[95,255],rodilla:[95,300],pierna:[95,334],tobillo:[95,372],pie:[91,392]}};
const BACK_SX={muslo:'dolor_posterior',rodilla:'dolor_posterior',pierna:'dolor_posterior',tobillo:'dolor_posterior',pie:'dolor_talon',cadera:'dolor_posterior',lumbar:'dolor_lumbar',cuello:'dolor_cuello'};
function bodySvg(){
  const z=S.diag.zone,vw=S.diag.view||'front';
  const fig=`<circle cx="110" cy="36" r="22"/><rect x="101" y="56" width="18" height="10" rx="4"/><rect x="76" y="64" width="68" height="118" rx="20"/>
<rect x="52" y="70" width="20" height="82" rx="10"/><rect x="148" y="70" width="20" height="82" rx="10"/><rect x="47" y="148" width="18" height="72" rx="9"/><rect x="155" y="148" width="18" height="72" rx="9"/>
<circle cx="56" cy="230" r="10"/><circle cx="164" cy="230" r="10"/><rect x="80" y="176" width="60" height="40" rx="14"/>
<rect x="82" y="208" width="26" height="96" rx="12"/><rect x="112" y="208" width="26" height="96" rx="12"/><rect x="84" y="300" width="22" height="80" rx="10"/><rect x="114" y="300" width="22" height="80" rx="10"/>
<ellipse cx="91" cy="392" rx="16" ry="8"/><ellipse cx="129" cy="392" rx="16" ry="8"/>`;
  const marks=vw==='back'?'<path class="mk" d="M110 70v100M96 200q14 8 28 0"/>':'<path class="mk" d="M103 32h2M115 32h2M105 44q5 4 10 0"/>';
  return `<svg class="body-map" viewBox="0 0 220 410" role="group" aria-label="Mapa del cuerpo, vista ${vw==='back'?'posterior':'anterior'}"><g class="fig">${fig}</g>${marks}
${ZONES.map(x=>{const p=HS[vw][x.id];return `<circle class="hs ${z===x.id?'on':''}" data-act="zone" data-z="${x.id}" data-back="${vw==='back'?1:''}" cx="${p[0]}" cy="${p[1]}" r="8.5" tabindex="0" role="button" aria-label="${x.n}"><title>${x.n}</title></circle>`}).join('')}</svg>`;
}
function welcomeCard(){
  if(S.settings.onboarded)return '';
  const r=S.settings.role;
  return `<section class="card welcome"><div class="card-h"><div><p class="eyebrow">Bienvenida</p><h2>Configura Kinetrack en un minuto</h2></div><button class="linkish small" data-act="go" data-v="guia">Ver la guía</button></div>
  <p class="muted">Kinetrack orienta el diagnóstico de lesiones deportivas, crea el programa de rehabilitación por fases y hace el seguimiento hasta la vuelta al deporte.</p>
  <div class="field">¿Quién la va a usar?<div class="seg" role="radiogroup"><button data-act="role" data-v="atleta" aria-pressed="${r==='atleta'}">Soy deportista</button><button data-act="role" data-v="pro" aria-pressed="${r==='pro'}">Soy profesional</button></div></div>
  <label class="chk"><input type="checkbox" id="ob_c1" ${S.settings._c1?'checked':''} data-on="ob"> Entiendo que los resultados son orientativos y no sustituyen la valoración de un profesional sanitario.</label>
  <label class="chk"><input type="checkbox" id="ob_c2" ${S.settings._c2?'checked':''} data-on="ob"> Acepto que mis datos de salud se guarden en este dispositivo y, si uso una cuenta, en la base de datos de esta app. <button class="linkish small" data-act="go" data-v="guia" data-t="legal">Privacidad</button></label>
  <div class="row"><button class="btn primary" data-act="onboard" ${r&&S.settings._c1&&S.settings._c2?'':'disabled'}>Empezar</button><span class="small muted">El caso de ejemplo se puede borrar cuando quieras.</span></div></section>`;
}
function vDiag(){
  const d=S.diag;const L=d.zone?zoneLists(d.zone):null;
  const chip=(act,k,label,on,cls='')=>`<button class="chip ${cls}" data-act="${act}" data-k="${k}" aria-pressed="${on}">${esc(label)}</button>`;
  return `${welcomeCard()}
<section class="view-head"><p class="eyebrow">Diagnóstico orientativo</p><h1>¿Dónde y cómo ocurrió?</h1>
<p class="lede">Marca la zona, el contexto, el mecanismo y los síntomas. Después registra las pruebas clínicas: la probabilidad se recalcula con su sensibilidad y especificidad.</p></section>
<div class="diag">
 <div class="diag-in">
  <div class="card"><div class="card-h"><span class="eyebrow">1 · Zona y lado</span>${d.zone?`<button class="linkish small" data-act="diag-reset">Empezar de nuevo</button>`:''}</div>
   <div class="row"><div class="seg" role="group" aria-label="Vista"><button data-act="view" data-v="front" aria-pressed="${d.view!=='back'}">Delante</button><button data-act="view" data-v="back" aria-pressed="${d.view==='back'}">Detrás</button></div>
   <div class="seg" role="group" aria-label="Lado">${['izq','der','ambos','centro'].map(s=>`<button data-act="side" data-v="${s}" aria-pressed="${d.side===s}">${SIDES[s]}</button>`).join('')}</div></div>
   <div class="zone-wrap">${bodySvg()}<div class="chips">${ZONES.map(z=>`<button class="chip" data-act="zone" data-z="${z.id}" aria-pressed="${d.zone===z.id}">${z.n}</button>`).join('')}</div></div>
   <p class="small muted">En la vista posterior, la zona marca también el dolor en la cara de atrás.</p></div>
  <div class="card"><span class="eyebrow">2 · Contexto</span>
   <div class="grid2">
    <label class="field">Deporte<select id="d_sport" data-on="dsel" data-k="sport"><option value="">Sin indicar</option>${Object.entries(SPORTS).map(([k,s])=>`<option value="${k}" ${d.sport===k?'selected':''}>${s.n}</option>`).join('')}</select></label>
    <label class="field">¿Cómo empezó?<select id="d_onset" data-on="dsel" data-k="onset"><option value="">Sin indicar</option><option value="aguda" ${d.onset==='aguda'?'selected':''}>De golpe, hace menos de 2 semanas</option><option value="subaguda" ${d.onset==='subaguda'?'selected':''}>Hace 2–6 semanas</option><option value="persistente" ${d.onset==='persistente'?'selected':''}>Poco a poco, más de 6 semanas</option></select></label>
    <label class="field">Edad<input id="d_age" type="number" min="5" max="90" inputmode="numeric" value="${esc(d.age)}" data-on="age" placeholder="años"></label>
    <label class="field">Dolor ahora (0–10)<input id="d_pain" type="number" min="0" max="10" inputmode="numeric" value="${esc(d.pain)}" data-on="dpain" placeholder="0–10"></label>
   </div>
   <label class="chk"><input type="checkbox" id="d_prev" data-on="dprev" ${d.prev?'checked':''}> Ya se lesionó antes en esta zona</label></div>
  <div class="card"><span class="eyebrow">3 · Mecanismo de lesión</span>
   ${L?`<div class="chips">${L.m.map(k=>chip('mech',k,MECH[k],d.mech.includes(k))).join('')}</div>`:`<p class="muted small">Elige primero una zona.</p>`}</div>
  <div class="card"><span class="eyebrow">4 · Síntomas y signos</span>
   ${L?`<div class="chips">${L.s.map(k=>chip('sx',k,SX[k],d.sx.includes(k))).join('')}</div>`:`<p class="muted small">Elige primero una zona.</p>`}</div>
  ${L?`<div class="card"><span class="eyebrow">5 · Signos de alarma</span><div class="chips">${L.r.map(f=>chip('rf',f.id,f.t,d.rf.includes(f.id),'red')).join('')}</div></div>`:''}
 </div>
 <div class="diag-out" id="diag_out">${diagOut()}</div>
</div>`;
}
function testToggle(tid){
  const r=(S.diag.tests||{})[tid]||'';const t=T_BY[tid];const acc=testAcc(t);
  return `<div class="tt"><span class="tt-n">${esc(t.n)}${acc.known?'':' <span class="small muted" title="Sin datos de precisión: efecto moderado">*</span>'}</span><span class="tri" role="group" aria-label="Resultado de ${esc(t.n)}">
   <button data-act="test-res" data-id="${tid}" data-v="+" aria-pressed="${r==='+'}" title="Positiva">+</button><button data-act="test-res" data-id="${tid}" data-v="-" aria-pressed="${r==='-'}" title="Negativa">−</button><button class="tinfo" data-act="open-test" data-id="${tid}" title="Cómo se hace">?</button></span></div>`;
}
function diagOut(){
  const d=S.diag;const al=alarms();
  const alHtml=al.map(a=>`<div class="note ${a.k}"><b>${esc(a.t)}</b><span class="small">${esc(a.m)}</span></div>`).join('');
  const manual=`<div class="card"><span class="eyebrow">Selección manual</span><p class="small muted">¿Ya tienes el diagnóstico de un profesional? Crea el programa directamente.</p>
   <div class="row"><label class="sr" for="man_inj">Lesión</label><select id="man_inj" class="sel">${injOptions(null)}</select><button class="btn" data-act="new-case-manual">Crear programa</button></div></div>`;
  if(!d.zone)return `${alHtml}<div class="empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><b>Selecciona una zona en el mapa</b><span class="small">Las lesiones compatibles aparecerán aquí ordenadas por probabilidad.</span></div>${manual}`;
  const R=diagnose();const any=d.mech.length||d.sx.length;
  const head=`<div class="card-h"><h2>Lesiones compatibles</h2><span class="pill acc">${esc(ZN[d.zone])} · ${esc(SIDES[d.side]||'')}</span></div>
   <p class="small muted">${!any?`Lesiones frecuentes en ${esc(ZN[d.zone].toLowerCase())}. Marca mecanismo y síntomas para afinar.`:R.tested?'Probabilidad actualizada con los resultados de las pruebas.':'Probabilidad orientativa sin pruebas. Registra las pruebas de cada lesión para afinarla.'}</p>`;
  const cards=R.list.length?R.list.map((r,i)=>{const pc=Math.round(r.p*100);return `<article class="res ${i===0&&any?'top1':''}">
   <div class="res-top"><div style="min-width:0"><h3>${esc(r.inj.n)}</h3>${r.hits.length?`<p class="hits">${r.hits.map(esc).join(' · ')}</p>`:''}</div><div class="pct" aria-label="${pc} por ciento">${pc}<span>%</span></div></div>
   <div class="bar"><i style="width:${pc}%"></i></div>
   <details ${i===0&&any?'open':''}><summary class="small">Pruebas para confirmar o descartar</summary><div class="tts">${r.inj.tests.map(testToggle).join('')}${r.inj.ddx.length?`<p class="small muted">Para descartar otras lesiones:</p>${r.inj.ddx.map(testToggle).join('')}`:''}</div></details>
   <div class="row"><button class="btn sm" data-act="open-lib" data-id="${r.inj.id}">Ver ficha</button><button class="btn sm primary" data-act="new-case" data-id="${r.inj.id}" data-p="${pc}">Crear programa</button></div>
  </article>`}).join('')+`<p class="small muted">Otra causa no incluida: ${Math.round(R.other*100)} %</p>`:`<div class="empty"><b>Sin coincidencias claras</b><span class="small">Revisa los síntomas marcados o consulta a un profesional.</span></div>`;
  return `${alHtml}${head}${cards}
  <p class="disclaimer">Resultado orientativo. Las pruebas marcadas con * no tienen datos de precisión publicados y cuentan poco. No sustituye la exploración presencial.</p>${manual}`;
}
function injOptions(sel){return ZONES.map(z=>{const l=INJ.filter(i=>i.z[0]===z.id);return l.length?`<optgroup label="${z.n}">${l.map(i=>`<option value="${i.id}" ${i.id===sel?'selected':''}>${esc(i.n)}</option>`).join('')}</optgroup>`:''}).join('')}

/* ===================== Biblioteca ===================== */
function libTabs(){const v=curView();return `<div class="seg" role="group" aria-label="Biblioteca"><button data-act="go" data-v="lesiones" aria-pressed="${v==='lesiones'}">Lesiones</button><button data-act="go" data-v="pruebas" aria-pressed="${v==='pruebas'}">Pruebas</button><button data-act="go" data-v="ejercicios" aria-pressed="${v==='ejercicios'}">Ejercicios y vídeos</button></div>`}
function revPill(i){return i.rev&&i.rev.ok?`<span class="pill ok">Revisado por ${esc(i.rev.by||'profesional')}${i.rev.date?' · '+fmtShort(i.rev.date):''}</span>`:`<span class="pill warn">Revisión clínica pendiente</span>`}
function vLib(){
  if(UI.libSel&&INJ_BY[UI.libSel])return libDetail(INJ_BY[UI.libSel]);
  return `<section class="view-head"><p class="eyebrow">Biblioteca clínica</p><h1>Lesiones deportivas</h1><p class="lede">${INJ.length} lesiones con mecanismo, pruebas, grados, plazos, tratamiento por fases, criterios de retorno y referencias.</p></section>
${libTabs()}
<div class="row"><label class="field grow"><span class="sr">Buscar</span><input id="lib_q" data-on="lib-q" placeholder="Buscar lesión…" value="${esc(UI.libQ)}"></label></div>
<div class="chips">${[{id:'all',n:'Todas'},...ZONES].map(z=>`<button class="chip" data-act="lib-zone" data-z="${z.id}" aria-pressed="${UI.libZone===z.id}">${z.n}</button>`).join('')}</div>
<div id="lib_list" class="lib-list">${libList()}</div>`;
}
function libList(){
  const q=UI.libQ.trim().toLowerCase();
  const out=ZONES.filter(z=>UI.libZone==='all'||UI.libZone===z.id).map(z=>{
    const l=INJ.filter(i=>i.z.includes(z.id)&&(UI.libZone!=='all'||i.z[0]===z.id)&&(!q||i.n.toLowerCase().includes(q)||i.d.toLowerCase().includes(q)));
    if(!l.length)return '';
    return `<div class="lib-group"><h3>${z.n}</h3><div class="lib-items">${l.map(i=>{const g=i.g.map(x=>cum(x.w)[4]);return `<button class="lib-item" data-act="open-lib" data-id="${i.id}"><b>${esc(i.n)}</b><span class="small muted">${i.g.length>1?`${fmtW(Math.min(...g))} a ${fmtW(Math.max(...g))}`:fmtW(g[0])} hasta el retorno</span>${i.rev&&i.rev.ok?'<span class="small ok-t">Revisada</span>':''}</button>`}).join('')}</div></div>`;
  }).join('');
  return out||`<div class="empty">No hay lesiones que coincidan con la búsqueda.</div>`;
}
function libDetail(i){
  const sports=Object.values(SPORTS).filter(s=>s.p[i.id]).map(s=>s.n);
  return `<div class="detail">
 <div><button class="linkish" data-act="lib-back">← Todas las lesiones</button></div>
 <section class="view-head"><p class="eyebrow">${i.z.map(z=>ZN[z]).join(' · ')} · ${i.kind==='a'?'Lesión aguda':i.kind==='o'?'Lesión por sobrecarga':'Aguda o por sobrecarga'}</p><h1>${esc(i.n)}</h1><p class="lede">${esc(i.d)}</p>
 <div class="row">${revPill(i)}${sports.length?`<span class="small muted">Frecuente en: ${esc(sports.join(', '))}</span>`:''}</div>
 <div class="row" style="margin-top:6px"><button class="btn primary" data-act="new-case" data-id="${i.id}">Crear programa con esta lesión</button></div></section>
 <div class="detail-grid">
  <div class="stack">
   <div class="card"><span class="eyebrow">Grados o tratamientos y plazo estimado</span><div class="grades">${i.g.map(g=>`<div class="grade"><b>${esc(g.n)}</b><span class="w">${fmtW(cum(g.w)[4])}</span>${g.d?`<span class="small muted">${esc(g.d)}</span>`:''}</div>`).join('')}</div></div>
   <div class="card"><span class="eyebrow">Tratamiento por fases</span><div class="scroll-x"><table class="phase-table"><thead><tr><th>Fase</th><th>Objetivos</th><th>Ejercicios</th><th>Para avanzar</th></tr></thead><tbody>
   ${i.ph.map((p,k)=>`<tr><th>${k+1}. ${esc(phaseName(i,k))}<br><span class="small muted">${i.g.map(g=>fmtW(g.w[k])).join(' / ')}</span></th><td><ul class="bul">${p.g.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></td><td><ul class="bul">${p.ex.map(x=>`<li>${esc(EX[x].n)} <a class="vid${vidFor(x,1).ver?' ver':''} mini" href="${esc(vidFor(x,1).url)}" target="_blank" rel="noopener" aria-label="Vídeo de ${esc(EX[x].n)}">▶</a></li>`).join('')}</ul></td><td><ul class="bul">${p.cr.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></td></tr>`).join('')}
   </tbody></table></div><p class="small muted">Dosis, variantes y material se ajustan al nivel y al material disponible dentro del programa.</p></div>
  </div>
  <div class="side">
   <div class="card"><span class="eyebrow">Mecanismo típico</span><div class="chips">${Object.keys(i.mech).sort((a,b)=>i.mech[b]-i.mech[a]).map(m=>`<span class="pill info">${esc(MECH[m])}</span>`).join('')}</div>
    <span class="eyebrow">Síntomas clave</span><ul class="bul">${Object.keys(i.sx).sort((a,b)=>i.sx[b]-i.sx[a]).map(s=>`<li>${esc(SX[s])}</li>`).join('')}</ul></div>
   <div class="card"><span class="eyebrow">Pruebas clínicas</span><div class="chips">${i.tests.map(t=>`<button class="tchip" data-act="open-test" data-id="${t}">${esc(T_BY[t].n)}</button>`).join('')}</div>${i.ddx.length?`<span class="small muted">Para descartar otras lesiones:</span><div class="chips">${i.ddx.map(t=>`<button class="tchip" data-act="open-test" data-id="${t}">${esc(T_BY[t].n)}</button>`).join('')}</div>`:''}</div>
   <div class="card"><span class="eyebrow">Imagen y derivación</span><p>${esc(i.img)}</p></div>
   <div class="card"><span class="eyebrow">Criterios de retorno al deporte</span><ul class="bul">${i.rts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><span class="eyebrow">Prevención</span><p>${esc(i.prev)}</p></div>
   <div class="card"><span class="eyebrow">Referencias</span>${i.ref.length?`<ul class="bul refs">${i.ref.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`:'<p class="small muted">Sin referencias añadidas. Se pueden añadir desde Ajustes → Contenido clínico.</p>'}</div>
  </div>
 </div></div>`;
}
function vTests(){
  return `<section class="view-head"><p class="eyebrow">Biblioteca clínica</p><h1>Pruebas clínicas</h1><p class="lede">${TESTS.length} pruebas con su técnica, qué se considera positivo y su sensibilidad (S) y especificidad (E) aproximadas. Una prueba muy sensible y negativa ayuda a descartar; una muy específica y positiva ayuda a confirmar.</p></section>
${libTabs()}
<div class="row"><label class="field grow"><span class="sr">Buscar prueba</span><input id="test_q" data-on="test-q" placeholder="Buscar prueba o lesión…" value="${esc(UI.testQ)}"></label></div>
<div class="chips">${[{id:'all',n:'Todas'},...ZONES].map(z=>`<button class="chip" data-act="test-zone" data-z="${z.id}" aria-pressed="${UI.testZone===z.id}">${z.n}</button>`).join('')}</div>
<div id="test_list" class="tests">${testList()}</div>
<p class="disclaimer">Los valores de S y E proceden de estudios publicados y varían entre trabajos; úsalos como referencia, no como cifras exactas.</p>`;
}
function testList(){
  const q=UI.testQ.trim().toLowerCase();
  const l=TESTS.filter(t=>(UI.testZone==='all'||t.z===UI.testZone)&&(!q||(t.n+' '+t.dx).toLowerCase().includes(q)));
  if(!l.length)return `<div class="empty">No hay pruebas que coincidan.</div>`;
  const pc=v=>/^\D*\d+$/.test(v)?' %':'';
  return l.map(t=>{const used=INJ.filter(i=>i.tests.includes(t.id)||i.ddx.includes(t.id));const a=testAcc(t);return `<article class="test ${UI.testSel===t.id?'sel':''}" id="t_${t.id}">
  <div class="card-h"><h3>${esc(t.n)}</h3><span class="pill info">${esc(ZN[t.z])}</span></div>
  <div class="kv"><span>Cómo se hace</span>${esc(t.p)}</div><div class="kv"><span>Positivo</span>${esc(t.pos)}</div>
  <div class="se"><div><small>Sensibilidad</small><b>${esc(t.s)}${pc(t.s)}</b></div><div><small>Especificidad</small><b>${esc(t.e)}${pc(t.e)}</b></div>${a.known?`<div><small>LR+ / LR−</small><b>${(Math.min(20,a.s/(1-a.e))).toFixed(1)} / ${((1-a.s)/a.e).toFixed(2)}</b></div>`:''}</div>
  <div class="kv"><span>Orienta a</span>${esc(t.dx)}</div>
  ${used.length?`<div class="row tight">${used.map(i=>`<button class="tchip" data-act="open-lib" data-id="${i.id}">${esc(i.n)}</button>`).join('')}</div>`:''}
 </article>`}).join('');
}
function vExCat(){
  const types=Object.keys(TYPE);
  return `<section class="view-head"><p class="eyebrow">Biblioteca clínica</p><h1>Ejercicios y vídeos</h1><p class="lede">${Object.keys(EX).length} ejercicios con su variante, dosis y material por nivel. ▶ indica un vídeo de referencia seleccionado (EN: solo en inglés); el resto abre una búsqueda en español de la variante exacta.</p></section>
  ${libTabs()}
  <div class="chips">${[['all','Todos'],...types.map(t=>[t,TYPE[t]])].map(([k,n])=>`<button class="chip" data-act="ex-type" data-k="${k}" aria-pressed="${UI.exType===k}">${n}</button>`).join('')}</div>
  <div class="exc">${Object.entries(EX).filter(([id,x])=>UI.exType==='all'||x.t===UI.exType).map(([id,x])=>{const used=INJ.filter(i=>i.ph.some(p=>p.ex.includes(id)));const g=GROUP_OF[id];return `<article class="test">
   <div class="card-h"><h3>${esc(x.n)}</h3><span class="type">${TYPE[x.t]}</span></div>
   <p class="small muted">${esc(x.c)}</p>
   ${['conc','prot'].includes(x.t)?`<div class="exc-lv"><b class="small">${TYPE[x.t]}</b>${vidLink(id,0)}<span class="small muted">Sin dosis: se sigue la indicación clínica.</span></div>`:LEVELS.map((l,i)=>`<div class="exc-lv"><b class="small">${l.n}</b>${vidLink(id,i)}<span>${esc(x.v[i])}<br><span class="small muted num">${esc(doseStr(DOSE2[x.t][i]))} · ${esc(eqReq(id,i).split('+').map(k=>EQN[k]).join(' + '))}</span></span></div>`).join('')}
   ${g?`<p class="small muted">Alternativas: ${GROUPS[g].filter(y=>y!==id&&EX[y]).slice(0,5).map(y=>esc(EX[y].n)).join(', ')}</p>`:''}
   ${used.length?`<div class="row tight"><span class="small muted">Se usa en:</span>${used.slice(0,4).map(i=>`<button class="tchip" data-act="open-lib" data-id="${i.id}">${esc(i.n)}</button>`).join('')}${used.length>4?`<span class="small muted">+${used.length-4}</span>`:''}</div>`:''}
  </article>`}).join('')}</div>
  <p class="disclaimer">Los vídeos son de canales externos de YouTube y sirven como referencia de técnica; se seleccionaron por su título. El equipo clínico puede sustituirlos desde Ajustes → Contenido clínico.</p>`;
}

/* ===================== Programa ===================== */
function emptyCase(what){return `<section class="view-head"><p class="eyebrow">${what}</p><h1>Sin caso activo</h1><p class="lede">Crea un caso desde el diagnóstico guiado o elige una lesión manualmente.</p></section><div class="row"><button class="btn primary" data-act="go" data-v="diagnostico">Ir al diagnóstico</button><button class="btn" data-act="new-case-blank">Crear caso manual</button></div>`}
function calStrip(c){
  const act=activeDays(c);const out=[];
  for(let k=-6;k<=13;k++){const d=addDays(todayISO(),k);const dow=new Date(d+'T00:00:00').getDay();const sch=c.days.includes(dow);const done=act.has(d);
    out.push(`<div class="cd ${sch?'sch':''} ${done?'done':''} ${k===0?'today':''} ${k<0&&sch&&!done?'miss':''}" title="${esc(fmtD(d))}${sch?' · sesión':' · descanso'}${done?' · hecho':''}"><span>${DOW[dow]}</span><b>${+d.slice(8)}</b></div>`)}
  const adh=adherence(c);
  return `<div class="cal"><div class="card-h"><span class="eyebrow">Calendario</span><span class="small muted">${adh!=null?`Adherencia 14 días: <b class="num">${adh} %</b> · `:''}Sesiones: ${c.days.map(d=>DOWN[d]).join(', ')||'sin días'}</span></div><div class="cal-row">${out.join('')}</div></div>`;
}
function todayBanner(c){
  const t=todayISO();const dow=new Date().getDay();const out=[];
  if(c.mornings[t]==null)out.push(`<div class="note info morning"><b>¿Cómo amaneciste hoy?</b><span class="small">Dolor o rigidez al levantarte, de 0 a 10. Es la señal que usa la regla de dolor.</span><div class="mrow">${Array.from({length:11},(_,i)=>`<button class="mbtn" data-act="morning" data-v="${i}">${i}</button>`).join('')}</div></div>`);
  else out.push(`<p class="small muted">Hoy al levantarte: <b>${c.mornings[t]}/10</b> · <button class="linkish small" data-act="morning-clear">Cambiar</button></p>`);
  if(c.days.includes(dow)&&!c.sessions.some(s=>s.date===t)&&!c.logs.some(l=>l.date===t))out.push(`<div class="note ok"><b>Hoy toca sesión</b><span class="small">Usa la sesión guiada: cronometra series y descansos y registra cargas y dolor.</span></div>`);
  return out.join('');
}
function vProg(){
  const c=active();if(!c)return emptyCase('Programa de rehabilitación');
  autoStep(c);
  const e=evaluate(c);const {inj,grade,src,rev}=eff(c);
  const vp=UI.viewPhase??c.phase;const ph=inj.ph[vp];const isCur=vp===c.phase;
  const tk=todayISO();const doneToday=(c.done[tk]||[]);
  const nowPct=Math.min(100,e.wk/e.total*100);
  const srcPill=src==='pro'?`<span class="pill ok">Validado por profesional</span>`:src==='auto'?`<span class="pill warn">Diagnóstico automático${c.autoPct?` · ${c.autoPct} %`:''}</span>`:`<span class="pill info">Selección manual</span>`;
  const list=phaseExercises(c,vp);const wkp=Math.floor(weeksSince(c.phaseStart));
  const whyTxt={pro:'<span class="pill ok">Cambio del profesional</span>',dolor:'<span class="pill warn">Sustituido por dolor</span>',material:'<span class="pill info">Adaptado a tu material</span>','sin-material':'<span class="pill bad">Falta material</span>'};
  const exList=list.map((it,k)=>{const x=EX[it.id];const on=doneToday.includes(it.id);const d=doseFor(c,it.id,e.ps);
    return `<li class="ex ${isCur&&on?'done':''}">${isCur?`<button class="tick" data-act="ex-done" data-id="${it.id}" aria-pressed="${on}" aria-label="Marcar ${esc(x.n)} como hecho"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>`:`<span class="ex-idx">${k+1}</span>`}
    <div class="exb"><div class="ex-name">${esc(x.n)}${x.v[c.level]?` · <span class="ex-var">${esc(x.v[c.level])}</span>`:''}</div>
     ${it.why?`<div>${whyTxt[it.why]||''}${it.orig!==it.id?` <span class="small muted">en lugar de ${esc(EX[it.orig].n)}</span>`:''}</div>`:''}
     <div class="ex-dose">${esc(doseStr(d))}</div>${d&&d.cue?`<div class="ex-cue prog">${esc(d.cue)}</div>`:''}<div class="ex-cue">${esc(x.c)}</div>
     <div class="row tight">${vidLink(it.id,c.level)}${isCur&&!['prot','conc'].includes(x.t)?`<button class="linkish small" data-act="hurts" data-id="${it.orig}">Esto me duele</button>`:''}${isCur&&CL.assets&&!['prot','conc'].includes(x.t)?`<label class="linkish small up">Subir vídeo de técnica<input type="file" accept="video/mp4,video/webm,video/quicktime" data-on="upvid" data-id="${it.id}" hidden></label>`:''}</div></div>
    <span class="type">${TYPE[x.t]}</span></li>`}).join('');
  const crit=ph.cr.map((t,k)=>{const s=critState(c,vp,k);return `<label class="${s.auto?'auto':''}"><input type="checkbox" data-on="crit" data-p="${vp}" data-i="${k}" ${s.met?'checked':''} ${s.auto?'disabled':''}><span>${esc(t)}${s.auto?` <span class="pill ${s.met?'ok':'info'}">Medido: ${esc(s.val)}</span>`:''}</span></label>`}).join('');
  return `
<section class="view-head"><p class="eyebrow">Programa de rehabilitación</p><h1>${esc(c.name)}</h1></section>
<div class="prog">
 <div class="stack">
  <div class="card case-head">
   <div class="row">${srcPill}${c.example?'<span class="pill info">Datos de ejemplo</span>':''}${c.sport?`<span class="pill acc">${esc(SPORTS[c.sport]?SPORTS[c.sport].n:c.sport)}</span>`:''}${e.lock?'<span class="pill warn">Avance con aprobación</span>':''}</div>
   <h2 class="h-case">${esc(inj.n)} · ${esc(SIDES[c.side]||'')}</h2>
   <div class="meta">
    <div><span>Grado o tratamiento</span><b>${esc(grade.n)}</b></div>
    <div><span>Fecha de lesión</span><b>${fmtD(c.date)}</b></div>
    <div><span>Semana actual</span><b>${e.wk<1?Math.floor(e.wk*7)+' días':'Semana '+Math.floor(e.wk+1)}</b></div>
    <div><span>Retorno estimado</span><b>${fmtD(addDays(c.date,e.total*7))}</b></div>
   </div>
   <div class="tl" role="group" aria-label="Fases del programa">${grade.w.map((w,i)=>`<button class="sg ${i<c.phase?'past':i===c.phase?'cur':''} ${i===vp?'view':''}" style="flex:${w}" data-act="view-phase" data-p="${i}" title="${esc(phaseName(inj,i))}"><b>F${i+1}</b><small>${fmtW(w)}</small></button>`).join('')}<i class="now" style="left:calc(${nowPct}% - 1px)"></i></div>
   <div class="tl-axis"><span>Inicio · ${fmtShort(c.date)}</span><span>Hoy: por tiempo, fase ${e.tp+1}</span><span>Retorno · ${fmtShort(addDays(c.date,e.total*7))}</span></div>
  </div>
  ${todayBanner(c)}
  <div class="note ${e.rec.k}"><b>${esc(e.rec.t)}</b><span class="small">${esc(e.rec.x)}</span>
   ${e.rec.adv&&!c.auto?`<div class="row"><button class="btn sm primary" data-act="phase-adv">Avanzar a la fase ${c.phase+2}</button></div>`:''}
   ${e.needApproval&&e.all&&isPro()&&!c._remote?`<div class="row"><button class="btn sm primary" data-act="approve">Aprobar el paso a la fase ${c.phase+2}</button></div>`:''}</div>
  ${e.lv?`<div class="note info"><b>Sugerencia de nivel: ${LEVELS[e.lv.to].n}</b><span class="small">${esc(e.lv.why)}</span><div class="row"><button class="btn sm" data-act="set-level" data-l="${e.lv.to}">Aplicar nivel ${LEVELS[e.lv.to].n.toLowerCase()}</button></div></div>`:''}
  ${rev&&rev.notes?`<div class="note warn"><b>Indicaciones del profesional${rev.name?' · '+esc(rev.name):''}</b><span class="small">${esc(rev.notes)}</span></div>`:''}
  <div class="card">
   <div class="card-h"><div><span class="eyebrow">Fase ${vp+1} de 4 ${isCur?`· actual · semana ${wkp+1} de la fase`:vp<c.phase?'· completada':'· próxima'}</span><h2>${esc(phaseName(inj,vp))}</h2></div>
    <div class="seg" role="group" aria-label="Nivel">${LEVELS.map((l,i)=>`<button data-act="set-level" data-l="${i}" aria-pressed="${c.level===i}" title="${esc(l.d)}">${l.n}</button>`).join('')}</div></div>
   <ul class="bul">${ph.g.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
   ${isCur?`<div class="row"><button class="btn primary big" data-act="session-start">Empezar sesión guiada</button><span class="small muted num">${list.filter(x=>doneToday.includes(x.id)).length} de ${list.length} hechos hoy</span></div>`:''}
   <ul class="clean ex-list">${exList}</ul>
   <p class="small muted">RIR: repeticiones en reserva. Dolor permitido durante el ejercicio: hasta 5/10, sin aumento a la mañana siguiente. La dosis sube sola cada semana de la fase y baja si el dolor supera el umbral.</p>
   <span class="eyebrow">Criterios para salir de la fase ${vp+1}</span>
   <div class="crit">${crit}</div>
   <p class="small muted">Los criterios con «Medido» se marcan solos a partir de las mediciones, escalas y el dolor que registras en Seguimiento.</p>
   ${isCur?`<div class="row"><button class="btn" data-act="phase-back" ${c.phase===0?'disabled':''}>Retroceder fase</button><button class="btn ${e.all&&!e.needApproval?'primary':''}" data-act="phase-adv" ${c.phase===3||(e.needApproval&&!isPro())?'disabled':''}>Avanzar fase</button>
    <label class="chk inline"><input type="checkbox" data-on="auto" ${c.auto?'checked':''}> Avance automático</label></div>
    <p class="small muted">${e.lock&&!isPro()?'Tu profesional aprueba cada avance de fase.':c.auto?'Modo automático: la fase avanza sola cuando se cumplen el tiempo mínimo, todos los criterios y el dolor está controlado.':'Modo manual: tú decides cuándo avanzar; la app solo recomienda.'}</p>`:`<div class="row"><button class="btn" data-act="view-phase" data-p="${c.phase}">Volver a la fase actual</button></div>`}
  </div>
  ${calStrip(c)}
 </div>
 <div class="side">
  ${proCard(c)}
  <div class="card"><span class="eyebrow">Retorno al deporte</span><ul class="bul">${inj.rts.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><div class="row"><button class="btn sm" data-act="go" data-v="seguimiento">Registrar mediciones</button><button class="btn sm" data-act="report">Informe PDF</button></div></div>
  ${editCard(c)}
  ${c.hist&&c.hist.length?`<div class="card"><span class="eyebrow">Historial</span><ul class="clean hist">${c.hist.slice().reverse().slice(0,8).map(h=>`<li class="small"><b class="num">${fmtShort(h.d)}</b> · ${esc(h.t)}</li>`).join('')}</ul></div>`:''}
 </div>
</div>`;
}
function proCard(c){
  const cloudRev=CL.rev[c.id];
  if(cloudRev&&!isPro())return `<div class="card"><div class="card-h"><span class="eyebrow">Validación profesional</span><span class="pill ok">Recibida</span></div>
   <p><b>${esc(INJ_BY[cloudRev.dx]?INJ_BY[cloudRev.dx].n:'')}</b>${cloudRev.name?' · '+esc(cloudRev.name):''}</p>${cloudRev.img?`<p class="small">Imagen: ${esc(cloudRev.img)}</p>`:''}<p class="small muted">Tu profesional la gestiona desde su panel.</p></div>`;
  const p=c.pro||{};const dx=p.dx||c.injuryId;const di=INJ_BY[dx];const ph=eff(c).inj.ph[c.phase];
  return `<form class="card" data-on="pro-form" id="pro_form">
  <div class="card-h"><span class="eyebrow">Validación profesional</span>${c.pro&&c.pro.dx?'<span class="pill ok">Registrada</span>':'<span class="pill warn">Pendiente</span>'}</div>
  <p class="small muted">El diagnóstico del profesional sustituye al automático y ajusta el programa.</p>
  <div class="grid2">
   <label class="field">Profesional<input id="pro_name" value="${esc(p.name)}" placeholder="Nombre"></label>
   <label class="field">Especialidad<select id="pro_spec">${['Traumatología','Medicina deportiva','Kinesiología / fisioterapia','Otra'].map(s=>`<option ${p.spec===s?'selected':''}>${s}</option>`).join('')}</select></label>
  </div>
  <label class="field">Diagnóstico confirmado<select id="pro_dx" data-on="pro-dx">${injOptions(dx)}</select></label>
  <div class="grid2">
   <label class="field">Grado o tratamiento<select id="pro_g">${di.g.map((g,i)=>`<option value="${i}" ${(+(p.dx?p.g:c.g))===i?'selected':''}>${esc(g.n)}</option>`).join('')}</select></label>
   <label class="field">Fecha de la consulta<input type="date" id="pro_date" value="${esc(p.date||todayISO())}"></label>
  </div>
  <label class="field">Hallazgos de imagen<input id="pro_img" value="${esc(p.img)}" placeholder="Ej.: RM con rotura parcial del LPAA"></label>
  <label class="field">Indicaciones y restricciones<textarea id="pro_notes" placeholder="Ej.: sin carga 2 semanas, evitar rotación externa">${esc(p.notes)}</textarea></label>
  <label class="chk"><input type="checkbox" id="pro_lock" ${p.lock?'checked':''}> Exigir mi aprobación para cada avance de fase</label>
  <details><summary class="small">Cambiar ejercicios de la fase actual</summary><div class="swaps">${ph.ex.map(id=>`<label class="field">${esc(EX[id].n)}<select id="sw_${id}" data-swap="${id}"><option value="">Sin cambio</option>${(GROUPS[GROUP_OF[id]]||[]).filter(x=>x!==id&&EX[x]).map(x=>`<option value="${x}" ${(p.swaps||{})[id]===x?'selected':''}>${esc(EX[x].n)}</option>`).join('')}</select></label>`).join('')}</div></details>
  <div class="row"><button class="btn primary" type="submit">Guardar validación</button>${c.pro&&c.pro.dx?`<button class="btn" type="button" data-act="pro-clear">Quitar validación</button>`:''}</div>
 </form>`;
}
function editCard(c){
  if(!UI.editOpen)return `<div class="card"><div class="card-h"><span class="eyebrow">Caso</span><button class="btn sm" data-act="edit-open">Editar datos</button></div><p class="small muted">Deportista, deporte, lesión, lado, grado, nivel, fecha, material y días de sesión.</p>
  <p class="small"><b>Material:</b> ${c.equip.filter(k=>k!=='n').map(k=>EQN[k]).join(', ')||'sin material'}</p>
  ${UI.confirmDel?`<div class="note bad"><b>¿Borrar este caso y sus registros?</b><div class="row"><button class="btn sm danger" data-act="case-del-yes">Sí, borrar</button><button class="btn sm" data-act="case-del-no">Cancelar</button></div></div>`:`<div><button class="linkish small" data-act="case-del">Borrar caso</button></div>`}</div>`;
  return `<form class="card" data-on="edit-form"><span class="eyebrow">Editar caso</span>${caseFields(c,'ed')}<div class="row"><button class="btn primary" type="submit">Guardar</button><button class="btn" type="button" data-act="edit-close">Cancelar</button></div></form>`;
}
function caseFields(c,pf){
  const inj=INJ_BY[c.injuryId]||INJ[0];
  return `<label class="field">Deportista<input id="${pf}_name" required value="${esc(c.name)}" placeholder="Nombre o iniciales"></label>
  <label class="field">Deporte<select id="${pf}_sport"><option value="">Sin indicar</option>${Object.entries(SPORTS).map(([k,s])=>`<option value="${k}" ${c.sport===k?'selected':''}>${s.n}</option>`).join('')}</select></label>
  <label class="field">Lesión<select id="${pf}_inj" data-on="inj-pick" data-pf="${pf}">${injOptions(inj.id)}</select></label>
  <div class="grid2"><label class="field">Lado<select id="${pf}_side">${Object.entries(SIDES).map(([k,n])=>`<option value="${k}" ${c.side===k?'selected':''}>${n}</option>`).join('')}</select></label>
  <label class="field">Grado o tratamiento<select id="${pf}_g">${inj.g.map((g,i)=>`<option value="${i}" ${+c.g===i?'selected':''}>${esc(g.n)} · ${fmtW(cum(g.w)[4])}</option>`).join('')}</select></label></div>
  <div class="field">Nivel del deportista<div class="seg" role="radiogroup">${LEVELS.map((l,i)=>`<button type="button" data-act="pick-level" data-pf="${pf}" data-l="${i}" aria-pressed="${+c.level===i}">${l.n}</button>`).join('')}</div><input type="hidden" id="${pf}_level" value="${+c.level}"></div>
  <label class="field">Fecha de la lesión o cirugía<input type="date" id="${pf}_date" required value="${esc(c.date)}" max="${todayISO()}"></label>
  <div class="field">Material disponible<div class="chips">${['b','m','c','g'].map(k=>`<label class="chip ck"><input type="checkbox" data-eq="${pf}" value="${k}" ${c.equip.includes(k)?'checked':''}> ${EQN[k]}</label>`).join('')}</div></div>
  <div class="field">Días de sesión<div class="chips">${[1,2,3,4,5,6,0].map(d=>`<label class="chip ck"><input type="checkbox" data-day="${pf}" value="${d}" ${c.days.includes(d)?'checked':''}> ${DOWN[d].slice(0,3)}</label>`).join('')}</div></div>`;
}

/* ===================== Gráficos ===================== */
function lineChart(series,o){
  o=o||{};const pts=series.flatMap(s=>s.pts);if(pts.length<2)return `<p class="muted small">${o.empty||'Registra al menos dos valores para ver la evolución.'}</p>`;
  const dates=[...new Set(pts.map(p=>p.x))].sort();const W=640,H=o.h||220,pl=36,pr=14,pt=12,pb=30;
  const ys=pts.map(p=>p.y);let lo=o.min??Math.min(...ys),hi=o.max??Math.max(...ys);if(hi===lo){hi+=1;lo=Math.max(0,lo-1)}
  const pad=(hi-lo)*0.08;if(o.min==null)lo=Math.max(0,lo-pad);if(o.max==null)hi+=pad;
  const X=d=>pl+(dates.length===1?0:dates.indexOf(d)*(W-pl-pr)/(dates.length-1)),Y=v=>pt+(hi-v)*(H-pt-pb)/(hi-lo);
  const ticks=5;const step=(hi-lo)/(ticks-1);const tv=Array.from({length:ticks},(_,i)=>lo+i*step);
  const ds=Math.ceil(dates.length/7);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label||'Gráfico')}">
  ${o.zone?`<rect class="zone" x="${pl}" y="${Y(Math.min(hi,o.zone[1]))}" width="${W-pl-pr}" height="${Math.max(0,Y(o.zone[0])-Y(Math.min(hi,o.zone[1])))}"/>`:''}
  ${tv.map(v=>`<line class="g" x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="lx" x="${pl-8}" y="${Y(v)+4}" text-anchor="end">${Math.abs(v)>=100||Number.isInteger(+v.toFixed(1))?Math.round(v):v.toFixed(1)}</text>`).join('')}
  ${dates.map((d,i)=>i%ds===0||i===dates.length-1?`<text class="lx" x="${X(d)}" y="${H-8}" text-anchor="middle">${fmtShort(d)}</text>`:'').join('')}
  ${series.map(s=>{const p=s.pts.slice().sort((a,b)=>a.x<b.x?-1:1);return `<path class="${s.cls}" d="${p.map((q,i)=>`${i?'L':'M'}${X(q.x).toFixed(1)},${Y(q.y).toFixed(1)}`).join('')}"/>${p.map((q,i)=>`<circle class="${s.dot}" cx="${X(q.x)}" cy="${Y(q.y)}" r="${i===p.length-1?5:3.2}"><title>${fmtShort(q.x)}: ${q.y}</title></circle>`).join('')}`}).join('')}
  </svg>`;
}

/* ===================== Seguimiento ===================== */
const lsiPill=v=>v==null?'<span class="muted">—</span>':`<span class="pill ${v>=90?'ok':v>=80?'warn':'bad'} num">${v} %</span>`;
function relMeas(c){const z=eff(c).inj.z;return MEAS.filter(m=>m.z.some(x=>z.includes(x)))}
function vTrack(){
  const c=active();if(!c)return emptyCase('Seguimiento');
  autoStep(c);
  const e=evaluate(c);const {inj}=eff(c);const L=e.ps.logs;const l3=L.slice(-3);
  const avg=l3.length?(l3.reduce((s,l)=>s+l.during,0)/l3.length).toFixed(1):'—';
  const ml=mornList(c);
  const tk=todayISO();const list=phaseExercises(c,c.phase);const compDef=Math.round(100*list.filter(x=>(c.done[tk]||[]).includes(x.id)).length/list.length);
  return `
<section class="view-head"><p class="eyebrow">Seguimiento · ${esc(c.name)}</p><h1>Dolor, carga y retorno</h1><p class="lede">Cada registro alimenta las reglas automáticas: dosis, nivel, criterios de fase y alarmas.</p></section>
<div class="stats">
 <div class="stat"><span>Sesiones registradas</span><b>${L.length}</b></div>
 <div class="stat"><span>Dolor medio (3 últimas)</span><b>${avg}</b></div>
 <div class="stat"><span>Fase actual</span><b>${c.phase+1}<small> / 4</small></b></div>
 <div class="stat"><span>Adherencia 14 días</span><b>${adherence(c)??'—'}${adherence(c)!=null?'<small> %</small>':''}</b></div>
</div>
<div class="note ${e.rec.k}"><b>${esc(e.rec.t)}</b><span class="small">${esc(e.rec.x)}</span></div>
<nav class="jump" aria-label="Secciones">${[['s_dolor','Dolor'],['s_med','Mediciones'],['s_cargas','Cargas'],['s_escalas','Escalas'],['s_videos','Vídeos']].map(([id,n])=>`<a href="#${id}" data-act="jump" data-id="${id}">${n}</a>`).join('')}</nav>
<div class="prog">
 <div class="stack">
  <div class="card" id="s_dolor"><div class="card-h"><span class="eyebrow">Evolución del dolor (0–10)</span><div class="legend"><span><i class="lg1"></i>Durante la sesión</span><span><i class="lg2"></i>Al levantarse</span><span><i class="lgz"></i>Por encima del umbral</span></div></div>
   <div class="scroll-x">${lineChart([{cls:'l1',dot:'d1',pts:L.slice(-20).map(l=>({x:l.date,y:l.during}))},{cls:'l2',dot:'d2',pts:ml.slice(-20).map(m=>({x:m.date,y:m.v}))}],{min:0,max:10,zone:[5,10],label:'Evolución del dolor'})}</div></div>
  <div class="card"><span class="eyebrow">Registros</span>${L.length?`<div class="scroll-x"><table class="log"><thead><tr><th>Fecha</th><th>Durante</th><th>Al levantarse</th><th>Hecho</th><th>RPE</th><th>Notas</th><th></th></tr></thead><tbody>
   ${L.slice().reverse().map(l=>`<tr><td>${fmtShort(l.date)}</td><td>${l.during}</td><td>${c.mornings[addDays(l.date,1)]??c.mornings[l.date]??'—'}</td><td>${l.comp} %</td><td>${l.rpe}</td><td class="n">${l.flags&&l.flags.length?'<span class="pill bad">Alarma</span> ':''}${esc(l.notes)}</td><td><button class="linkish small" data-act="log-del" data-id="${l.id}" aria-label="Borrar registro">Borrar</button></td></tr>`).join('')}
   </tbody></table></div>`:'<p class="muted small">Aún no hay registros. La sesión guiada crea el registro sola.</p>'}</div>
  ${measCard(c)}
  ${loadCard(c)}
  ${scaleCard(c)}
  ${videoCard(c)}
 </div>
 <div class="side">
  <form class="card" data-on="log-form"><span class="eyebrow">Registrar sesión manualmente</span>
   <label class="field">Fecha<input type="date" id="lg_date" value="${tk}" max="${tk}"></label>
   <div class="field">Dolor durante la sesión<div class="range"><input type="range" id="lg_during" min="0" max="10" value="2" data-on="rng"><output id="o_lg_during">2</output></div></div>
   <div class="field">Dolor o rigidez al levantarse hoy<div class="range"><input type="range" id="lg_morning" min="0" max="10" value="${c.mornings[tk]??2}" data-on="rng"><output id="o_lg_morning">${c.mornings[tk]??2}</output></div></div>
   <div class="grid2"><label class="field">Rutina completada (%)<input type="number" id="lg_comp" min="0" max="100" value="${compDef||100}"></label>
   <div class="field">Esfuerzo percibido (RPE)<div class="range"><input type="range" id="lg_rpe" min="1" max="10" value="5" data-on="rng"><output id="o_lg_rpe">5</output></div></div></div>
   <fieldset class="flags"><legend class="small">¿Has notado algo de esto?</legend>${Object.entries(LOG_FLAGS).map(([k,t])=>`<label class="chk"><input type="checkbox" data-flag="${k}"> ${esc(t)}</label>`).join('')}</fieldset>
   <label class="field">Notas<input id="lg_notes" placeholder="Ej.: molestia al final de la carrera"></label>
   <button class="btn primary" type="submit">Guardar registro</button>
  </form>
  <form class="card" data-on="hop-form"><span class="eyebrow">Batería de 4 saltos</span><p class="small muted">Media de 2 intentos válidos por pierna. LSI = afectado ÷ sano (en el cronometrado, al revés). Objetivo ≥ 90 %.</p>
   <div class="scroll-x"><table class="hop"><thead><tr><th>Prueba</th><th>Afectado</th><th>Sano</th><th>LSI</th></tr></thead><tbody>
   ${MEAS.filter(m=>m.hop).map(m=>{const l=latestMeas(c,m.k);return `<tr><td>${esc(m.n)}<br><span class="small muted">${m.u}${l?' · último '+fmtShort(l.date):''}</span></td><td><input inputmode="decimal" id="hop_${m.k}_a" aria-label="${esc(m.n)} afectado" placeholder="${l?esc(l.a):''}"></td><td><input inputmode="decimal" id="hop_${m.k}_b" aria-label="${esc(m.n)} sano" placeholder="${l?esc(l.b):''}"></td><td>${lsiPill(lsiK(c,m.k))}</td></tr>`}).join('')}
   </tbody></table></div><button class="btn" type="submit">Guardar saltos</button></form>
  <div class="card"><span class="eyebrow">Sesiones guiadas</span>${c.sessions.length?`<ul class="clean hist">${c.sessions.slice().sort(byDate).reverse().slice(0,8).map(s=>`<li class="small"><b class="num">${fmtShort(s.date)}</b> · ${s.items.length} ejercicios · ${s.dur} min · RPE ${s.rpe}</li>`).join('')}</ul>`:'<p class="small muted">Aún no hay sesiones guiadas.</p>'}</div>
 </div>
</div>`;
}
function measCard(c){
  const rel=relMeas(c);const sel=UI.measSel&&MEAS_BY[UI.measSel]?UI.measSel:(rel.find(m=>c.meas.some(x=>x.k===m.k))||rel[0]||MEAS[0]).k;const md=MEAS_BY[sel];
  const latest=MEAS.map(m=>({m,l:latestMeas(c,m.k)})).filter(x=>x.l&&!x.m.hop);
  const hist=c.meas.filter(m=>m.k===sel).sort(byDate);
  return `<div class="card" id="s_med"><div class="card-h"><span class="eyebrow">Mediciones objetivas</span><span class="small muted">Comparadas con el lado sano</span></div>
  ${latest.length?`<div class="scroll-x"><table class="log"><thead><tr><th>Medida</th><th>Afectado</th><th>Sano</th><th>LSI</th><th>Fecha</th></tr></thead><tbody>${latest.map(({m,l})=>`<tr><td class="n">${esc(m.n)}</td><td>${esc(l.a)} ${m.u}</td><td>${m.single?'—':esc(l.b)+' '+m.u}</td><td>${m.single?'—':lsiPill(lsiOf(l,m.inv))}</td><td>${fmtShort(l.date)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="small muted">Sin mediciones todavía.</p>'}
  <form class="meas-f" data-on="meas-form"><div class="grid3">
   <label class="field">Medida<select id="ms_k" data-on="meas-sel"><optgroup label="Para esta lesión">${rel.map(m=>`<option value="${m.k}" ${m.k===sel?'selected':''}>${esc(m.n)}</option>`).join('')}</optgroup><optgroup label="Otras">${MEAS.filter(m=>!rel.includes(m)).map(m=>`<option value="${m.k}" ${m.k===sel?'selected':''}>${esc(m.n)}</option>`).join('')}</optgroup></select></label>
   <label class="field">Fecha<input type="date" id="ms_date" value="${todayISO()}" max="${todayISO()}"></label>
   <label class="field">${md.single?'Valor':'Afectado'} (${md.u})<input id="ms_a" inputmode="decimal" required></label>
   ${md.single?'':`<label class="field">Sano (${md.u})<input id="ms_b" inputmode="decimal" required></label>`}
  </div>${md.h?`<p class="small muted">${esc(md.h)}</p>`:''}<button class="btn" type="submit">Añadir medición</button></form>
  ${hist.length?`<div class="legend"><span><i class="lg1"></i>Afectado</span>${md.single?'':'<span><i class="lg2"></i>Sano</span>'}</div><div class="scroll-x">${lineChart(md.single?[{cls:'l1',dot:'d1',pts:hist.map(h=>({x:h.date,y:num(h.a)}))}]:[{cls:'l1',dot:'d1',pts:hist.map(h=>({x:h.date,y:num(h.a)}))},{cls:'l2',dot:'d2',pts:hist.map(h=>({x:h.date,y:num(h.b)}))}],{label:md.n,empty:'Añade otra medición para ver la evolución.'})}</div>
   <ul class="clean hist">${hist.slice().reverse().slice(0,5).map(h=>`<li class="small row tight"><b class="num">${fmtShort(h.date)}</b> ${esc(h.a)}${md.single?'':' / '+esc(h.b)} ${md.u} <button class="linkish small" data-act="meas-del" data-id="${h.id}">Borrar</button></li>`).join('')}</ul>`:''}
  </div>`;
}
function loadCard(c){
  const ex=[...new Set(c.sessions.flatMap(s=>s.items.filter(i=>i.sets.some(x=>num(x.kg)>0||num(x.reps)>0)).map(i=>i.id)))];
  if(!ex.length)return `<div class="card" id="s_cargas"><span class="eyebrow">Progresión de cargas</span><p class="small muted">Las cargas que anotes en la sesión guiada aparecerán aquí por ejercicio.</p></div>`;
  const sel=ex.includes(UI.loadSel)?UI.loadSel:ex[0];
  const pts=c.sessions.filter(s=>s.items.some(i=>i.id===sel)).map(s=>{const it=s.items.find(i=>i.id===sel);const kg=Math.max(0,...it.sets.map(x=>num(x.kg)||0));const vol=it.sets.reduce((a,x)=>a+(num(x.kg)||0)*(num(x.reps)||0),0);const reps=it.sets.reduce((a,x)=>a+(num(x.reps)||0),0);return {date:s.date,kg,vol,reps,pain:it.pain}});
  const useKg=pts.some(p=>p.kg>0);
  return `<div class="card" id="s_cargas"><div class="card-h"><span class="eyebrow">Progresión de cargas</span><label class="sr" for="ld_sel">Ejercicio</label><select id="ld_sel" class="sel sm" data-on="load-sel">${ex.map(x=>`<option value="${x}" ${x===sel?'selected':''}>${esc(EX[x].n)}</option>`).join('')}</select></div>
  <div class="legend"><span><i class="lg1"></i>${useKg?'Carga máxima (kg)':'Repeticiones totales'}</span><span><i class="lg2"></i>Dolor (0–10)</span></div>
  <div class="scroll-x">${lineChart([{cls:'l1',dot:'d1',pts:pts.map(p=>({x:p.date,y:useKg?p.kg:p.reps}))}],{label:'Carga por sesión',empty:'Registra este ejercicio en otra sesión para ver la progresión.'})}</div>
  <p class="small muted">Último: ${useKg?pts[pts.length-1].kg+' kg':''} ${pts[pts.length-1].reps} repeticiones · dolor ${pts[pts.length-1].pain??'—'}/10${useKg?` · volumen ${Math.round(pts[pts.length-1].vol)} kg`:''}</p></div>`;
}
function scaleCard(c){
  const z=eff(c).inj.z;const rel=Object.entries(SCALES).filter(([k,s])=>s.z==='all'||s.z.some(x=>z.includes(x)));
  const sel=UI.scaleSel&&SCALES[UI.scaleSel]?UI.scaleSel:(rel[0]||['tsk11'])[0];const d=SCALES[sel];
  const hist=c.scales.filter(s=>s.k===sel).sort(byDate).map(s=>({...s,sc:scaleScore(s)})).filter(s=>s.sc);
  const done=Object.keys(SCALES).map(k=>latestScale(c,k)).filter(s=>s&&s.sc);
  const form=UI.scaleOpen?`<form data-on="scale-form" class="scale-f"><p class="small muted">${esc(d.help)} Usa el formulario oficial validado en español y anota aquí la puntuación de cada ítem.</p>
   ${d.calc==='direct'?`<label class="field">Puntuación (${d.total.min}–${d.total.max})<input id="sc_total" inputmode="decimal" required data-on="sc-live"></label>`:
     d.subs.map(s=>`<div class="field">${esc(s.n)} <span class="muted">(${s.i} ítems)</span><div class="items">${Array.from({length:s.i},(_,i)=>{const mx=d.lastMax&&i===s.i-1?d.lastMax:d.max;return `<label><span>${i+1}</span><input inputmode="numeric" data-sc="${s.k}" data-i="${i}" data-min="${d.min}" data-max="${mx}" data-on="sc-live" aria-label="${esc(s.n)} ítem ${i+1}" placeholder="${d.min}–${mx}"></label>`}).join('')}</div></div>`).join('')}
   <p class="small" id="sc_live">Completa los ítems para ver el resultado.</p>
   <div class="row"><button class="btn primary" type="submit">Guardar resultado</button><button class="btn" type="button" data-act="scale-close">Cancelar</button><a class="linkish small" href="https://www.google.com/search?q=${encodeURIComponent(d.full+' versión española validada')}" target="_blank" rel="noopener">Buscar el formulario oficial</a></div></form>`:'';
  return `<div class="card" id="s_escalas"><div class="card-h"><span class="eyebrow">Escalas validadas</span><span class="small muted">${d.up?'Mayor es mejor':'Menor es mejor'}</span></div>
  ${done.length?`<div class="chips">${done.map(s=>`<span class="pill info">${esc(SCALES[s.k].n)}: <b class="num">${s.sc.total}</b> · ${fmtShort(s.date)}</span>`).join('')}</div>`:''}
  <div class="row"><label class="sr" for="sc_sel">Escala</label><select id="sc_sel" class="sel" data-on="scale-sel"><optgroup label="Para esta lesión">${rel.map(([k,s])=>`<option value="${k}" ${k===sel?'selected':''}>${esc(s.n)}</option>`).join('')}</optgroup><optgroup label="Otras">${Object.entries(SCALES).filter(([k])=>!rel.some(r=>r[0]===k)).map(([k,s])=>`<option value="${k}" ${k===sel?'selected':''}>${esc(s.n)}</option>`).join('')}</optgroup></select>
  ${UI.scaleOpen?'':`<button class="btn" data-act="scale-open">Rellenar ${esc(d.n)}</button>`}</div>
  ${form}
  ${hist.length?`<div class="scroll-x">${lineChart([{cls:'l1',dot:'d1',pts:hist.map(h=>({x:h.date,y:h.sc.total}))}],{label:d.n,empty:'Repite la escala más adelante para ver la evolución.'})}</div>
   <ul class="clean hist">${hist.slice().reverse().slice(0,4).map(h=>`<li class="small row tight"><b class="num">${fmtShort(h.date)}</b> ${esc(d.n)} ${h.sc.total}${h.sc.subs?' · '+Object.entries(h.sc.subs).map(([k,v])=>esc((d.subs.find(s=>s.k===k)||{}).n||k)+' '+v).join(', '):''} <button class="linkish small" data-act="scale-del" data-id="${h.id}">Borrar</button></li>`).join('')}</ul>`:''}
  </div>`;
}
function videoCard(c){
  const can=!!CL.assets;
  return `<div class="card" id="s_videos"><span class="eyebrow">Vídeos de técnica</span>
  ${c.videos.length?`<div class="vids">${c.videos.slice().reverse().map(v=>`<figure><video controls preload="metadata" src="/_blob/${esc(v.id)}"></video><figcaption class="small">${esc(EX[v.ex]?EX[v.ex].n:'Ejercicio')} · ${fmtShort(v.date)}</figcaption></figure>`).join('')}</div>`:`<p class="small muted">${can?'Sube un vídeo corto (máx. 20 MB) desde cada ejercicio del programa para que tu profesional revise la técnica.':'Disponible en la versión web con cuenta: el profesional ve los vídeos en su panel.'}</p>`}</div>`;
}

/* ===================== Panel profesional / Mi profesional ===================== */
function semTable(rows,act){
  if(!rows.length)return '<p class="small muted">Sin casos.</p>';
  const order={rojo:0,ambar:1,verde:2};rows.sort((a,b)=>order[a.st]-order[b.st]);
  return `<div class="scroll-x"><table class="log sem"><thead><tr><th></th><th>Deportista</th><th>Lesión</th><th>Fase</th><th>Última actividad</th><th>Adherencia</th><th>Motivo</th></tr></thead><tbody>
  ${rows.map(r=>`<tr class="clickrow" data-act="${act}" data-id="${esc(r.key||r.id)}" tabindex="0"><td><i class="sem-dot ${r.st}" aria-label="${r.st}"></i></td><td class="n"><b>${esc(r.who||r.name)}</b>${r.who&&r.name?`<br><span class="small muted">${esc(r.name)}</span>`:''}</td><td class="n">${esc(r.inj)}</td><td>${r.phase}/4</td><td>${r.last?fmtShort(r.last):'—'}</td><td>${r.adh!=null?r.adh+' %':'—'}</td><td class="n small">${esc((r.reasons||[]).join(' · ')||'Sin incidencias')}</td></tr>`).join('')}
  </tbody></table></div>`;
}
function vPanel(){
  if(!isPro())return vMyPro();
  const local=S.cases.map(c=>caseSummary(c));
  const others=CL.patients.filter(p=>p.id!==CL.uid);
  const rows=others.flatMap(p=>(p.cases||[]).map(x=>({...x,key:p.id+'|'+x.id,who:CL.names[p.id]||'Paciente'})));
  return `<section class="view-head"><p class="eyebrow">Panel profesional</p><h1>Tus pacientes</h1><p class="lede">Semáforo de todos los casos: rojo si hay dolor por encima del umbral o una alarma, ámbar si falta actividad, validación o tu aprobación.</p></section>
  ${cloudNote()}
  ${CL.status!=='local'&&CL.admin?`<div class="card"><div class="card-h"><span class="eyebrow">Pacientes con cuenta</span><span class="small muted">${others.length} paciente(s)</span></div>${others.length?semTable(rows,'pat-open'):'<p class="small muted">Todavía no hay pacientes con cuenta. Comparte la app con ellos como colaboradores (Contributor) desde el menú Compartir.</p>'}</div>
   ${UI.panelSel?patientDetail():''}`:''}
  <div class="card"><div class="card-h"><span class="eyebrow">Casos que gestionas tú</span><button class="btn sm" data-act="new-case-blank">Nuevo caso</button></div>${semTable(local,'case-open')}</div>`;
}
function cloudNote(){
  if(CL.status==='local')return `<div class="note info"><b>Modo local</b><span class="small">${IS_PWA?'La app instalada guarda los datos en este dispositivo. Para trabajar con pacientes a distancia, usa la versión web compartida con tu cuenta, o intercambia copias y el informe PDF.':'Los datos se guardan solo en este navegador. Abre la app con sesión iniciada para sincronizar y ver a tus pacientes.'}</span></div>`;
  if(!CL.admin&&isPro())return `<div class="note warn"><b>Sin permisos de editor</b><span class="small">Para ver a los pacientes, el propietario de la app debe compartirla contigo como editor (Editor).</span></div>`;
  return '';
}
function patientDetail(){
  const [pid,cid]=UI.panelSel.split('|');const P=CL.sel;
  if(!P||P.pid!==pid)return `<div class="card"><p class="small muted">Cargando paciente…</p></div>`;
  const c=P.cases.find(x=>x.id===cid);if(!c)return `<div class="card"><p class="small muted">Este caso ya no existe.</p></div>`;
  c._rev=P.rev[c.id]||null;c._remote=true;
  const e=evaluate(c);const {inj,grade}=eff(c);const r=c._rev||{};const L=e.ps.logs;const ml=mornList(c);
  const crit=inj.ph[c.phase].cr.map((t,i)=>critState(c,c.phase,i));
  const msgs=P.msgs.filter(m=>!m.caseId||m.caseId===cid);
  return `<div class="card pd"><div class="card-h"><div><p class="eyebrow">${esc(CL.names[pid]||'Paciente')}</p><h2>${esc(c.name)} · ${esc(inj.n)}</h2></div><button class="btn sm" data-act="pat-close">Cerrar</button></div>
  <div class="meta"><div><span>Lado</span><b>${esc(SIDES[c.side]||'')}</b></div><div><span>Grado</span><b>${esc(grade.n)}</b></div><div><span>Fase</span><b>${c.phase+1} de 4</b></div><div><span>Desde</span><b>${fmtD(c.date)}</b></div></div>
  <div class="note ${e.rec.k}"><b>${esc(e.rec.t)}</b><span class="small">${esc(e.rec.x)}</span></div>
  <div class="scroll-x">${lineChart([{cls:'l1',dot:'d1',pts:L.slice(-20).map(l=>({x:l.date,y:l.during}))},{cls:'l2',dot:'d2',pts:ml.slice(-20).map(m=>({x:m.date,y:m.v}))}],{min:0,max:10,zone:[5,10],h:180,label:'Dolor del paciente'})}</div>
  <div class="grid2"><div><span class="eyebrow">Criterios de la fase ${c.phase+1}</span><ul class="clean crit-ro">${crit.map(s=>`<li class="small">${s.met?'✓':'○'} ${esc(s.text)}${s.auto?` <span class="muted">(${esc(s.val)})</span>`:''}</li>`).join('')}</ul></div>
  <div><span class="eyebrow">Mediciones</span><ul class="clean crit-ro">${MEAS.map(m=>({m,l:latestMeas(c,m.k)})).filter(x=>x.l).map(({m,l})=>`<li class="small">${esc(m.n)}: ${esc(l.a)}${m.single?'':' / '+esc(l.b)} ${m.u} ${m.single?'':lsiPill(lsiOf(l,m.inv))}</li>`).join('')||'<li class="small muted">Sin mediciones</li>'}</ul></div></div>
  ${c.videos.length?`<span class="eyebrow">Vídeos de técnica</span><div class="vids">${c.videos.slice().reverse().map(v=>`<figure><video controls preload="metadata" src="/_blob/${esc(v.id)}"></video><figcaption class="small">${esc(EX[v.ex]?EX[v.ex].n:'')} · ${fmtShort(v.date)}</figcaption></figure>`).join('')}</div>`:''}
  <form data-on="rev-form" class="stack"><span class="eyebrow">Tu revisión</span>
   <div class="grid2"><label class="field">Diagnóstico confirmado<select id="rv_dx" data-on="rv-dx">${injOptions(r.dx||c.injuryId)}</select></label>
   <label class="field">Grado o tratamiento<select id="rv_g">${INJ_BY[r.dx||c.injuryId].g.map((g,i)=>`<option value="${i}" ${(+(r.dx?r.g:c.g))===i?'selected':''}>${esc(g.n)}</option>`).join('')}</select></label></div>
   <div class="grid2"><label class="field">Tu nombre<input id="rv_name" value="${esc(r.name||'')}"></label><label class="field">Hallazgos de imagen<input id="rv_img" value="${esc(r.img||'')}"></label></div>
   <label class="field">Indicaciones<textarea id="rv_notes">${esc(r.notes||'')}</textarea></label>
   <label class="chk"><input type="checkbox" id="rv_lock" ${r.lock?'checked':''}> Exigir mi aprobación para cada avance de fase</label>
   ${r.lock?`<label class="chk"><input type="checkbox" id="rv_appr" ${(+r.approved||0)>=c.phase+1?'checked':''}> Apruebo el paso a la fase ${Math.min(4,c.phase+2)}</label>`:''}
   <details><summary class="small">Cambiar ejercicios de la fase actual</summary><div class="swaps">${inj.ph[c.phase].ex.map(id=>`<label class="field">${esc(EX[id].n)}<select data-swap="${id}"><option value="">Sin cambio</option>${(GROUPS[GROUP_OF[id]]||[]).filter(x=>x!==id&&EX[x]).map(x=>`<option value="${x}" ${(r.swaps||{})[id]===x?'selected':''}>${esc(EX[x].n)}</option>`).join('')}</select></label>`).join('')}</div></details>
   <div class="row"><button class="btn primary" type="submit">Guardar revisión</button><button class="btn" type="button" data-act="report-remote">Informe PDF</button></div></form>
  ${msgThread(msgs,'pro')}
 </div>`;
}
function msgThread(msgs,who){
  return `<div class="msgs"><span class="eyebrow">Mensajes</span><div class="thread">${msgs.length?msgs.map(m=>`<div class="msg ${(who==='pro')===!!m.pro?'me':''}"><p>${esc(m.text)}</p><span class="small muted">${m.pro?'Profesional':'Paciente'} · ${new Date(m.ts).toLocaleString('es',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span></div>`).join(''):'<p class="small muted">Sin mensajes todavía.</p>'}</div>
  <form data-on="msg-form" data-who="${who}" class="row"><label class="sr" for="msg_txt">Mensaje</label><input id="msg_txt" class="grow inp" maxlength="1000" placeholder="Escribe un mensaje" autocomplete="off"><button class="btn primary" type="submit">Enviar</button></form></div>`;
}
function vMyPro(){
  const c=active();
  return `<section class="view-head"><p class="eyebrow">Mi profesional</p><h1>Comparte tu evolución</h1><p class="lede">Tu kinesiólogo, fisioterapeuta o médico valida el diagnóstico, ajusta el programa y aprueba los avances.</p></section>
  ${CL.status!=='local'&&CL.uid?`<div class="card">${msgThread(CL.msgs.filter(m=>!c||!m.caseId||m.caseId===c.id),'patient')}</div>
   ${c&&CL.rev[c.id]?`<div class="note ok"><b>Revisión recibida</b><span class="small">${esc(INJ_BY[CL.rev[c.id].dx]?INJ_BY[CL.rev[c.id].dx].n:'')}${CL.rev[c.id].notes?' · '+esc(CL.rev[c.id].notes):''}</span></div>`:''}
   <div class="note info"><b>Cómo te ve tu profesional</b><span class="small">Si tu profesional es editor de esta app, ve tus casos, registros, mediciones y vídeos en su panel, y puede escribirte aquí.</span></div>`:cloudNote()}
  <div class="card"><span class="eyebrow">Enviar sin cuenta</span><p class="small muted">Lleva el informe PDF a la consulta o envía una copia del caso para que tu profesional la importe en su app.</p>
   <div class="row"><button class="btn primary" data-act="report" ${c?'':'disabled'}>Informe PDF del caso</button><button class="btn" data-act="data">Copia del caso</button></div></div>
  ${c?`<div class="card"><span class="eyebrow">Estado de tu caso</span>${semTable([caseSummary(c)],'case-open')}</div>`:''}`;
}
