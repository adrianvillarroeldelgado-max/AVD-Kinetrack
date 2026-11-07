
/* ===================== App Android (Capacitor) ===================== */
const IS_NATIVE=!!(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform());
const capPlug=(g,n)=>(window[g]&&window[g][n])||(window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins[n])||null;
const blobB64=b=>new Promise((ok,ko)=>{const r=new FileReader();r.onload=()=>ok(String(r.result).split(',')[1]);r.onerror=ko;r.readAsDataURL(b)});
async function nativeSave(name,blob){
  const Fs=capPlug('capacitorFilesystem','Filesystem'),Sh=capPlug('capacitorShare','Share');
  if(!Fs||!Sh){toast('No se pudo preparar el archivo en esta versión.');return false}
  try{const w=await Fs.writeFile({path:name,data:await blobB64(blob),directory:'CACHE'});await Sh.share({title:name,url:w.uri,dialogTitle:'Guardar o compartir'});return true}
  catch(err){if(!/cancel/i.test(String(err&&err.message)))toast('No se pudo compartir el archivo.');return false}
}

/* ===================== Nube (db + user + assets + downloads) ===================== */
const CL={db:null,user:null,assets:null,dl:null,uid:null,admin:false,write:null,status:'local',rev:{},msgs:[],patients:[],names:{},sel:null,timers:{},chains:{},pending:new Set(),firstSnap:true,unsubSel:[],sumTimer:null};
const CBASE=()=>'pacientes/'+CL.uid;
function setStatus(s){if(CL.status==='readonly'&&s!=='local')return;CL.status=s;renderNav()}
function handleErr(e){
  const code=e&&e.code;
  if(code==='invalid_argument'||code==='not_granted'){CL.status='readonly';toast('Tu cuenta no puede guardar en la nube: los datos quedan en este dispositivo.')}
  else if(code==='quota_exceeded'){toast('La base de datos está llena. Borra casos antiguos para seguir guardando en la nube.');CL.status='error'}
  else if(code==='revoked'){CL.status='local'}
  else CL.status='error';
  renderNav();
}
function cleanCase(c){const o=JSON.parse(JSON.stringify(c));delete o._rev;delete o._remote;delete o.synced;return o}
function cloudDirty(c){
  if(!c)return;c.updatedAt=Date.now();
  if(!CL.db||!CL.uid||c.example||CL.status==='readonly'||CL.status==='local')return;
  CL.pending.add(c.id);clearTimeout(CL.timers[c.id]);CL.timers[c.id]=setTimeout(()=>pushCase(c),1200);schedSummary();
}
function pushCase(c){
  if(!CL.db||!CL.uid||c.example)return;
  const ref=CL.db.doc(CBASE()+'/casos/'+c.id);
  CL.chains[c.id]=(CL.chains[c.id]||Promise.resolve()).then(async()=>{
    setStatus('saving');
    try{await ref.set(cleanCase(c));c.synced=true;CL.pending.delete(c.id);saveLocal();setStatus('sync')}catch(e){handleErr(e)}
  });
}
function cloudDelete(id){
  if(!CL.db||!CL.uid)return;
  CL.chains[id]=(CL.chains[id]||Promise.resolve()).then(()=>CL.db.doc(CBASE()+'/casos/'+id).delete().catch(handleErr));schedSummary();
}
function schedSummary(){
  if(!CL.db||!CL.uid)return;clearTimeout(CL.sumTimer);
  CL.sumTimer=setTimeout(()=>{
    const cases=S.cases.filter(c=>!c.example).map(c=>{const s=caseSummary(c);return {id:c.id,name:c.name,inj:s.inj,phase:s.phase,st:s.st,reasons:s.reasons,last:s.last,adh:s.adh}});
    CL.db.doc(CBASE()).set({updatedAt:Date.now(),cases}).catch(handleErr);
  },2000);
}
function onMyCases(snap){
  const remote=new Map(snap.docs.map(d=>[d.id,JSON.parse(JSON.stringify(d.data()))]));
  const definitive=!snap.metadata.fromCache;let changed=false;
  if(CL.firstSnap&&definitive){CL.firstSnap=false;let n=0;S.cases.forEach(c=>{if(!c.example&&!remote.has(c.id)&&!c.synced){pushCase(c);n++}});if(n)toast(`${n} caso(s) guardados en tu cuenta`);schedSummary()}
  remote.forEach((data,id)=>{
    const i=S.cases.findIndex(c=>c.id===id);
    if(i<0){S.cases.push(normCase({...data,synced:true}));changed=true}
    else if((data.updatedAt||0)>(S.cases[i].updatedAt||0)&&!CL.pending.has(id)){S.cases[i]=normCase({...data,synced:true});changed=true}
    else if(!S.cases[i].synced){S.cases[i].synced=true}
  });
  if(definitive){const before=S.cases.length;S.cases=S.cases.filter(c=>!(c.synced&&!c.example&&!remote.has(c.id)&&!CL.pending.has(c.id)));if(S.cases.length!==before)changed=true}
  if(!S.cases.find(c=>c.id===S.active))S.active=S.cases[0]?S.cases[0].id:null;
  if(changed){saveLocal();renderSoft()}
}
async function cloudInit(){
  const C=window.claude;if(!C||typeof C.use!=='function'){CL.status='local';renderNav();return}
  C.use('downloads').then(d=>{CL.dl=d}).catch(()=>{});
  let db=null,user=null;
  try{[db,user]=await Promise.all([C.use('db'),C.use('user')])}catch(e){}
  if(!db||!user){CL.status='local';renderNav();return}
  CL.db=db;CL.user=user;
  try{CL.uid=await user.id();CL.admin=await user.canEdit();CL.write=await user.can('data.write')}catch(e){}
  if(!CL.uid){CL.status='local';renderNav();return}
  C.use('assets').then(a=>{CL.assets=a;if(a)renderSoft()}).catch(()=>{});
  CL.status='sync';renderNav();
  const err=e=>handleErr(e);
  try{
    db.doc('contenido/override').onSnapshot(s=>{if(s.exists){OV=JSON.parse(JSON.stringify(s.data()));OV.inj=OV.inj||{};OV.ex=OV.ex||{};try{localStorage.setItem('kinetrack.ov',JSON.stringify(OV))}catch(e){}applyOV();renderSoft()}},()=>{});
    db.collection(CBASE()+'/casos').onSnapshot(onMyCases,err);
    db.collection(CBASE()+'/revision').onSnapshot(snap=>{CL.rev={};snap.docs.forEach(d=>CL.rev[d.id]=JSON.parse(JSON.stringify(d.data())));renderSoft()},()=>{});
    db.collection(CBASE()+'/mensajes').orderBy('ts').limit(300).onSnapshot(snap=>{CL.msgs=snap.docs.map(d=>({id:d.id,...d.data()}));renderSoft()},()=>{});
    if(CL.admin)db.collection('pacientes').onSnapshot(snap=>{
      CL.patients=snap.docs.map(d=>({id:d.id,...JSON.parse(JSON.stringify(d.data()))}));
      const ids=CL.patients.map(p=>p.id);
      user.profiles(ids).then(ps=>{let ch=false;ids.forEach(id=>{const n=ps[id]&&ps[id].name;if(n&&CL.names[id]!==n){CL.names[id]=n;ch=true}});if(ch)renderSoft()});
      renderSoft();
    },()=>{});
  }catch(e){handleErr(e)}
}
function openPatient(key){
  UI.panelSel=key;const pid=key.split('|')[0];
  if(!CL.sel||CL.sel.pid!==pid){
    CL.unsubSel.forEach(u=>{try{u()}catch(e){}});CL.unsubSel=[];
    CL.sel={pid,cases:[],rev:{},msgs:[]};const b='pacientes/'+pid;
    CL.unsubSel.push(CL.db.collection(b+'/casos').onSnapshot(s=>{CL.sel.cases=s.docs.map(d=>normCase(JSON.parse(JSON.stringify(d.data()))));renderSoft()},()=>{}));
    CL.unsubSel.push(CL.db.collection(b+'/revision').onSnapshot(s=>{CL.sel.rev={};s.docs.forEach(d=>CL.sel.rev[d.id]=JSON.parse(JSON.stringify(d.data())));renderSoft()},()=>{}));
    CL.unsubSel.push(CL.db.collection(b+'/mensajes').orderBy('ts').limit(300).onSnapshot(s=>{CL.sel.msgs=s.docs.map(d=>({id:d.id,...d.data()}));renderSoft()},()=>{}));
  }
  render();
}
async function saveFile(name,blob){
  if(IS_NATIVE)return nativeSave(name,blob);
  if(CL.dl){try{const r=await CL.dl.save({filename:name,data:blob});if(r&&r.status==='saved')toast('Archivo guardado');return true}catch(e){if(e&&e.code==='declined')return false;if(!IS_PWA){toast('No se pudo guardar el archivo aquí.');return false}}}
  if(IS_PWA||!window.claude){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);return true}
  toast('La descarga no está disponible en esta vista.');return false;
}

/* ===================== Informe PDF ===================== */
let jsPDFp=null;
function loadJsPDF(){
  if(window.jspdf)return Promise.resolve();if(jsPDFp)return jsPDFp;
  const srcs=[IS_PWA?'jspdf.umd.min.js':null,'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'].filter(Boolean);
  const one=src=>new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=()=>window.jspdf?ok():ko();s.onerror=()=>{s.remove();ko()};document.head.appendChild(s)});
  jsPDFp=srcs.reduce((p,src)=>p.catch(()=>one(src)),Promise.reject()).catch(e=>{jsPDFp=null;throw e});
  return jsPDFp;
}
const pdfT=s=>String(s??'').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/≈/g,'~').replace(/−/g,'-').replace(/→/g,'->').replace(/✓/g,'Si').replace(/○/g,'No').replace(/[^\x00-\xFF–—‘’“”•…€]/g,'');
async function makeReport(c){
  try{await loadJsPDF()}catch(e){toast('No se pudo cargar el generador de PDF. Revisa la conexión.');return}
  const {jsPDF}=window.jspdf;const doc=new jsPDF({unit:'mm',format:'a4'});
  const W=210,M=16;let y=18;
  const need=h=>{if(y+h>282){doc.addPage();y=18}};
  const H=(t,sz=13)=>{need(10);doc.setFont('helvetica','bold');doc.setFontSize(sz);doc.setTextColor(15,44,66);doc.text(pdfT(t),M,y);y+=sz*0.5+2};
  const P=(t,sz=10,col=[30,40,50])=>{doc.setFont('helvetica','normal');doc.setFontSize(sz);doc.setTextColor(...col);doc.splitTextToSize(pdfT(t),W-2*M).forEach(l=>{need(5);doc.text(l,M,y);y+=sz*0.45+1})};
  const KV=rows=>{doc.setFontSize(10);rows.forEach(([k,v])=>{need(6);doc.setFont('helvetica','bold');doc.setTextColor(86,103,117);doc.text(pdfT(k),M,y);doc.setFont('helvetica','normal');doc.setTextColor(19,32,43);doc.splitTextToSize(pdfT(v),W-2*M-55).forEach((l,i)=>{if(i)need(5);doc.text(l,M+55,y);y+=5})});y+=1};
  const e=evaluate(c);const {inj,grade,src,rev}=eff(c);
  doc.setFillColor(15,44,66);doc.rect(0,0,W,12,'F');doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text('KINETRACK · INFORME DE REHABILITACIÓN',M,8);
  doc.setFont('helvetica','normal');doc.text(pdfT(fmtD(todayISO())),W-M,8,{align:'right'});
  y=22;H(c.name,16);
  KV([['Lesión',inj.n],['Lado',SIDES[c.side]||''],['Grado / tratamiento',grade.n],['Fecha de lesión',fmtD(c.date)],['Deporte',SPORTS[c.sport]?SPORTS[c.sport].n:(c.sport||'—')],['Diagnóstico',src==='pro'?`Validado por ${rev&&rev.name?rev.name:'profesional'}${rev&&rev.spec?' ('+rev.spec+')':''}`:src==='auto'?`Automático (${c.autoPct||'—'} %), pendiente de validar`:'Selección manual, pendiente de validar'],['Fase actual',`${c.phase+1} de 4 · ${phaseName(inj,c.phase)}`],['Retorno estimado',fmtD(addDays(c.date,e.total*7))],['Nivel',LEVELS[c.level].n],['Adherencia 14 días',adherence(c)!=null?adherence(c)+' %':'—']]);
  H('Situación actual',12);P(`${e.rec.t}. ${e.rec.x}`);
  if(rev&&rev.notes){P('Indicaciones del profesional: '+rev.notes)}
  if(rev&&rev.img){P('Imagen: '+rev.img)}
  y+=2;H(`Criterios de la fase ${c.phase+1}`,12);
  e.crit.forEach(s=>P(`${s.met?'[x]':'[ ]'} ${s.text}${s.auto?` (medido: ${s.val})`:''}`));
  const ms=MEAS.map(m=>({m,l:latestMeas(c,m.k)})).filter(x=>x.l);
  if(ms.length){y+=2;H('Mediciones (afectado / sano)',12);ms.forEach(({m,l})=>P(`${m.n}: ${l.a}${m.single?'':' / '+l.b} ${m.u}${m.single?'':` · LSI ${lsiOf(l,m.inv)??'—'} %`} · ${fmtShort(l.date)}`))}
  const scs=Object.keys(SCALES).map(k=>latestScale(c,k)).filter(s=>s&&s.sc);
  if(scs.length){y+=2;H('Escalas',12);scs.forEach(s=>P(`${SCALES[s.k].n}: ${s.sc.total}${s.sc.subs?' ('+Object.entries(s.sc.subs).map(([k,v])=>((SCALES[s.k].subs.find(x=>x.k===k)||{}).n||k)+' '+v).join(', ')+')':''} · ${fmtShort(s.date)}`))}
  const L=e.ps.logs.slice(-20),ml=mornList(c).slice(-20);
  if(L.length>=2){y+=2;H('Dolor (0–10)',12);need(52);const x0=M+8,w=W-2*M-10,h=40,y0=y;doc.setDrawColor(210,219,226);for(let v=0;v<=10;v+=5){const yy=y0+h-v/10*h;doc.line(x0,yy,x0+w,yy);doc.setFontSize(7);doc.setTextColor(120);doc.text(String(v),M+2,yy+1)}
    doc.setFillColor(250,223,220);doc.rect(x0,y0,w,h/2,'F');
    const dates=[...new Set([...L.map(l=>l.date),...ml.map(m=>m.date)])].sort();const X=d=>x0+(dates.length<2?0:dates.indexOf(d)*w/(dates.length-1));const Y=v=>y0+h-v/10*h;
    const line=(pts,col)=>{doc.setDrawColor(...col);doc.setLineWidth(0.6);for(let i=1;i<pts.length;i++)doc.line(X(pts[i-1].x),Y(pts[i-1].y),X(pts[i].x),Y(pts[i].y))};
    line(L.map(l=>({x:l.date,y:l.during})),[214,46,105]);line(ml.map(m=>({x:m.date,y:m.v})),[37,88,125]);doc.setLineWidth(0.2);
    y=y0+h+5;doc.setFontSize(8);doc.setTextColor(86,103,117);doc.text(pdfT(`${fmtShort(dates[0])} – ${fmtShort(dates[dates.length-1])} · rosa: durante la sesión · azul: al levantarse · zona sombreada: por encima del umbral`),M,y);y+=6}
  if(L.length){H('Últimos registros',12);L.slice(-10).reverse().forEach(l=>P(`${fmtShort(l.date)} · dolor ${l.during}/10 · hecho ${l.comp} % · RPE ${l.rpe}${l.flags&&l.flags.length?' · ALARMA: '+l.flags.map(f=>LOG_FLAGS[f]).join(', '):''}${l.notes?' · '+l.notes:''}`,9))}
  y+=2;H('Rutina actual',12);phaseExercises(c,c.phase).forEach(it=>P(`• ${EX[it.id].n} – ${EX[it.id].v[c.level]||''} – ${doseStr(doseFor(c,it.id,e.ps))}`,9));
  y+=4;P('Informe generado por Kinetrack. Herramienta orientativa de apoyo: no sustituye la valoración presencial de un profesional sanitario.',8,[110,120,130]);
  const blob=doc.output('blob');
  await saveFile(`kinetrack-${(c.name||'caso').replace(/[^\w-]+/g,'-').toLowerCase()}-${todayISO()}.pdf`,blob);
}

/* ===================== Sesión guiada ===================== */
let SES=null,AC=null,SES_TICK=null;
function beep(f=880,d=0.18){try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;o.connect(g);g.connect(AC.destination);g.gain.setValueAtTime(0.25,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.start();o.stop(AC.currentTime+d)}catch(e){}try{navigator.vibrate&&navigator.vibrate(120)}catch(e){}}
function sesItem(c,it){const d=doseFor(c,it.id);const x=EX[it.id];const n=d?d.s:1;return {id:it.id,orig:it.orig,dose:d,sets:Array.from({length:n},()=>({kg:'',reps:d&&d.r?String(d.r).split(/[–-]/)[0]:'',secs:d&&d.t?d.t:'',done:false})),pain:null,t:x.t}}
function sessionStart(){
  const c=active();if(!c)return;
  const list=phaseExercises(c,c.phase).filter(it=>EX[it.id].t!=='prot');
  SES={cid:c.id,i:0,items:list.map(it=>sesItem(c,it)),timer:null,start:Date.now(),end:false,confirmExit:false,rpe:5,notes:''};
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)()}catch(e){}
  try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(w=>{SES&&(SES.wl=w)}).catch(()=>{})}catch(e){}
  $('#session').hidden=false;document.body.classList.add('noscroll');renderSession();
}
function sessionClose(){if(SES&&SES.wl)try{SES.wl.release()}catch(e){}clearInterval(SES_TICK);SES=null;$('#session').hidden=true;document.body.classList.remove('noscroll');render()}
function fmtClock(s){s=Math.max(0,Math.ceil(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
function startTimer(kind,secs){SES.timer={kind,end:Date.now()+secs*1000,total:secs};clearInterval(SES_TICK);SES_TICK=setInterval(tickTimer,200);renderSession()}
function tickTimer(){
  if(!SES||!SES.timer){clearInterval(SES_TICK);return}
  const left=(SES.timer.end-Date.now())/1000;const el=$('#ses_clock');if(el)el.textContent=fmtClock(left);
  const ring=$('#ses_ring');if(ring)ring.style.strokeDashoffset=String(326.7*(1-Math.max(0,left)/SES.timer.total));
  if(left<=3.05&&left>2.85&&SES.timer.kind==='work')beep(660,0.08);
  if(left<=0){clearInterval(SES_TICK);const k=SES.timer.kind;SES.timer=null;beep(k==='work'?988:740,0.3);if(k==='work')setDone();else renderSession()}
}
function curItem(){return SES.items[SES.i]}
function nextSetIdx(it){return it.sets.findIndex(s=>!s.done)}
function setDone(){
  const it=curItem();const k=nextSetIdx(it);if(k<0){renderSession();return}
  it.sets[k].done=true;const c=active();const rest=restFor(EX[it.id],c.level);
  if(nextSetIdx(it)>=0&&rest>0)startTimer('rest',rest);else renderSession();
}
function renderSession(){
  if(!SES)return;const c=S.cases.find(x=>x.id===SES.cid);if(!c){sessionClose();return}
  const n=SES.items.length;const el=$('#session_panel');
  if(SES.end){
    const done=SES.items.filter(it=>it.sets.some(s=>s.done)).length;const mins=Math.max(1,Math.round((Date.now()-SES.start)/60000));
    const maxPain=Math.max(0,...SES.items.map(it=>it.pain??0));
    el.innerHTML=`<div class="ses-top"><span class="eyebrow">Sesión terminada</span></div>
    <h2>Buen trabajo</h2><div class="stats"><div class="stat"><span>Ejercicios</span><b>${done}/${n}</b></div><div class="stat"><span>Duración</span><b>${mins}<small> min</small></b></div><div class="stat"><span>Dolor máximo</span><b>${maxPain}<small>/10</small></b></div></div>
    <div class="field">Esfuerzo percibido de la sesión (RPE 1–10)<div class="range"><input type="range" id="ses_rpe" min="1" max="10" value="${SES.rpe}" data-on="ses-rpe"><output id="o_ses_rpe">${SES.rpe}</output></div></div>
    <fieldset class="flags"><legend class="small">¿Has notado algo de esto?</legend>${Object.entries(LOG_FLAGS).map(([k,t])=>`<label class="chk"><input type="checkbox" data-sflag="${k}"> ${esc(t)}</label>`).join('')}</fieldset>
    <label class="field">Notas<input id="ses_notes" value="${esc(SES.notes)}" data-on="ses-notes" placeholder="Opcional"></label>
    <p class="small muted">Mañana, al levantarte, registra el dolor en la pantalla de Programa: es lo que decide si la carga sube o baja.</p>
    <div class="row"><button class="btn primary big" data-act="ses-save">Guardar sesión</button><button class="btn" data-act="ses-back">Volver</button></div>`;
    return;
  }
  const it=curItem();const x=EX[it.id];const d=it.dose;const k=nextSetIdx(it);const allDone=k<0;
  const T=SES.timer;const isTimed=d&&(d.t||d.min);const secs=d?(d.t?(+it.sets[Math.max(0,k)].secs||d.t):d.min?d.min*60:0):0;
  const ring=(lbl,sub)=>`<div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" class="rbg"/><circle id="ses_ring" cx="60" cy="60" r="52" class="rfg ${T&&T.kind==='rest'?'rest':''}" style="stroke-dasharray:326.7;stroke-dashoffset:${T?326.7*(1-Math.max(0,(T.end-Date.now())/1000)/T.total):0}"/></svg><div class="rlbl"><b id="ses_clock">${lbl}</b><span>${sub}</span></div></div>`;
  let action='';
  if(T)action=`${ring(fmtClock((T.end-Date.now())/1000),T.kind==='rest'?'Descanso':'En marcha')}<div class="row center">${T.kind==='rest'?'<button class="btn" data-act="ses-skip">Saltar descanso</button>':'<button class="btn" data-act="ses-stop">Terminar serie ya</button>'}</div>`;
  else if(allDone)action=`<div class="field">Dolor durante este ejercicio (0–10)<div class="mrow">${Array.from({length:11},(_,i)=>`<button class="mbtn ${it.pain===i?'on':''}" data-act="ses-pain" data-v="${i}">${i}</button>`).join('')}</div></div>${it.pain!=null&&it.pain>5?'<div class="note bad"><b>Dolor por encima de 5/10</b><span class="small">Para este ejercicio hoy o usa la alternativa con «Esto me duele».</span></div>':''}`;
  else if(['conc'].includes(x.t))action=`<div class="row center"><button class="btn primary big" data-act="ses-set">Hecho</button></div>`;
  else if(isTimed)action=`${ring(fmtClock(secs),`Serie ${k+1} de ${it.sets.length}`)}<div class="row center"><button class="btn primary big" data-act="ses-timer" data-v="${secs}">Iniciar ${d.min?d.min+' min':secs+' s'}</button><button class="btn" data-act="ses-set">Marcar hecha</button></div>`;
  else action=`<div class="row center"><button class="btn primary big" data-act="ses-set">Serie ${k+1} hecha</button></div>`;
  const showKg=['fuerza','plio'].includes(x.t);
  el.innerHTML=`<div class="ses-top"><span class="eyebrow">Ejercicio ${SES.i+1} de ${n}</span><div class="ses-prog"><i style="width:${(SES.i/n)*100}%"></i></div>
   ${SES.confirmExit?`<span class="row tight"><span class="small">¿Salir sin guardar?</span><button class="btn sm danger" data-act="ses-exit-yes">Salir</button><button class="btn sm" data-act="ses-exit-no">Seguir</button></span>`:`<button class="btn sm" data-act="ses-exit">Salir</button>`}</div>
   <div class="ses-ex"><span class="type">${TYPE[x.t]}</span><h2>${esc(x.n)}</h2>${x.v[c.level]?`<p class="ex-var">${esc(x.v[c.level])}</p>`:''}
   <p class="ex-dose">${esc(doseStr(d))}</p>${d&&d.cue?`<p class="ex-cue prog">${esc(d.cue)}</p>`:''}<p class="small muted">${esc(x.c)}</p>
   <div class="row tight">${vidLink(it.id,c.level)}<button class="linkish small" data-act="ses-hurts">Esto me duele</button></div></div>
   ${x.t==='conc'?'':`<div class="scroll-x"><table class="sets"><thead><tr><th>Serie</th>${showKg?'<th>kg</th>':''}<th>${d&&d.t?'Segundos':d&&d.min?'Minutos':'Repeticiones'}</th><th></th></tr></thead><tbody>
   ${it.sets.map((s,j)=>`<tr class="${s.done?'done':''} ${j===k?'cur':''}"><td>${j+1}</td>${showKg?`<td><input inputmode="decimal" data-on="ses-in" data-i="${j}" data-k="kg" value="${esc(s.kg)}" aria-label="kg serie ${j+1}"></td>`:''}<td><input inputmode="numeric" data-on="ses-in" data-i="${j}" data-k="${d&&d.t?'secs':'reps'}" value="${esc(d&&d.t?s.secs:d&&d.min?d.min:s.reps)}" aria-label="serie ${j+1}"></td><td>${s.done?'✓':''}</td></tr>`).join('')}
   </tbody></table></div>`}
   <div class="ses-act">${action}</div>
   <div class="row ses-nav"><button class="btn" data-act="ses-prev" ${SES.i===0?'disabled':''}>Anterior</button><button class="btn ${allDone?'primary':''}" data-act="ses-next">${SES.i===n-1?'Terminar sesión':allDone?'Siguiente ejercicio':'Saltar ejercicio'}</button></div>`;
}

/* ===================== Recordatorios ===================== */
let REM_T=[];
async function nativeReminders(){
  const LN=capPlug('capacitorLocalNotifications','LocalNotifications');if(!LN)return;
  try{
    const p=await LN.getPending();if(p&&p.notifications&&p.notifications.length)await LN.cancel({notifications:p.notifications.map(n=>({id:n.id}))});
    const r=S.settings.remind;const c=active();if(!r.on||!c)return;
    const perm=await LN.requestPermissions();if(perm.display!=='granted'){toast('Activa las notificaciones de Kinetrack en los ajustes del teléfono.');return}
    const hm=t=>t.split(':').map(Number);const [mh,mm]=hm(r.morning),[sh,sm]=hm(r.session);
    const list=[{id:1,title:'Kinetrack',body:'¿Cómo amaneciste? Registra el dolor al levantarte.',schedule:{on:{hour:mh,minute:mm},allowWhileIdle:true}}];
    c.days.forEach((d,i)=>list.push({id:10+i,title:'Kinetrack',body:'Hoy toca sesión de rehabilitación.',schedule:{on:{weekday:d+1,hour:sh,minute:sm},allowWhileIdle:true}}));
    await LN.schedule({notifications:list});
  }catch(err){}
}
function scheduleReminders(){
  REM_T.forEach(clearTimeout);REM_T=[];
  if(IS_NATIVE){nativeReminders();return}
  const r=S.settings.remind;if(!r.on||!IS_PWA||!('Notification' in window)||Notification.permission!=='granted')return;
  const c=active();if(!c)return;const now=new Date();
  const at=hm=>{const [h,m]=hm.split(':').map(Number);const d=new Date();d.setHours(h,m,0,0);return d-now};
  const notify=(t,b)=>{navigator.serviceWorker&&navigator.serviceWorker.ready.then(reg=>reg.showNotification(t,{body:b,icon:'icon-192.png',tag:t})).catch(()=>{try{new Notification(t,{body:b})}catch(e){}})};
  const dm=at(r.morning);if(dm>0)REM_T.push(setTimeout(()=>notify('Kinetrack','¿Cómo amaneciste? Registra el dolor al levantarte.'),dm));
  const ds=at(r.session);if(ds>0&&c.days.includes(now.getDay()))REM_T.push(setTimeout(()=>notify('Kinetrack','Hoy toca sesión de rehabilitación.'),ds));
}
function icsFor(c){
  const r=S.settings.remind;const e=evaluate(c);const until=addDays(c.date,e.total*7).replace(/-/g,'');const st=todayISO().replace(/-/g,'');
  const by=c.days.map(d=>['SU','MO','TU','WE','TH','FR','SA'][d]).join(',');const hm=t=>t.replace(':','')+'00';
  const ev=(u,summary,time,rule)=>`BEGIN:VEVENT\r\nUID:${u}@kinetrack\r\nDTSTAMP:${st}T000000Z\r\nDTSTART:${st}T${hm(time)}\r\nDURATION:PT30M\r\nRRULE:${rule};UNTIL=${until}T235959Z\r\nSUMMARY:${summary}\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:${summary}\r\nTRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT\r\n`;
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Kinetrack//ES\r\n${by?ev(c.id+'s','Sesión de rehabilitación',r.session,'FREQ=WEEKLY;BYDAY='+by):''}${ev(c.id+'m','Kinetrack: dolor al levantarte',r.morning,'FREQ=DAILY')}END:VCALENDAR\r\n`;
}

/* ===================== Guía ===================== */
function vGuide(){
  const sec=(id,t,body)=>`<section class="card guide" id="${id}"><h2>${t}</h2>${body}</section>`;
  const toc=[['g_inicio','Primeros pasos'],['g_diag','Diagnóstico guiado'],['g_prog','Programa'],['g_ses','Sesión guiada'],['g_seg','Seguimiento'],['g_pro','Trabajo con el profesional'],['g_lib','Biblioteca y contenido'],['g_app','Instalar la app'],['g_val','Validación y límites'],['legal','Aviso legal y privacidad']];
  return `<section class="view-head"><p class="eyebrow">Guía</p><h1>Cómo usar Kinetrack</h1><p class="lede">Del primer síntoma a la vuelta al deporte, paso a paso.</p></section>
  <nav class="toc" aria-label="Índice">${toc.map(([id,n],i)=>`<a href="#${id}" data-act="jump" data-id="${id}"><span class="num">${i+1}</span>${n}</a>`).join('')}</nav>
  ${sec('g_inicio','1. Primeros pasos',`<ol class="steps"><li>Elige tu perfil en la tarjeta de bienvenida: <b>deportista</b> o <b>profesional</b>. El perfil cambia el panel: el profesional ve el semáforo de pacientes; el deportista, los mensajes y revisiones de su profesional.</li><li>Acepta el aviso: los resultados son orientativos y tus datos de salud se guardan en el dispositivo (y en la nube si usas cuenta).</li><li>El caso de ejemplo (Lucía, esguince de tobillo) muestra la app funcionando. Bórralo desde Programa → Caso → Borrar caso cuando quieras.</li><li>Arriba a la derecha eliges el caso activo o creas uno nuevo. La etiqueta junto al selector indica si los datos están solo en este dispositivo o sincronizados.</li></ol>`)}
  ${sec('g_diag','2. Diagnóstico guiado',`<ol class="steps"><li><b>Zona y lado.</b> Toca el mapa (vista delante o detrás) o los botones de zona. La vista posterior marca además el dolor en la cara de atrás.</li><li><b>Contexto.</b> Deporte, cómo empezó (de golpe o poco a poco), edad, dolor actual y si es una lesión repetida. Cada dato ajusta la probabilidad: por ejemplo, en fútbol suben los isquiotibiales y los aductores; una lesión de golpe resta peso a las tendinopatías.</li><li><b>Mecanismo y síntomas.</b> Marca todo lo que encaje. Un síntoma que no corresponde a una lesión le resta puntos.</li><li><b>Signos de alarma.</b> Si marcas alguno, aparece un aviso rojo con qué hacer (urgencias, radiografía, retirar del juego…). Las reglas de Ottawa y la sospecha de conmoción saltan solas.</li><li><b>Pruebas clínicas.</b> En cada lesión candidata, abre «Pruebas para confirmar o descartar» y marca <b>+</b> o <b>−</b>. La app aplica el teorema de Bayes con la sensibilidad y especificidad de cada prueba: una prueba muy específica y positiva sube mucho la probabilidad; una muy sensible y negativa la baja. El botón <b>?</b> explica cómo hacerla.</li><li><b>Crear programa</b> desde la lesión elegida, o por selección manual si ya tienes el diagnóstico de un profesional.</li></ol>`)}
  ${sec('g_prog','3. Programa por fases',`<ul class="bul"><li><b>Fases.</b> Cuatro fases (protección, carga temprana, fuerza, retorno) con duración según el grado o tratamiento. La línea de tiempo marca hoy y la fecha estimada de retorno; toca una fase para ver su contenido.</li><li><b>Nivel.</b> Principiante, intermedio o avanzado cambian la variante y la dosis de cada ejercicio. La app sugiere bajar de nivel si el dolor supera el umbral y subir tras tres sesiones completas con dolor ≤ 2/10.</li><li><b>Dosis semanal.</b> En la semana 2 de cada fase se añade una serie; a partir de la 3 se sube la carga o el tiempo. Si el dolor supera el umbral, la dosis baja sola.</li><li><b>Material.</b> En Editar datos marca el material que tienes (banda, mancuernas, escalón, gimnasio). Los ejercicios que no puedes hacer se cambian por una alternativa del mismo grupo muscular.</li><li><b>Esto me duele.</b> Cambia ese ejercicio por una alternativa y no lo vuelve a proponer.</li><li><b>Criterios.</b> Para salir de cada fase hay que cumplir criterios objetivos. Los que dependen de una medición, escala o del dolor se marcan solos («Medido»); el resto se marcan a mano.</li><li><b>Avance automático o manual.</b> En automático, la fase avanza sola cuando se cumplen el tiempo mínimo, todos los criterios y el dolor está controlado. El profesional puede exigir su aprobación para cada avance.</li><li><b>Dolor al levantarte.</b> Cada mañana toca el número de 0 a 10. Es la señal principal de la regla de dolor: si sube 2 puntos o pasa de 5, la carga baja.</li><li><b>Calendario.</b> Elige los días de sesión; la franja muestra sesiones hechas, perdidas y próximas, y la adherencia de las últimas 2 semanas.</li></ul>`)}
  ${sec('g_ses','4. Sesión guiada',`<ol class="steps"><li>Pulsa <b>Empezar sesión guiada</b> en Programa. La pantalla se mantiene encendida si el dispositivo lo permite.</li><li>Cada ejercicio muestra variante, dosis, indicación y vídeo. Para isometrías y cardio hay cronómetro con aviso sonoro; para repeticiones, el botón «Serie hecha».</li><li>Anota kilos y repeticiones reales en la tabla: alimentan el gráfico de cargas.</li><li>Entre series corre el descanso (se puede saltar). Al terminar el ejercicio, marca el dolor de 0 a 10.</li><li>Al final indica el esfuerzo (RPE) y cualquier señal de alarma. Se guarda un registro con el dolor máximo, el % completado y el RPE.</li></ol>`)}
  ${sec('g_seg','5. Seguimiento',`<ul class="bul"><li><b>Dolor.</b> Gráfico de dolor durante la sesión y al levantarse, con la zona por encima del umbral sombreada.</li><li><b>Registros y alarmas.</b> Puedes registrar sesiones a mano. Si marcas una alarma (pantorrilla caliente, fiebre, hormigueo nuevo…), el programa muestra qué hacer y se detiene la progresión.</li><li><b>Mediciones.</b> 24 medidas (goniometría, perímetros, fuerza, equilibrio, Y-balance…) con el lado sano como referencia. El índice de simetría (LSI) se calcula solo y alimenta los criterios.</li><li><b>Batería de saltos.</b> Salto simple, triple, triple cruzado y 6 m: el criterio de retorno exige LSI ≥ 90 %.</li><li><b>Cargas.</b> Progresión de kilos o repeticiones por ejercicio a partir de las sesiones guiadas.</li><li><b>Escalas validadas.</b> KOOS, IKDC, Lysholm, ACL-RSI, VISA-P, VISA-A, FAAM, LEFS, HAGOS, QuickDASH, Oswestry, NDI y Tampa. Se rellena el formulario oficial validado en español y se anotan aquí las puntuaciones por ítem; la app calcula el resultado y lo grafica.</li><li><b>Vídeos de técnica.</b> En la versión web con cuenta, sube un vídeo corto desde cada ejercicio para que tu profesional lo revise.</li></ul>`)}
  ${sec('g_pro','6. Trabajo con el profesional',`<ul class="bul"><li><b>Validación.</b> En Programa, el profesional registra el diagnóstico confirmado, el grado, la imagen y las indicaciones. Sustituye al diagnóstico automático y puede cambiar ejercicios y exigir su aprobación para avanzar.</li><li><b>Panel con semáforo.</b> El perfil profesional ve todos sus casos: rojo si hay dolor por encima del umbral o una alarma; ámbar si hay días sin actividad, poca adherencia, diagnóstico sin validar o una fase esperando aprobación.</li><li><b>Con cuenta (versión web).</b> El propietario de la app comparte el enlace desde el menú Compartir: los <b>profesionales como editores</b> (ven a todos los pacientes) y los <b>pacientes como colaboradores</b> (solo ven lo suyo). Cada paciente sincroniza sus casos; el profesional los revisa, deja su revisión y escribe mensajes. Que los pacientes puedan guardar depende del plan: en planes con organización (Team o Enterprise) los miembros colaboradores sí guardan; las personas invitadas desde fuera de la organización solo pueden ver.</li><li><b>Sin cuenta.</b> El deportista lleva el <b>informe PDF</b> a la consulta o envía una <b>copia del caso</b> (Ajustes → Datos) que el profesional importa.</li></ul>`)}
  ${sec('g_lib','7. Biblioteca y contenido clínico',`<ul class="bul"><li><b>Lesiones:</b> ${INJ.length} fichas con mecanismo, síntomas, pruebas, grados y plazos, fases, criterios de retorno, prevención y referencias.</li><li><b>Pruebas:</b> ${TESTS.length} pruebas con técnica, positivo, sensibilidad, especificidad y razones de verosimilitud.</li><li><b>Ejercicios:</b> ${Object.keys(EX).length} ejercicios con variante, dosis, material y vídeo por nivel, y sus alternativas.</li><li><b>Editor de contenido</b> (Ajustes → Contenido clínico): el equipo clínico corrige textos, criterios de retorno, referencias y vídeos sin programar, y marca cada ficha como revisada con su nombre y fecha. Con cuenta, los cambios de un editor llegan a todos.</li></ul>`)}
  ${sec('g_app','8. Instalar la app',`<p>Hay dos versiones con las mismas funciones clínicas:</p><ul class="bul"><li><b>Versión web</b> (este enlace): cuentas, sincronización, panel de pacientes, mensajes y vídeos de técnica.</li><li><b>App instalable (PWA)</b>: funciona sin conexión y guarda los datos en el dispositivo. Añade notificaciones de recordatorio y exporta el calendario de sesiones a tu agenda (.ics). Se publica subiendo la carpeta a un hosting con HTTPS y se instala desde el navegador con «Instalar app» o «Añadir a pantalla de inicio».</li></ul>`)}
  ${sec('g_val','9. Validación y límites',`<p>El motor de diagnóstico se probó con ${VALID.n+VALID.hn} casos clínicos ficticios escritos para esta prueba:</p><div class="scroll-x"><table class="log"><thead><tr><th>Tipo de caso</th><th>Casos</th><th>1.ª opción correcta</th><th>Entre las 3 primeras</th><th>1.ª opción con pruebas</th></tr></thead><tbody><tr><td class="n">Típicos (mecanismo y síntomas completos)</td><td>${VALID.n}</td><td>${VALID.top1} %</td><td>${VALID.top3} %</td><td>${VALID.top1t} %</td></tr><tr><td class="n">Difíciles (información parcial o lesiones parecidas)</td><td>${VALID.hn}</td><td>${VALID.htop1} %</td><td>${VALID.htop3} %</td><td>${VALID.htop1t} %</td></tr></tbody></table></div><p>En los casos difíciles, las lesiones parecidas (menisco y ligamento colateral, esguince lateral y sindesmosis, dolor patelofemoral y tendinopatía rotuliana) se separan sobre todo al registrar las pruebas clínicas.</p><p class="small muted">Esto comprueba que el motor funciona como se diseñó, no su precisión real: los casos los redactó el mismo equipo que el motor. Antes de usarla con pacientes, un equipo clínico debe revisar las fichas (Ajustes → Contenido clínico) y validarla con casos reales.</p>`)}
  ${sec('legal','10. Aviso legal y privacidad',`<ul class="bul"><li>Kinetrack es una herramienta de apoyo y educación. No es un dispositivo médico certificado y no sustituye la exploración, el diagnóstico ni el tratamiento de un profesional sanitario. Ante un signo de alarma, acude a urgencias.</li><li>En muchos países, un programa que propone diagnósticos puede considerarse dispositivo médico. Antes de un uso comercial o clínico conviene asesoramiento legal y regulatorio.</li><li><b>Dónde están tus datos.</b> Sin cuenta, solo en este navegador o dispositivo. Con cuenta, en la base de datos de esta app: tus casos los ven tú, el propietario de la app y quienes tengan permiso de editor (tus profesionales). Otros pacientes no los ven.</li><li><b>Tus derechos.</b> Puedes exportar tus datos (Ajustes → Datos) y borrarlos en cualquier momento; borrar un caso lo borra también de la nube.</li><li><b>Consentimiento.</b> Se registra la fecha en que lo aceptaste y puedes retirarlo en Ajustes → Perfil, lo que borra tus datos de este dispositivo y de tu cuenta.</li><li>Los vídeos enlazados son de canales externos de YouTube; Kinetrack no se responsabiliza de su contenido.</li></ul>`)}`;
}

/* ===================== Ajustes ===================== */
function vSettings(){
  const tabs=[['perfil','Perfil y privacidad'],['nube','Nube y datos'],['rec','Recordatorios'],['cont','Contenido clínico']];
  const t=UI.setTab;let body='';
  if(t==='perfil'){const cs=S.settings.consent;body=`<div class="card"><span class="eyebrow">Perfil</span><div class="seg" role="radiogroup"><button data-act="role" data-v="atleta" aria-pressed="${S.settings.role==='atleta'}">Deportista</button><button data-act="role" data-v="pro" aria-pressed="${S.settings.role==='pro'}">Profesional</button></div><p class="small muted">El perfil profesional muestra el panel de pacientes, permite aprobar fases desde este dispositivo y editar el contenido clínico.</p></div>
   <div class="card"><span class="eyebrow">Consentimiento</span><p>${cs?`Aceptado el ${fmtD(cs.date)}.`:'Todavía no has aceptado el aviso.'}</p>
   ${UI.confirmWipe?`<div class="note bad"><b>¿Retirar el consentimiento y borrar todos tus casos?</b><span class="small">Se borran de este dispositivo${CL.uid?' y de tu cuenta':''}. No se puede deshacer.</span><div class="row"><button class="btn sm danger" data-act="wipe-yes">Sí, borrar todo</button><button class="btn sm" data-act="wipe-no">Cancelar</button></div></div>`:`<button class="btn danger" data-act="wipe">Retirar consentimiento y borrar mis datos</button>`}</div>`}
  if(t==='nube'){const m={local:'Los datos están solo en este dispositivo.',sync:'Sincronizado con tu cuenta.',saving:'Guardando…',readonly:'Tu cuenta solo puede leer: los datos se guardan en este dispositivo.',error:'No hay conexión con la nube; se reintentará al guardar.'}[CL.status];
   body=`<div class="card"><span class="eyebrow">Cuenta y sincronización</span><p><b>${m}</b></p>
   ${CL.uid?`<p class="small muted">${CL.admin?'Tienes permiso de editor: ves a todos los pacientes en el Panel y puedes cambiar el contenido clínico.':'Tus casos se guardan en tu cuenta y los ve tu profesional.'}</p><button class="btn" data-act="sync-now">Sincronizar ahora</button>`:`<p class="small muted">${IS_PWA?'La app instalada no usa cuentas. Usa la versión web para sincronizar entre dispositivos y trabajar con tu profesional.':'Abre la app con tu sesión de claude.ai iniciada para sincronizar. El propietario la comparte desde el menú Compartir.'}</p>`}</div>
   <div class="card"><span class="eyebrow">Copias de seguridad</span><p class="small muted">Exporta todos los casos para guardarlos o pasarlos a otro dispositivo o a tu profesional.</p><div class="row"><button class="btn" data-act="data">Exportar o importar</button><button class="btn" data-act="dl-json">Descargar .json</button><button class="btn" data-act="restore-example">Recuperar el caso de ejemplo</button></div></div>`}
  if(t==='rec'){const r=S.settings.remind;const notif=IS_PWA&&!IS_NATIVE&&'Notification' in window;
   body=`<form class="card" data-on="rem-form"><span class="eyebrow">Recordatorios</span>
   <label class="chk"><input type="checkbox" id="rm_on" ${r.on?'checked':''}> Activar recordatorios</label>
   <div class="grid2"><label class="field">Dolor al levantarse<input type="time" id="rm_m" value="${esc(r.morning)}"></label><label class="field">Sesión (días elegidos en el caso)<input type="time" id="rm_s" value="${esc(r.session)}"></label></div>
   <p class="small muted">${IS_NATIVE?'Al guardar, la app programa avisos diarios en el teléfono (dolor al levantarte) y en tus días de sesión. Android te pedirá permiso la primera vez.':notif?`Notificaciones: ${Notification.permission==='granted'?'permitidas':Notification.permission==='denied'?'bloqueadas en el navegador':'sin permiso todavía'}. Con la app abierta o en segundo plano llegan a la hora indicada; para avisos fiables con la app cerrada, añade el calendario a tu agenda.`:'En esta versión los recordatorios aparecen al abrir la app (banner de dolor matutino y de sesión). La app instalada añade notificaciones y el calendario .ics.'}</p>
   <div class="row"><button class="btn primary" type="submit">Guardar</button>${notif?'<button class="btn" type="button" data-act="notif-perm">Permitir notificaciones</button><button class="btn" type="button" data-act="ics">Añadir al calendario (.ics)</button>':''}</div></form>`}
  if(t==='cont')body=contentEditor();
  return `<section class="view-head"><p class="eyebrow">Ajustes</p><h1>Configuración</h1></section>
  <div class="seg wrapseg" role="tablist">${tabs.map(([k,n])=>`<button role="tab" data-act="set-tab" data-v="${k}" aria-pressed="${t===k}" aria-selected="${t===k}">${n}</button>`).join('')}</div>${body}`;
}
function contentEditor(){
  const canCloud=!!(CL.db&&CL.uid);const ro=canCloud&&!CL.admin;
  const ii=INJ_BY[UI.edInj]||INJ[0];const o=(OV.inj||{})[ii.id]||{};const rv=ii.rev||{};
  const xid=EX[UI.edEx]?UI.edEx:Object.keys(EX)[0];const xo=(OV.ex||{})[xid]||{};
  const nRev=INJ.filter(i=>i.rev&&i.rev.ok).length;
  return `<div class="note info"><b>Revisión clínica: ${nRev} de ${INJ.length} fichas revisadas</b><span class="small">${ro?'Solo los editores de la app pueden cambiar el contenido.':canCloud?'Los cambios se guardan para todos los usuarios de esta app.':'Los cambios se guardan en este dispositivo.'}</span></div>
  <form class="card" data-on="ed-inj"><div class="card-h"><span class="eyebrow">Ficha de lesión</span><select id="ed_inj" class="sel" data-on="ed-inj-sel">${injOptions(ii.id)}</select></div>
   <fieldset ${ro?'disabled':''} class="stack">
   <label class="field">Descripción<textarea id="ei_d">${esc(ii.d)}</textarea></label>
   <label class="field">Imagen y derivación<textarea id="ei_img">${esc(ii.img)}</textarea></label>
   <label class="field">Prevención<textarea id="ei_prev">${esc(ii.prev)}</textarea></label>
   <label class="field">Criterios de retorno (uno por línea)<textarea id="ei_rts">${esc(ii.rts.join('\n'))}</textarea></label>
   <label class="field">Referencias (una por línea)<textarea id="ei_ref">${esc(ii.ref.join('\n'))}</textarea></label>
   <div class="grid2"><label class="field">Revisado por<input id="ei_by" value="${esc(rv.by||'')}" placeholder="Nombre y profesión"></label><label class="field">Fecha de revisión<input type="date" id="ei_date" value="${esc(rv.date||todayISO())}"></label></div>
   <label class="chk"><input type="checkbox" id="ei_ok" ${rv.ok?'checked':''}> Ficha revisada y aprobada</label>
   <div class="row"><button class="btn primary" type="submit">Guardar ficha</button>${Object.keys(o).length?'<button class="btn" type="button" data-act="ed-inj-reset">Restaurar original</button>':''}</div></fieldset></form>
  <form class="card" data-on="ed-ex"><div class="card-h"><span class="eyebrow">Ejercicio</span><select id="ed_ex" class="sel" data-on="ed-ex-sel">${Object.entries(EX).map(([k,x])=>`<option value="${k}" ${k===xid?'selected':''}>${esc(x.n)}</option>`).join('')}</select></div>
   <fieldset ${ro?'disabled':''} class="stack">
   <label class="field">Indicación técnica<textarea id="ee_c">${esc(EX[xid].c)}</textarea></label>
   ${LEVELS.map((l,i)=>`<label class="field">Vídeo ${l.n.toLowerCase()} (enlace o ID de YouTube, o enlace a vuestro vídeo)<input id="ee_v${i}" value="${esc((xo.vid||[])[i]||'')}" placeholder="${esc(vidFor(xid,i).url)}"></label>`).join('')}
   <div class="row"><button class="btn primary" type="submit">Guardar ejercicio</button>${Object.keys(xo).length?'<button class="btn" type="button" data-act="ed-ex-reset">Restaurar original</button>':''}</div></fieldset></form>`;
}
function saveOV(){
  try{localStorage.setItem('kinetrack.ov',JSON.stringify(OV))}catch(e){}
  applyOV();
  if(CL.db&&CL.uid&&CL.admin)CL.db.doc('contenido/override').set(JSON.parse(JSON.stringify(OV))).catch(handleErr);
}

/* ===================== Hojas: nuevo caso, datos, más ===================== */
function openSheet(html){$('#sheet_panel').innerHTML=html;$('#sheet').hidden=false;const f=$('#sheet_panel input:not([type=hidden]),#sheet_panel select,#sheet_panel button');if(f)f.focus()}
function closeSheet(){$('#sheet').hidden=true;$('#sheet_panel').innerHTML=''}
function consentSheet(then){
  UI.afterConsent=then;
  openSheet(`<div class="stack"><div><p class="eyebrow">Antes de crear un caso</p><h2>Aviso y consentimiento</h2></div>
  <p class="small">Kinetrack es una herramienta orientativa. No sustituye la valoración de un profesional sanitario. Tus datos de salud se guardan en este dispositivo y, si usas una cuenta, en la base de datos de esta app, visibles para ti y tus profesionales.</p>
  <label class="chk"><input type="checkbox" id="cs_1"> Entiendo que los resultados son orientativos.</label>
  <label class="chk"><input type="checkbox" id="cs_2"> Acepto que mis datos de salud se guarden como se describe.</label>
  <div class="row"><button class="btn" data-act="sheet-close">Cancelar</button><button class="btn primary" data-act="consent-ok">Aceptar y continuar</button></div><span id="cs_msg" class="small"></span></div>`);
}
function newCaseSheet(injId,pct){
  if(!S.settings.consent){consentSheet(()=>newCaseSheet(injId,pct));return}
  const inj=INJ_BY[injId]||INJ[0];const d=S.diag;
  const c={name:'',sport:d.sport||'',injuryId:inj.id,side:d.side||'der',g:inj.g.length===3?1:0,level:1,date:todayISO(),equip:['n','b','m','c'],days:[1,3,5]};
  openSheet(`<form data-on="new-form" data-pct="${pct||''}" data-src="${pct?'auto':'manual'}" class="stack">
   <div><p class="eyebrow">${pct?`Desde el diagnóstico automático · ${pct} %`:'Selección manual'}</p><h2>Nuevo programa</h2></div>
   ${caseFields(c,'nc')}
   <p class="small muted">${pct?'El diagnóstico es orientativo: regístralo como validado cuando lo confirme un profesional.':'Se marcará como selección manual hasta que añadas la validación profesional.'}</p>
   <div class="row"><button class="btn" type="button" data-act="sheet-close">Cancelar</button><button class="btn primary" type="submit">Crear programa</button></div></form>`);
}
function dataSheet(){
  const c=active();
  const json=JSON.stringify({app:'kinetrack',v:2,exported:new Date().toISOString(),cases:S.cases.map(cleanCase)},null,1);
  openSheet(`<div class="stack"><div><p class="eyebrow">Copias</p><h2>Exportar o importar</h2></div>
  <p class="small muted">Copia el texto (todos los casos) o descarga el archivo. Para enviar solo el caso activo, usa «Copiar solo este caso».</p>
  <label class="field">Exportar<textarea id="exp_txt" readonly class="mono">${esc(json)}</textarea></label>
  <div class="row"><button class="btn" data-act="copy-exp">Copiar todo</button>${c?'<button class="btn" data-act="copy-one">Copiar solo este caso</button>':''}<button class="btn" data-act="dl-json">Descargar .json</button></div>
  <label class="field">Importar<textarea id="imp_txt" placeholder="Pega aquí una copia exportada" class="mono"></textarea></label>
  <label class="field">o elige un archivo<input type="file" accept="application/json,.json" data-on="imp-file"></label>
  <div class="row"><button class="btn" data-act="imp-add">Añadir casos</button><button class="btn danger" data-act="imp-replace">Reemplazar todo</button><span id="imp_msg" class="small muted"></span></div>
  <div class="row end"><button class="btn primary" data-act="sheet-close">Cerrar</button></div></div>`);
}
function moreSheet(){
  openSheet(`<div class="stack"><h2>Más</h2>${VIEWS().filter(x=>!x.m).map(x=>`<button class="btn big left" data-act="go" data-v="${x.id}">${svgI(x.i)} ${x.n}${x.id==='panel'&&panelBadge()?` <span class="pill bad">${panelBadge()}</span>`:''}</button>`).join('')}<div class="row end"><button class="btn" data-act="sheet-close">Cerrar</button></div></div>`);
}

/* ===================== Acciones ===================== */
const toggle=(arr,k)=>{const i=arr.indexOf(k);i<0?arr.push(k):arr.splice(i,1)};
function refreshDiagOut(){const o=$('#diag_out');if(o)o.innerHTML=diagOut()}
function readCase(pf){
  return {name:$(`#${pf}_name`).value.trim()||'Sin nombre',sport:$(`#${pf}_sport`).value,injuryId:$(`#${pf}_inj`).value,side:$(`#${pf}_side`).value,g:+$(`#${pf}_g`).value,level:+$(`#${pf}_level`).value,date:$(`#${pf}_date`).value||todayISO(),
    equip:['n',...[...document.querySelectorAll(`[data-eq="${pf}"]:checked`)].map(i=>i.value)],days:[...document.querySelectorAll(`[data-day="${pf}"]:checked`)].map(i=>+i.value)};
}
function addLog(c,l,morning){c.logs.push(l);if(morning!=null)c.mornings[todayISO()===l.date?l.date:l.date]=morning}
function doImport(replace,text){
  const msg=$('#imp_msg');
  try{const d=JSON.parse(text??$('#imp_txt').value);const cs=Array.isArray(d)?d:d.cases?d.cases:d.id?[d]:null;if(!Array.isArray(cs)||!cs.length||!cs.every(c=>c&&INJ_BY[c.injuryId]&&c.date))throw 0;
    cs.forEach(c=>normCase(c));
    if(replace){S.cases.forEach(c=>{if(c.synced)cloudDelete(c.id)});S.cases=cs.map(c=>({...c,synced:false}))}else cs.forEach(c=>{c.id=uid();c.synced=false;c.example=false;S.cases.push(c)});
    S.active=S.cases[S.cases.length-1].id;S.cases.forEach(c=>cloudDirty(c));saveLocal();closeSheet();render();toast(`${cs.length} caso(s) importado(s)`);
  }catch(e){if(msg){msg.textContent='El texto no es una copia válida de Kinetrack.';msg.className='small bad-t'}}
}
function jumpTo(id){const el=document.getElementById(id);if(el){el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});el.setAttribute('tabindex','-1');el.focus({preventScroll:true})}}
const ACT={
 go:b=>{const v=b.dataset.v;closeSheet();if(v==='lesiones')UI.libSel=null;if(location.hash.replace('#','')===v)render();else location.hash=v;if(b.dataset.t)setTimeout(()=>jumpTo(b.dataset.t),60)},
 more:moreSheet,
 jump:b=>jumpTo(b.dataset.id),
 role:b=>{S.settings.role=b.dataset.v;saveLocal();render(true)},
 onboard:()=>{if(!S.settings.role||!S.settings._c1||!S.settings._c2)return;S.settings.onboarded=true;S.settings.consent={date:todayISO()};saveLocal();render();toast('Listo. Empieza por el diagnóstico o revisa el caso de ejemplo.')},
 'consent-ok':()=>{if(!$('#cs_1').checked||!$('#cs_2').checked){$('#cs_msg').textContent='Marca las dos casillas para continuar.';return}S.settings.consent={date:todayISO()};S.settings.onboarded=true;S.settings.role=S.settings.role||'atleta';saveLocal();const f=UI.afterConsent;UI.afterConsent=null;closeSheet();if(f)f()},
 view:b=>{S.diag.view=b.dataset.v;saveLocal();render(true)},
 side:b=>{S.diag.side=b.dataset.v;saveLocal();render(true)},
 zone:b=>{const z=b.dataset.z;if(S.diag.zone!==z){S.diag={...blankDiag(),zone:z,view:S.diag.view,side:S.diag.side,age:S.diag.age,sport:S.diag.sport,onset:S.diag.onset,prev:S.diag.prev,pain:S.diag.pain}}
   if(b.dataset.back&&BACK_SX[z]&&zoneLists(z).s.includes(BACK_SX[z])&&!S.diag.sx.includes(BACK_SX[z]))S.diag.sx.push(BACK_SX[z]);saveLocal();render(true)},
 mech:b=>{toggle(S.diag.mech,b.dataset.k);b.setAttribute('aria-pressed',S.diag.mech.includes(b.dataset.k));saveLocal();refreshDiagOut()},
 sx:b=>{toggle(S.diag.sx,b.dataset.k);b.setAttribute('aria-pressed',S.diag.sx.includes(b.dataset.k));saveLocal();refreshDiagOut()},
 rf:b=>{toggle(S.diag.rf,b.dataset.k);b.setAttribute('aria-pressed',S.diag.rf.includes(b.dataset.k));saveLocal();refreshDiagOut()},
 'test-res':b=>{const t=S.diag.tests;t[b.dataset.id]=t[b.dataset.id]===b.dataset.v?'':b.dataset.v;saveLocal();refreshDiagOut();const el=document.querySelector(`[data-act="test-res"][data-id="${b.dataset.id}"][data-v="${b.dataset.v}"]`);if(el)el.focus()},
 'diag-reset':()=>{S.diag={...blankDiag(),side:S.diag.side,view:S.diag.view};saveLocal();render()},
 'open-lib':b=>{UI.libSel=b.dataset.id;if(curView()==='lesiones')render();else location.hash='lesiones';window.scrollTo(0,0)},
 'lib-back':()=>{UI.libSel=null;render()},
 'lib-zone':b=>{UI.libZone=b.dataset.z;render(true)},
 'open-test':b=>{UI.testSel=b.dataset.id;UI.testZone='all';UI.testQ='';if(curView()==='pruebas')render();else location.hash='pruebas'},
 'test-zone':b=>{UI.testZone=b.dataset.z;UI.testSel=null;render(true)},
 'ex-type':b=>{UI.exType=b.dataset.k;render(true)},
 'new-case':b=>newCaseSheet(b.dataset.id,b.dataset.p?+b.dataset.p:null),
 'new-case-manual':()=>newCaseSheet($('#man_inj').value,null),
 'new-case-blank':()=>newCaseSheet(S.diag.zone?(INJ.find(i=>i.z.includes(S.diag.zone))||INJ[0]).id:INJ[0].id,null),
 'pick-level':b=>{const pf=b.dataset.pf;document.getElementById(pf+'_level').value=b.dataset.l;b.parentNode.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b))},
 'sheet-close':closeSheet,
 'set-level':b=>{const c=active();c.level=+b.dataset.l;save(c);render(true);toast(`Nivel: ${LEVELS[c.level].n}`)},
 'view-phase':b=>{const c=active();const p=+b.dataset.p;UI.viewPhase=p===c.phase?null:p;render(true)},
 'ex-done':b=>{const c=active();const k=todayISO();c.done[k]=c.done[k]||[];toggle(c.done[k],b.dataset.id);if(!c.done[k].length)delete c.done[k];save(c);render(true)},
 hurts:b=>{const c=active();const orig=b.dataset.id;const cur=(c.swaps[orig])||orig;const ex=eff(c).inj.ph[c.phase].ex;if(!c.painful.includes(cur))c.painful.push(cur);const a=altFor(cur,c,ex,c.painful);if(a){c.swaps[orig]=a;save(c);render(true);toast(`Cambiado por: ${EX[a].n}`)}else{save(c);toast('No hay alternativa con tu material. Coméntalo con tu profesional.')}},
 'phase-adv':()=>{const c=active();const e=evaluate(c);if(e.needApproval&&!isPro()){toast('Este avance necesita la aprobación de tu profesional.');return}if(c.phase<3){c.phase++;c.phaseStart=todayISO();c.hist.push({d:todayISO(),t:`Avance ${e.all?'':'manual sin todos los criterios '}a la fase ${c.phase+1}`});UI.viewPhase=null;save(c);render();toast(`Fase ${c.phase+1}`)}},
 'phase-back':()=>{const c=active();if(c.phase>0){c.phase--;c.phaseStart=todayISO();c.hist.push({d:todayISO(),t:`Retroceso a la fase ${c.phase+1}`});UI.viewPhase=null;save(c);render()}},
 approve:()=>{const c=active();c.pro=c.pro||{};c.pro.approved=c.phase+1;c.hist.push({d:todayISO(),t:`Aprobado el paso a la fase ${c.phase+2}`});save(c);render()},
 morning:b=>{const c=active();c.mornings[todayISO()]=+b.dataset.v;save(c);render(true);toast('Dolor al levantarte registrado')},
 'morning-clear':()=>{const c=active();delete c.mornings[todayISO()];save(c);render()},
 'edit-open':()=>{UI.editOpen=true;render()},
 'edit-close':()=>{UI.editOpen=false;render()},
 'case-del':()=>{UI.confirmDel=true;render()},
 'case-del-no':()=>{UI.confirmDel=false;render()},
 'case-del-yes':()=>{const id=S.active;const c=active();if(c&&c.synced)cloudDelete(id);S.cases=S.cases.filter(c=>c.id!==id);S.active=S.cases[0]?S.cases[0].id:null;UI.confirmDel=false;saveLocal();schedSummary();render();toast('Caso borrado')},
 'case-open':b=>{S.active=b.dataset.id;saveLocal();location.hash='programa'},
 'pat-open':b=>openPatient(b.dataset.id),
 'pat-close':()=>{UI.panelSel=null;render()},
 'pro-clear':()=>{const c=active();c.pro=null;c.hist.push({d:todayISO(),t:'Validación profesional retirada'});save(c);render()},
 'log-del':b=>{const c=active();c.logs=c.logs.filter(l=>l.id!==b.dataset.id);save(c);render()},
 'meas-del':b=>{const c=active();c.meas=c.meas.filter(m=>m.id!==b.dataset.id);save(c);render(true)},
 'scale-open':()=>{UI.scaleOpen=true;render()},
 'scale-close':()=>{UI.scaleOpen=false;render()},
 'scale-del':b=>{const c=active();c.scales=c.scales.filter(s=>s.id!==b.dataset.id);save(c);render(true)},
 'session-start':sessionStart,
 'ses-set':()=>setDone(),
 'ses-timer':b=>startTimer('work',+b.dataset.v),
 'ses-skip':()=>{SES.timer=null;clearInterval(SES_TICK);renderSession()},
 'ses-stop':()=>{SES.timer=null;clearInterval(SES_TICK);setDone()},
 'ses-pain':b=>{curItem().pain=+b.dataset.v;renderSession()},
 'ses-prev':()=>{if(SES.i>0){SES.i--;SES.timer=null;clearInterval(SES_TICK);renderSession()}},
 'ses-next':()=>{SES.timer=null;clearInterval(SES_TICK);if(SES.i<SES.items.length-1)SES.i++;else SES.end=true;renderSession();$('#session_panel').scrollTop=0},
 'ses-back':()=>{SES.end=false;renderSession()},
 'ses-hurts':()=>{const c=active();const it=curItem();if(!c.painful.includes(it.id))c.painful.push(it.id);const a=altFor(it.id,c,eff(c).inj.ph[c.phase].ex,c.painful);if(a){c.swaps[it.orig]=a;SES.items[SES.i]=sesItem(c,{id:a,orig:it.orig});save(c);renderSession();toast(`Cambiado por: ${EX[a].n}`)}else toast('No hay alternativa con tu material: para este ejercicio hoy.')},
 'ses-exit':()=>{SES.confirmExit=true;renderSession()},
 'ses-exit-no':()=>{SES.confirmExit=false;renderSession()},
 'ses-exit-yes':sessionClose,
 'ses-save':()=>{const c=S.cases.find(x=>x.id===SES.cid);const items=SES.items.filter(it=>it.sets.some(s=>s.done)).map(it=>({id:it.id,pain:it.pain,sets:it.sets.filter(s=>s.done).map(s=>({kg:num(s.kg)||0,reps:num(s.reps)||0,secs:num(s.secs)||0}))}));
   const dur=Math.max(1,Math.round((Date.now()-SES.start)/60000));const comp=Math.round(100*items.length/SES.items.length);const pain=Math.max(0,...items.map(i=>i.pain??0));const flags=[...document.querySelectorAll('[data-sflag]:checked')].map(i=>i.dataset.sflag);
   const t=todayISO();c.sessions.push({id:uid(),date:t,dur,rpe:SES.rpe,comp,items});c.logs.push({id:uid(),date:t,during:pain,comp,rpe:SES.rpe,notes:SES.notes,flags});c.done[t]=[...new Set([...(c.done[t]||[]),...items.map(i=>i.id)])];
   save(c);sessionClose();toast('Sesión guardada');if(flags.length)location.hash='programa'},
 data:dataSheet,
 'copy-exp':b=>copyText($('#exp_txt').value,b),
 'copy-one':b=>{const c=active();copyText(JSON.stringify({app:'kinetrack',v:2,cases:[cleanCase(c)]}),b)},
 'dl-json':()=>saveFile(`kinetrack-${todayISO()}.json`,new Blob([JSON.stringify({app:'kinetrack',v:2,exported:new Date().toISOString(),cases:S.cases.map(cleanCase)},null,1)],{type:'application/json'})),
 'imp-add':()=>doImport(false),'imp-replace':()=>doImport(true),
 report:()=>{const c=active();if(c){toast('Generando informe…');makeReport(c)}},
 'report-remote':()=>{const [pid,cid]=UI.panelSel.split('|');const c=CL.sel&&CL.sel.cases.find(x=>x.id===cid);if(c){c._rev=CL.sel.rev[cid]||null;toast('Generando informe…');makeReport(c)}},
 'set-tab':b=>{UI.setTab=b.dataset.v;render(true)},
 wipe:()=>{UI.confirmWipe=true;render()},
 'wipe-no':()=>{UI.confirmWipe=false;render()},
 'wipe-yes':()=>{S.cases.forEach(c=>{if(c.synced)cloudDelete(c.id)});S.cases=[];S.active=null;S.settings.consent=null;S.settings.onboarded=false;S.settings._c1=S.settings._c2=false;UI.confirmWipe=false;saveLocal();schedSummary();render();toast('Datos borrados')},
 'restore-example':()=>{const c=seed();S.cases.push(c);S.active=c.id;saveLocal();location.hash='programa';toast('Caso de ejemplo añadido')},
 'sync-now':()=>{S.cases.forEach(c=>{if(!c.example)pushCase(c)});schedSummary();toast('Sincronizando…')},
 'notif-perm':()=>{try{Notification.requestPermission().then(()=>{render();scheduleReminders()})}catch(e){}},
 ics:()=>{const c=active();if(!c){toast('Elige un caso primero');return}saveFile(`kinetrack-${todayISO()}.ics`,new Blob([icsFor(c)],{type:'text/calendar'}))},
 'ed-inj-reset':()=>{const id=$('#ed_inj').value;delete OV.inj[id];saveOV();render();toast('Ficha restaurada')},
 'ed-ex-reset':()=>{const id=$('#ed_ex').value;delete OV.ex[id];saveOV();render();toast('Ejercicio restaurado')},
 install:()=>{if(window._bip){window._bip.prompt();window._bip=null;$('#install_btn').hidden=true}}
};
function copyText(t,b){const done=()=>{b.textContent='Copiado'};try{navigator.clipboard.writeText(t).then(done,()=>{const ta=$('#exp_txt');if(ta){ta.value=t;ta.select()}b.textContent='Texto seleccionado'})}catch(e){const ta=$('#exp_txt');if(ta){ta.value=t;ta.select()}b.textContent='Texto seleccionado'}}

document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const f=ACT[b.dataset.act];if(f){e.preventDefault();f(b,e)}});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(!$('#sheet').hidden)closeSheet();else if(SES){SES.confirmExit=true;renderSession()}}
  const t=e.target;if((e.key==='Enter'||e.key===' ')&&t.matches&&t.matches('[data-act]:not(button):not(a):not(input)')){e.preventDefault();t.dispatchEvent(new MouseEvent('click',{bubbles:true}))}
});
function scLive(){
  const sel=$('#sc_sel');if(!sel)return;const d=SCALES[sel.value];const vals={};
  document.querySelectorAll('[data-sc]').forEach(i=>{const k=i.dataset.sc;vals[k]=vals[k]||[];vals[k][+i.dataset.i]=i.value===''?null:clamp(num(i.value)??0,+i.dataset.min,+i.dataset.max)});
  const sc=scaleScore({k:sel.value,vals,total:$('#sc_total')&&$('#sc_total').value});
  const o=$('#sc_live');if(o)o.innerHTML=sc?`Resultado: <b class="num">${sc.total}</b>${sc.subs?' · '+Object.entries(sc.subs).map(([k,v])=>esc((d.subs.find(s=>s.k===k)||{}).n)+' '+v).join(', '):''}`:'Completa los ítems para ver el resultado.';
  return {vals,sc};
}
document.addEventListener('input',e=>{const t=e.target;const on=t.dataset&&t.dataset.on;if(!on)return;
 if(on==='age'){S.diag.age=t.value;saveLocal();refreshDiagOut()}
 else if(on==='dpain'){S.diag.pain=t.value;saveLocal();refreshDiagOut()}
 else if(on==='lib-q'){UI.libQ=t.value;$('#lib_list').innerHTML=libList()}
 else if(on==='test-q'){UI.testQ=t.value;UI.testSel=null;$('#test_list').innerHTML=testList()}
 else if(on==='rng'){const o=document.getElementById('o_'+t.id);if(o)o.textContent=t.value}
 else if(on==='ses-rpe'){SES.rpe=+t.value;$('#o_ses_rpe').textContent=t.value}
 else if(on==='ses-notes'){SES.notes=t.value}
 else if(on==='ses-in'){const it=curItem();it.sets[+t.dataset.i][t.dataset.k]=t.value}
 else if(on==='sc-live'){scLive()}
 else if(on==='ob'){S.settings._c1=$('#ob_c1').checked;S.settings._c2=$('#ob_c2').checked;saveLocal();const b=document.querySelector('[data-act="onboard"]');if(b)b.disabled=!(S.settings.role&&S.settings._c1&&S.settings._c2)}
});
document.addEventListener('change',e=>{const t=e.target;const on=t.dataset&&t.dataset.on;if(!on)return;
 if(on==='case-sel'){if(t.value==='__new'){t.value=S.active||'';newCaseSheet(S.diag.zone?(INJ.find(i=>i.z.includes(S.diag.zone))||INJ[0]).id:INJ[0].id,null)}else{S.active=t.value;UI.viewPhase=null;UI.editOpen=false;UI.confirmDel=false;UI.scaleOpen=false;saveLocal();render()}}
 else if(on==='dsel'){S.diag[t.dataset.k]=t.value;saveLocal();refreshDiagOut()}
 else if(on==='dprev'){S.diag.prev=t.checked;saveLocal();refreshDiagOut()}
 else if(on==='ob'){S.settings._c1=$('#ob_c1').checked;S.settings._c2=$('#ob_c2').checked;saveLocal();const b=document.querySelector('[data-act="onboard"]');if(b)b.disabled=!(S.settings.role&&S.settings._c1&&S.settings._c2)}
 else if(on==='crit'){const c=active();const p=+t.dataset.p;c.crit[p]=c.crit[p]||[];c.crit[p][+t.dataset.i]=t.checked;save(c);render(true)}
 else if(on==='auto'){const c=active();c.auto=t.checked;save(c);render();toast(c.auto?'Avance automático activado':'Modo manual')}
 else if(on==='inj-pick'){const pf=t.dataset.pf;const inj=INJ_BY[t.value];$(`#${pf}_g`).innerHTML=inj.g.map((g,i)=>`<option value="${i}" ${i===(inj.g.length===3?1:0)?'selected':''}>${esc(g.n)} · ${fmtW(cum(g.w)[4])}</option>`).join('')}
 else if(on==='pro-dx'){const inj=INJ_BY[t.value];$('#pro_g').innerHTML=inj.g.map((g,i)=>`<option value="${i}">${esc(g.n)}</option>`).join('')}
 else if(on==='rv-dx'){const inj=INJ_BY[t.value];$('#rv_g').innerHTML=inj.g.map((g,i)=>`<option value="${i}">${esc(g.n)}</option>`).join('')}
 else if(on==='meas-sel'){UI.measSel=t.value;render(true)}
 else if(on==='load-sel'){UI.loadSel=t.value;render(true)}
 else if(on==='scale-sel'){UI.scaleSel=t.value;render(true)}
 else if(on==='ed-inj-sel'){UI.edInj=t.value;render(true)}
 else if(on==='ed-ex-sel'){UI.edEx=t.value;render(true)}
 else if(on==='imp-file'){const f=t.files&&t.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('#imp_txt').value=String(r.result)};r.readAsText(f)}
 else if(on==='upvid'){const f=t.files&&t.files[0];if(!f||!CL.assets)return;if(f.size>20*1024*1024){toast('El vídeo supera 20 MB. Graba un clip más corto.');return}
   const type=f.type==='video/quicktime'?null:f.type;if(!type){toast('Usa un vídeo MP4 o WebM.');return}
   toast('Subiendo vídeo…');CL.assets.upload(f,{type}).then(r=>{const c=active();c.videos.push({id:r.id,ex:t.dataset.id,date:todayISO()});save(c);render(true);toast('Vídeo subido: tu profesional lo verá en su panel')}).catch(err=>toast(err&&err.code==='too_large'?'El vídeo es demasiado grande.':err&&err.code==='unsupported_type'?'Formato no admitido: usa MP4 o WebM.':'No se pudo subir el vídeo.'))}
});
document.addEventListener('submit',e=>{const f=e.target;const on=f.dataset&&f.dataset.on;if(!on)return;e.preventDefault();
 if(on==='new-form'){const d=readCase('nc');const c=normCase({id:uid(),...d,src:f.dataset.src,autoPct:f.dataset.pct?+f.dataset.pct:null,phase:0,phaseStart:d.date,auto:true,crit:{},logs:[],done:{},meas:[],scales:[],sessions:[],pro:null,hist:[{d:todayISO(),t:'Caso creado'}]});S.cases.push(c);S.active=c.id;UI.viewPhase=null;save(c);closeSheet();if(curView()==='programa')render();else location.hash='programa';toast('Programa creado')}
 else if(on==='edit-form'){const c=active();const d=readCase('ed');const changed=d.injuryId!==c.injuryId;Object.assign(c,d);if(changed){c.phase=0;c.phaseStart=todayISO();c.crit={};c.swaps={};c.src='manual';c.hist.push({d:todayISO(),t:'Lesión cambiada manualmente; fase reiniciada'})}c.example=false;UI.editOpen=false;save(c);render();toast('Caso actualizado')}
 else if(on==='pro-form'){const c=active();const prevEff=eff(c).inj.id;const dx=$('#pro_dx').value;const swaps={};f.querySelectorAll('[data-swap]').forEach(s=>{if(s.value)swaps[s.dataset.swap]=s.value});
   c.pro={name:$('#pro_name').value.trim(),spec:$('#pro_spec').value,dx,g:+$('#pro_g').value,date:$('#pro_date').value,img:$('#pro_img').value.trim(),notes:$('#pro_notes').value.trim(),lock:$('#pro_lock').checked,approved:(c.pro&&c.pro.approved)||null,swaps,prevDx:c.injuryId};
   if(dx!==prevEff){c.phase=0;c.phaseStart=todayISO();c.crit={};c.hist.push({d:todayISO(),t:`Diagnóstico profesional: ${INJ_BY[dx].n}; fase reiniciada`})}else c.hist.push({d:todayISO(),t:'Diagnóstico validado por profesional'});
   save(c);render();toast('Validación guardada')}
 else if(on==='rev-form'){const [pid,cid]=UI.panelSel.split('|');const swaps={};f.querySelectorAll('[data-swap]').forEach(s=>{if(s.value)swaps[s.dataset.swap]=s.value});const c=CL.sel.cases.find(x=>x.id===cid);
   const r={dx:$('#rv_dx').value,g:+$('#rv_g').value,name:$('#rv_name').value.trim(),img:$('#rv_img').value.trim(),notes:$('#rv_notes').value.trim(),lock:$('#rv_lock').checked,approved:$('#rv_appr')&&$('#rv_appr').checked?c.phase+1:((CL.sel.rev[cid]||{}).approved??null),swaps,by:CL.uid,date:todayISO(),updatedAt:Date.now()};
   CL.db.doc(`pacientes/${pid}/revision/${cid}`).set(r).then(()=>toast('Revisión guardada; el paciente la verá en su programa')).catch(handleErr)}
 else if(on==='msg-form'){const inp=f.querySelector('input');const text=inp.value.trim();if(!text||!CL.db)return;const who=f.dataset.who;
   let path,caseId=null;if(who==='pro'){const [pid,cid]=UI.panelSel.split('|');path=`pacientes/${pid}/mensajes`;caseId=cid}else{path=CBASE()+'/mensajes';caseId=S.active}
   CL.db.collection(path).add({from:CL.uid,pro:who==='pro',text,ts:Date.now(),caseId}).then(()=>{inp.value=''}).catch(handleErr)}
 else if(on==='log-form'){const c=active();const flags=[...f.querySelectorAll('[data-flag]:checked')].map(i=>i.dataset.flag);const date=$('#lg_date').value||todayISO();
   c.logs.push({id:uid(),date,during:+$('#lg_during').value,comp:clamp(+$('#lg_comp').value||0,0,100),rpe:+$('#lg_rpe').value,notes:$('#lg_notes').value.trim(),flags});c.mornings[date]=+$('#lg_morning').value;save(c);render();toast(flags.length?'Registro guardado con señal de alarma':'Registro guardado')}
 else if(on==='hop-form'){const c=active();let n=0;MEAS.filter(m=>m.hop).forEach(m=>{const a=num($(`#hop_${m.k}_a`).value),b=num($(`#hop_${m.k}_b`).value);if(a>0&&b>0){c.meas.push({id:uid(),date:todayISO(),k:m.k,a,b});n++}});if(!n){toast('Introduce los valores de ambas piernas.');return}save(c);render();toast(`${n} prueba(s) de salto guardadas`)}
 else if(on==='meas-form'){const c=active();const k=$('#ms_k').value;const md=MEAS_BY[k];const a=num($('#ms_a').value),b=md.single?null:num($('#ms_b').value);if(a==null||(!md.single&&b==null)){toast('Introduce valores numéricos.');return}c.meas.push({id:uid(),date:$('#ms_date').value||todayISO(),k,a,b});UI.measSel=k;save(c);render(true);toast('Medición añadida')}
 else if(on==='scale-form'){const c=active();const k=$('#sc_sel').value;const r=scLive();if(!r||!r.sc){toast('Faltan ítems para calcular el resultado.');return}c.scales.push({id:uid(),date:todayISO(),k,vals:r.vals,total:$('#sc_total')?$('#sc_total').value:null});UI.scaleOpen=false;save(c);render();toast(`${SCALES[k].n}: ${r.sc.total}`)}
 else if(on==='rem-form'){S.settings.remind={on:$('#rm_on').checked,morning:$('#rm_m').value||'08:00',session:$('#rm_s').value||'18:00'};saveLocal();scheduleReminders();toast('Recordatorios guardados')}
 else if(on==='ed-inj'){const id=$('#ed_inj').value;const lines=v=>v.split('\n').map(x=>x.trim()).filter(Boolean);OV.inj=OV.inj||{};
   OV.inj[id]={d:$('#ei_d').value.trim(),img:$('#ei_img').value.trim(),prev:$('#ei_prev').value.trim(),rts:lines($('#ei_rts').value),ref:lines($('#ei_ref').value),rev:{by:$('#ei_by').value.trim(),date:$('#ei_date').value,ok:$('#ei_ok').checked}};saveOV();render(true);toast('Ficha guardada')}
 else if(on==='ed-ex'){const id=$('#ed_ex').value;OV.ex=OV.ex||{};const vid=[0,1,2].map(i=>$('#ee_v'+i).value.trim());OV.ex[id]={c:$('#ee_c').value.trim(),vid:vid.some(Boolean)?vid:null};saveOV();render(true);toast('Ejercicio guardado')}
});
window.addEventListener('hashchange',()=>{closeSheet();render();window.scrollTo(0,0);if(curView()==='panel'&&!isPro()){S.settings.msgSeen=Date.now();saveLocal()}});
if(IS_PWA){window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window._bip=e;$('#install_btn').hidden=false})}
render();
cloudInit();
scheduleReminders();
