
/* ===================== Utilidades ===================== */
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,10);
const isoOf=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
const todayISO=()=>isoOf(new Date());
const addDays=(iso,n)=>{const d=new Date(iso+'T00:00:00');d.setDate(d.getDate()+Math.round(n));return isoOf(d)};
const daysBetween=(a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5);
const fmtD=iso=>{try{return new Date(iso+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'})}catch(e){return iso}};
const fmtShort=iso=>{try{return new Date(iso+'T00:00:00').toLocaleDateString('es',{day:'numeric',month:'short'})}catch(e){return iso}};
const fmtW=w=>w<1?`${Math.round(w*7)} días`:`${+w.toFixed(1)} sem`;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const byDate=(a,b)=>a.date<b.date?-1:a.date>b.date?1:0;
const num=v=>{const n=parseFloat(String(v).replace(',','.'));return isFinite(n)?n:null};
const DOW=['D','L','M','X','J','V','S'];
const DOWN=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function toast(t){const el=$('#toast');if(!el)return;el.textContent=t;el.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>el.hidden=true,2800)}

/* ===================== Contenido editable (overrides) ===================== */
const BASE_INJ=Object.fromEntries(INJ.map(i=>[i.id,{d:i.d,img:i.img,prev:i.prev,rts:i.rts.slice(),ref:i.ref.slice()}]));
const BASE_EX=Object.fromEntries(Object.entries(EX).map(([k,x])=>[k,{c:x.c}]));
let OV={inj:{},ex:{}};
function applyOV(){
  INJ.forEach(i=>{const b=BASE_INJ[i.id],o=(OV.inj||{})[i.id]||{};i.d=o.d??b.d;i.img=o.img??b.img;i.prev=o.prev??b.prev;i.rts=o.rts??b.rts;i.ref=o.ref??b.ref;i.rev=o.rev||null});
  Object.keys(EX).forEach(k=>{const o=(OV.ex||{})[k]||{};EX[k].c=o.c??BASE_EX[k].c;EX[k].vid=o.vid||null});
}
try{const r=localStorage.getItem('kinetrack.ov');if(r)OV=JSON.parse(r)}catch(e){}
applyOV();

const INJ_BY=Object.fromEntries(INJ.map(i=>[i.id,i]));
const T_BY=Object.fromEntries(TESTS.map(t=>[t.id,t]));
const ZN=Object.fromEntries(ZONES.map(z=>[z.id,z.n]));
const GROUP_OF={};Object.entries(GROUPS).forEach(([g,l])=>l.forEach(id=>{GROUP_OF[id]=GROUP_OF[id]||g}));
const phaseName=(inj,i)=>(inj.pn&&inj.pn[i])||PHASES[i];
const SIDES={izq:'Izquierdo',der:'Derecho',ambos:'Ambos lados',centro:'Central'};

/* ===================== Vídeos ===================== */
function ytId(v){if(!v)return null;const m=String(v).match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/);return m?m[1]:/^[\w-]{11}$/.test(v)?v:null}
function vidFor(id,lv){
  const x=EX[id];
  if(x.vid&&x.vid[lv]){const v=x.vid[lv];const y=ytId(v);return {url:y?'https://www.youtube.com/watch?v='+y:v,ver:true,own:true}}
  const v=VID[id];
  if(v){const k=Array.isArray(v)?v[lv]:v;return {url:'https://www.youtube.com/watch?v='+k,ver:true,en:VID_EN.has(k)}}
  const q=[x.n,x.v[lv],x.t==='conc'?'conmoción retorno gradual':'ejercicio fisioterapia','español'].filter(Boolean).join(' ');
  return {url:'https://www.youtube.com/results?search_query='+encodeURIComponent(q),ver:false};
}
function vidLink(id,lv){const v=vidFor(id,lv);return `<a class="vid ${v.ver?'ver':''}" href="${esc(v.url)}" target="_blank" rel="noopener">${v.ver?(v.own?'▶ Vídeo del equipo':'▶ Vídeo de referencia'):'Buscar vídeo'}${v.en?' <span class="en" title="Vídeo en inglés">EN</span>':''}</a>`}

/* ===================== Estado ===================== */
const KEY='kinetrack.v2';
function normCase(c){
  c.side=c.side||'der';c.logs=c.logs||[];c.crit=c.crit||{};c.done=c.done||{};c.hist=c.hist||[];c.meas=c.meas||[];c.scales=c.scales||[];
  c.sessions=c.sessions||[];c.swaps=c.swaps||{};c.painful=c.painful||[];c.videos=c.videos||[];c.mornings=c.mornings||{};
  c.equip=c.equip||['n','b','m','c'];c.days=c.days||[1,3,5];c.phaseStart=c.phaseStart||c.date;c.auto=c.auto!==false;c.level=+c.level||0;c.g=+c.g||0;c.phase=+c.phase||0;
  c.updatedAt=c.updatedAt||Date.now();
  c.logs.forEach(l=>{if(l.morning!=null&&c.mornings[l.date]==null)c.mornings[l.date]=l.morning;delete l.morning;l.flags=l.flags||[]});
  if(c.hop){const map={single:'hop_single',triple:'hop_triple',cross:'hop_cross',timed:'hop_6m',str:'quad'};Object.entries(c.hop).forEach(([k,v])=>{const a=num(v.a),b=num(v.b);if(a&&b&&map[k])c.meas.push({id:uid(),date:todayISO(),k:map[k],a,b})});delete c.hop}
  return c;
}
function seed(){
  const id=uid();const date=addDays(todayISO(),-17);
  const c={id,example:true,name:'Ejemplo · Lucía M.',sport:'futbol',injuryId:'esguince_lat',side:'der',g:1,level:1,date,src:'auto',autoPct:64,phase:1,phaseStart:addDays(todayISO(),-7),auto:true,
    crit:{0:[true,true]},logs:[],mornings:{},done:{},meas:[],scales:[],sessions:[],swaps:{},painful:[],videos:[],equip:['n','b','c'],days:[1,3,5],pro:null,hist:[{d:addDays(todayISO(),-7),t:'Avance a la fase 2 (criterios cumplidos)'}]};
  [[-14,6,4,70,6],[-12,5,4,80,6],[-10,4,3,90,5],[-8,3,3,100,5],[-6,4,2,100,6],[-4,3,2,100,5],[-2,2,2,100,5]].forEach(([d,du,mo,co,rpe])=>{const dt=addDays(todayISO(),d);c.logs.push({id:uid(),date:dt,during:du,comp:co,rpe,notes:'',flags:[]});c.mornings[addDays(dt,1)]=mo});
  c.logs[3].notes='Primer día sin muleta.';
  c.meas.push({id:uid(),date:addDays(todayISO(),-9),k:'dorsi',a:7,b:11},{id:uid(),date:addDays(todayISO(),-2),k:'dorsi',a:9.5,b:11},{id:uid(),date:addDays(todayISO(),-2),k:'calf_reps',a:14,b:25},{id:uid(),date:addDays(todayISO(),-2),k:'balance',a:22,b:30});
  c.sessions.push({id:uid(),date:addDays(todayISO(),-4),dur:32,rpe:5,comp:100,items:[{id:'calf_raise',pain:2,sets:[{kg:0,reps:10},{kg:0,reps:10},{kg:0,reps:9}]}]},{id:uid(),date:addDays(todayISO(),-2),dur:35,rpe:5,comp:100,items:[{id:'calf_raise',pain:2,sets:[{kg:4,reps:10},{kg:4,reps:10},{kg:4,reps:10}]}]});
  c.scales.push({id:uid(),date:addDays(todayISO(),-10),k:'faam',vals:{avd:Array(21).fill(2),deporte:Array(8).fill(1)}},{id:uid(),date:addDays(todayISO(),-2),k:'faam',vals:{avd:Array(21).fill(3),deporte:Array(8).fill(2)}});
  return normCase(c);
}
function blankDiag(){return {zone:null,view:'front',side:'der',mech:[],sx:[],rf:[],age:'',sport:'',onset:'',prev:false,pain:'',tests:{}}}
function load(){
  try{const r=localStorage.getItem(KEY);if(r){const s=JSON.parse(r);if(s&&Array.isArray(s.cases)){s.cases.forEach(normCase);return s}}}catch(e){}
  let cases=[seed()],active=cases[0].id;
  try{const r=localStorage.getItem('kinetrack.v1');if(r){const o=JSON.parse(r);if(o&&Array.isArray(o.cases)&&o.cases.length){cases=o.cases.map(normCase);active=o.active||cases[0].id}}}catch(e){}
  return {v:2,settings:{role:null,consent:null,onboarded:false,remind:{on:false,session:'18:00',morning:'08:00'}},active,diag:blankDiag(),cases};
}
let S=load();
S.diag=Object.assign(blankDiag(),S.diag||{});
S.settings=Object.assign({role:null,consent:null,onboarded:false,remind:{on:false,session:'18:00',morning:'08:00'}},S.settings||{});
function saveLocal(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function save(c){saveLocal();if(c&&typeof cloudDirty==='function')cloudDirty(c)}
const UI={libSel:null,libZone:'all',libQ:'',testSel:null,testZone:'all',testQ:'',exType:'all',viewPhase:null,editOpen:false,confirmDel:false,measSel:null,loadSel:null,scaleSel:null,scaleOpen:false,panelSel:null,setTab:'perfil',edInj:null,edEx:null,more:false};
const active=()=>S.cases.find(c=>c.id===S.active)||null;

/* ===================== Motor de diagnóstico ===================== */
function zoneLists(z){
  const inj=INJ.filter(i=>i.z.includes(z));
  const m=Object.keys(MECH).filter(k=>inj.some(i=>i.mech[k]));
  const s=Object.keys(SX).filter(k=>inj.some(i=>i.sx[k]));
  const r=RED.filter(f=>f.z==='all'||f.z.includes(z));
  return {inj,m,s,r};
}
function rawScore(i,d){
  const a=parseInt(d.age,10);let score=0,max=0;const hits=[];
  const maxM=Math.max(...Object.values(i.mech));let bestM=0;
  d.mech.forEach(m=>{if(i.mech[m]){bestM=Math.max(bestM,i.mech[m]);hits.push(MECH[m])}});
  score+=bestM;max+=maxM;
  const sw=Object.values(i.sx).sort((x,y)=>y-x);
  d.sx.forEach(s=>{if(i.sx[s]){score+=i.sx[s];hits.push(SX[s])}else score-=0.75});
  const n=Math.max(1,Math.min(d.sx.length,sw.length));max+=sw.slice(0,n).reduce((p,q)=>p+q,0);
  if(i.age){max+=2;if(a>=i.age[0]&&a<=i.age[1]){score+=2;hits.push(`Edad compatible (${i.age[0]}–${i.age[1]} años)`)}else if(a)score-=4;else score-=1}
  let s=Math.max(0,score/max);
  const sp=d.sport&&SPORTS[d.sport]&&SPORTS[d.sport].p[i.id];if(sp){s*=sp;hits.push('Frecuente en '+SPORTS[d.sport].n.toLowerCase())}
  if(d.onset==='aguda'){if(i.kind==='a')s*=1.25;else if(i.kind==='o')s*=0.6}
  if(d.onset==='persistente'){if(i.kind==='o')s*=1.25;else if(i.kind==='a')s*=0.7}
  if(d.prev&&RECUR[i.id]){s*=RECUR[i.id];hits.push('Suele repetirse')}
  return {s:Math.min(1.2,s),hits};
}
function parseSE(v){const n=parseFloat(String(v).replace(/[^\d.]/g,''));return isFinite(n)&&n>0?clamp(n/100,0.05,0.99):null}
function testAcc(t){const s=parseSE(t.s),e=parseSE(t.e);return {s:s??0.7,e:e??0.7,known:s!=null&&e!=null}}
function diagnose(d){
  d=d||S.diag;if(!d.zone)return {list:[],other:0,tested:false};
  const cands=INJ.filter(i=>i.z.includes(d.zone)).map(i=>{const r=rawScore(i,d);return {inj:i,raw:r.s,hits:r.hits}});
  const anyInput=d.mech.length||d.sx.length;
  let w=cands.map(c=>anyInput?Math.pow(c.raw,2):1);
  const tot=w.reduce((a,b)=>a+b,0)||1;
  let probs=w.map(x=>0.9*x/tot);let other=0.1;
  const entries=Object.entries(d.tests||{}).filter(([k,v])=>v&&T_BY[k]);
  entries.forEach(([tid,res])=>{
    const {s,e}=testAcc(T_BY[tid]);
    const lt=res==='+'?s:1-s, lo=res==='+'?1-e:e;
    probs=probs.map((p,i)=>p*(cands[i].inj.tests.includes(tid)?lt:lo));other*=lo;
  });
  const z=probs.reduce((a,b)=>a+b,0)+other;
  probs=probs.map(p=>p/z);other/=z;
  const list=cands.map((c,i)=>({...c,p:probs[i]})).filter(c=>c.raw>0||!anyInput).sort((a,b)=>b.p-a.p).slice(0,6);
  return {list,other,tested:entries.length>0};
}
function alarms(){
  const {zone,sx,rf}=S.diag;const out=[];
  RED.forEach(f=>{if(rf.includes(f.id))out.push({k:'bad',t:f.t,m:f.m})});
  const has=k=>sx.includes(k);
  if((zone==='tobillo'||zone==='pie')&&(has('no_carga')||has('dolor_oseo_focal')))out.push({k:has('no_carga')&&has('dolor_oseo_focal')?'bad':'warn',t:'Reglas de Ottawa',m:'Dolor óseo en maléolos, base del 5.º metatarsiano o navicular, o no poder dar 4 pasos: indicar radiografía.'});
  if(zone==='rodilla'&&(has('no_carga')||has('dolor_oseo_focal')))out.push({k:'warn',t:'Reglas de Ottawa de rodilla',m:'Radiografía si: 55 años o más, dolor aislado en rótula o cabeza del peroné, no flexiona a 90° o no da 4 pasos.'});
  if(has('defecto_palpable'))out.push({k:'bad',t:'Defecto palpable',m:'Sospecha de rotura completa. Valoración traumatológica en menos de 48 h.'});
  if(zone==='cabeza'&&sx.length)out.push({k:'bad',t:'Sospecha de conmoción',m:'Retirar del juego hoy y no dejarle solo. Valoración médica antes de volver a entrenar.'});
  if(zone==='cuello'&&(has('entumecimiento')))out.push({k:'bad',t:'Síntomas neurológicos tras lesión cervical',m:'No mover el cuello y valoración médica. Aplicar la regla canadiense de la columna cervical.'});
  if(has('perdida_conciencia'))out.push({k:'bad',t:'Pérdida de conciencia',m:'Valoración médica inmediata. Si es prolongada o hay dolor cervical, no mover y llamar a emergencias.'});
  if(zone==='muneca'&&has('dolor_tabaquera'))out.push({k:'warn',t:'Dolor en tabaquera anatómica',m:'Inmovilizar el pulgar y pedir radiografía aunque el dolor sea leve.'});
  if(has('dolor_nocturno')&&has('dolor_oseo_focal'))out.push({k:'warn',t:'Dolor óseo nocturno',m:'Descartar fractura por estrés con imagen.'});
  if(has('entumecimiento')&&zone!=='lumbar'&&zone!=='cuello')out.push({k:'warn',t:'Síntomas neurológicos',m:'Explorar sensibilidad y fuerza distal; si persisten, valoración médica.'});
  if(has('ciatica')&&has('debilidad'))out.push({k:'warn',t:'Dolor irradiado con debilidad',m:'Valoración médica si la debilidad es marcada o progresa.'});
  if(parseInt(S.diag.pain,10)>=8)out.push({k:'warn',t:'Dolor muy intenso',m:'Un dolor de 8/10 o más tras una lesión merece valoración presencial el mismo día.'});
  return out;
}

/* ===================== Revisión profesional efectiva ===================== */
function revOf(c){return c._rev||(typeof CL!=='undefined'&&CL.rev[c.id])||c.pro||null}
function eff(c){
  const p=revOf(c);const pdx=p&&p.dx&&INJ_BY[p.dx]?p:null;
  const inj=INJ_BY[pdx?pdx.dx:c.injuryId]||INJ[0];
  const gi=Math.min(pdx?+pdx.g:+c.g,inj.g.length-1)||0;
  return {inj,gi,grade:inj.g[gi],src:pdx?'pro':c.src,rev:p};
}

/* ===================== Mediciones, escalas y dolor ===================== */
function latestMeas(c,k){const l=c.meas.filter(m=>m.k===k).sort(byDate);return l[l.length-1]||null}
function lsiOf(m,inv){if(!m)return null;const a=num(m.a),b=num(m.b);if(!(a>0&&b>0))return null;return Math.round(100*(inv?b/a:a/b))}
function lsiK(c,k){return lsiOf(latestMeas(c,k),MEAS_BY[k]&&MEAS_BY[k].inv)}
function hopLSI(c){const v=['hop_single','hop_triple','hop_cross','hop_6m'].map(k=>lsiK(c,k)).filter(x=>x!=null);return v.length>=2?Math.min(...v):null}
function mainStrength(c){
  const {inj}=eff(c);const id=inj.id;
  if(['isquios','isq_prox'].includes(id))return 'ham';
  if(['aductores'].includes(id))return 'add';
  if(['fai','glutea'].includes(id))return 'abd';
  const z=inj.z[0];
  if(['rodilla','muslo'].includes(z))return 'quad';
  if(['tobillo','pierna','pie'].includes(z))return 'calf_reps';
  if(z==='hombro'||z==='cuello')return 'er';
  if(z==='codo'||z==='muneca')return 'grip';
  if(z==='cadera')return 'abd';
  return 'quad';
}
function scaleScore(sc){
  const d=SCALES[sc.k];if(!d)return null;const v=sc.vals||{};const nums=a=>(a||[]).map(num).filter(x=>x!=null);
  if(d.calc==='direct'){const t=num(sc.total);if(t==null)return null;return {total:Math.round(d.conv?t/d.conv*100:t)}}
  if(d.calc==='visa'){const a=v.it||[];const n=a.slice(0,8).map(num);if(n.some(x=>x==null))return null;return {total:Math.round(n.reduce((p,q)=>p+q,0))}}
  if(d.calc==='koos'){const subs={};d.subs.forEach(s=>{const n=nums(v[s.k]);if(n.length>=Math.ceil(s.i/2))subs[s.k]=Math.round(100-(n.reduce((p,q)=>p+q,0)/n.length)*25)});const vals=Object.values(subs);if(!vals.length)return null;return {subs,total:Math.round(vals.reduce((p,q)=>p+q,0)/vals.length)}}
  if(d.calc==='pct4'){const subs={};d.subs.forEach(s=>{const n=nums(v[s.k]);if(n.length)subs[s.k]=Math.round(n.reduce((p,q)=>p+q,0)/(n.length*4)*100)});const vals=Object.values(subs);if(!vals.length)return null;return {subs,total:subs.avd??vals[0]}}
  const n=nums(v.it);
  if(d.calc==='mean10'){if(n.length<d.subs[0].i)return null;return {total:Math.round(n.reduce((p,q)=>p+q,0)/n.length*10)}}
  if(d.calc==='sum'){if(n.length<d.subs[0].i)return null;return {total:Math.round(n.reduce((p,q)=>p+q,0))}}
  if(d.calc==='qdash'){if(n.length<10)return null;return {total:Math.round((n.reduce((p,q)=>p+q,0)/n.length-1)*25)}}
  if(d.calc==='odi'){if(n.length<8)return null;return {total:Math.round(n.reduce((p,q)=>p+q,0)/(5*n.length)*100)}}
  return null;
}
function latestScale(c,k){const l=c.scales.filter(s=>s.k===k).sort(byDate);const s=l[l.length-1];return s?{...s,sc:scaleScore(s)}:null}
function mornList(c){return Object.entries(c.mornings||{}).map(([date,v])=>({date,v:+v})).sort(byDate)}
function painState(c){
  const logs=c.logs.slice().sort(byDate);const last=logs[logs.length-1];
  const ml=mornList(c);const lm=ml[ml.length-1],pm=ml[ml.length-2];
  const recentM=lm&&daysBetween(lm.date,todayISO())<=3?lm:null;
  let flag=false,why='';
  if(last&&daysBetween(last.date,todayISO())<=7&&last.during>5){flag=true;why=`dolor de ${last.during}/10 durante la sesión del ${fmtShort(last.date)}`}
  else if(recentM&&recentM.v>5){flag=true;why=`dolor de ${recentM.v}/10 al levantarse el ${fmtShort(recentM.date)}`}
  else if(recentM&&pm&&recentM.v-pm.v>=2){flag=true;why=`el dolor al levantarse subió de ${pm.v} a ${recentM.v}`}
  const alarm=last&&last.flags&&last.flags.length&&daysBetween(last.date,todayISO())<=10?last:null;
  return {flag,why,last,lm,alarm,logs};
}
const LOG_FLAGS={
 calf:'Pantorrilla hinchada, caliente o dolorosa',
 swell:'La hinchazón o el derrame ha vuelto a aumentar',
 neuro:'Hormigueo, adormecimiento o pérdida de fuerza nueva',
 fever:'Fiebre, enrojecimiento o supuración de la herida',
 instab:'Nueva sensación de fallo o inestabilidad'
};
function logAlarmText(flags){
  const t=[];
  if(flags.includes('calf'))t.push('Signos compatibles con trombosis venosa: valoración médica urgente, sobre todo tras inmovilización o cirugía.');
  if(flags.includes('fever'))t.push('Posible infección: valoración médica el mismo día.');
  if(flags.includes('neuro'))t.push('Síntomas neurológicos nuevos: suspende la progresión y consulta.');
  if(flags.includes('swell'))t.push('Aumento de derrame: vuelve a la fase o dosis anterior y avisa a tu profesional.');
  if(flags.includes('instab'))t.push('Nueva inestabilidad: evita gestos de riesgo hasta que te valoren.');
  return t;
}

/* ===================== Criterios automáticos ===================== */
function critAuto(c,text){
  const N=re=>{const m=text.match(re);return m?+m[1]:null};
  const pct=N(/≥ ?(\d+) ?%/);
  const res=(met,val)=>({met:!!met,val});
  if(/ACL-RSI/.test(text)){const n=N(/ACL-RSI ≥ ?(\d+)/);const s=latestScale(c,'acl_rsi');if(!s||!s.sc)return null;return res(s.sc.total>=n,`ACL-RSI ${s.sc.total}`)}
  if(/salto/i.test(text)&&pct){
    const h=hopLSI(c);const needF=/fuerza/i.test(text);const f=needF?lsiK(c,mainStrength(c)):null;
    if(h==null&&(!needF||f==null))return null;if(needF&&(h==null||f==null))return res(false,`saltos ${h??'—'} % · fuerza ${f??'—'} %`);
    return res(h>=pct&&(!needF||f>=pct),needF?`saltos ${h} % · fuerza ${f} %`:`LSI saltos ${h} %`);
  }
  if(/[Rr]atio rotación externa\/interna/.test(text)){const e=latestMeas(c,'er'),i=latestMeas(c,'ir');if(!e||!i||!(num(i.a)>0))return null;const r=Math.round(num(e.a)/num(i.a)*100);return res(r>=pct,`ratio ${r} %`)}
  const strengthMap=[[/cuádriceps/,'quad'],[/isquiotibiales/,'ham'],[/gemelo/,'calf_reps'],[/[Pp]rensión/,'grip'],[/Rotación externa ≥/,'er'],[/aductores|squeeze/,'add'],[/[Ff]uerza de cadera|abductores/,'abd'],[/Elevación de pierna recta ≥/,'slr_rom']];
  if(pct){for(const [re,k] of strengthMap){if(re.test(text)){const l=lsiK(c,k);if(l==null)return null;return res(l>=pct,`${MEAS_BY[k].n}: ${l} %`)}}
    if(/(LSI de fuerza|[Ff]uerza)/.test(text)){const k=mainStrength(c);const l=lsiK(c,k);if(l==null)return null;return res(l>=pct,`${MEAS_BY[k].n}: ${l} %`)}
    if(/Dorsiflexión/.test(text)){const l=lsiK(c,'dorsi');if(l==null)return null;return res(l>=pct,`dorsiflexión ${l} %`)}
  }
  if(/Dorsiflexión simétrica/.test(text)){const l=lsiK(c,'dorsi');if(l==null)return null;return res(l>=90,`dorsiflexión ${l} %`)}
  if(/Extensión (pasiva 0°|completa)/.test(text)&&eff(c).inj.z.includes('rodilla')){const m=latestMeas(c,'knee_ext_def');if(!m)return null;return res(num(m.a)<=0,`déficit ${num(m.a)}°`)}
  if(/Flexión ≥ ?(\d+)°/.test(text)){const n=N(/Flexión ≥ ?(\d+)°/);const m=latestMeas(c,'knee_flex');if(!m)return null;return res(num(m.a)>=n,`flexión ${num(m.a)}°`)}
  if(/[Ff]lexión de rodilla > ?(\d+)°/.test(text)){const n=N(/> ?(\d+)°/);const m=latestMeas(c,'knee_flex');if(!m)return null;return res(num(m.a)>n,`flexión ${num(m.a)}°`)}
  if(/Flexión (completa|simétrica)/.test(text)){const l=lsiK(c,'knee_flex');if(l==null)return null;return res(l>=95,`flexión ${l} %`)}
  if(/(\d+) elevaciones/.test(text)){const n=N(/(\d+) elevaciones/);const m=latestMeas(c,'calf_reps');if(!m)return null;return res(num(m.a)>=n,`${num(m.a)} elevaciones`)}
  if(/Equilibrio unipodal (\d+) s/.test(text)){const n=N(/Equilibrio unipodal (\d+) s/);const m=latestMeas(c,'balance');if(!m)return null;return res(num(m.a)>=n,`${num(m.a)} s`)}
  if(/Y-balance anterior: diferencia < ?(\d+)/.test(text)){const n=N(/< ?(\d+)/);const m=latestMeas(c,'ybal_ant');if(!m||num(m.b)==null)return null;const d=Math.abs(num(m.a)-num(m.b));return res(d<n,`diferencia ${+d.toFixed(1)} cm`)}
  if(/[Dd]errame mínimo|barrido ≤ ?1/.test(text)){const m=latestMeas(c,'effusion');if(!m)return null;return res(num(m.a)<=1,`barrido ${num(m.a)}`)}
  if(/(Dolor en reposo|Dolor en la vida diaria|Dolor diario|Dolor matutino|Primeros pasos con dolor) ≤ ?(\d+)\/10/.test(text)){const n=+text.match(/≤ ?(\d+)\/10/)[1];const ml=mornList(c);const lm=ml[ml.length-1];if(!lm||daysBetween(lm.date,todayISO())>3)return null;return res(lm.v<=n,`al levantarse ${lm.v}/10`)}
  return null;
}
function critState(c,p,i){
  const t=eff(c).inj.ph[p].cr[i];const a=critAuto(c,t);
  const manual=!!(c.crit[p]||[])[i];
  if(a)return {met:a.met,auto:true,val:a.val,text:t};
  return {met:manual,auto:false,text:t};
}

/* ===================== Programa: dosis, material y sustituciones ===================== */
const cum=w=>w.reduce((a,x)=>(a.push(a[a.length-1]+x),a),[0]);
const weeksSince=d=>Math.max(0,(Date.now()-new Date(d+'T00:00:00').getTime())/6048e5);
function eqReq(id,lv){return (EQ[id]||['n','n','n'])[lv]||'n'}
function eqOk(id,c){return eqReq(id,c.level).split('+').every(k=>k==='n'||c.equip.includes(k))}
function altFor(id,c,exclude,avoid){
  const g=GROUP_OF[id];if(!g)return null;const t=EX[id].t;
  const l=GROUPS[g].filter(x=>x!==id&&EX[x]&&!exclude.includes(x)&&!(avoid||[]).includes(x)&&eqOk(x,c));
  l.sort((a,b)=>(EX[b].t===t)-(EX[a].t===t));return l[0]||null;
}
function phaseExercises(c,p){
  const {inj,rev}=eff(c);const base=inj.ph[p].ex;const proSw=(rev&&rev.swaps)||{};
  return base.map(id=>{
    let cur=id,why=null;
    if(proSw[id]&&EX[proSw[id]]){cur=proSw[id];why='pro'}
    else if(c.swaps[id]&&EX[c.swaps[id]]){cur=c.swaps[id];why='dolor'}
    if(!eqOk(cur,c)){const a=altFor(cur,c,base,c.painful);if(a){cur=a;why=why||'material'}else why='sin-material'}
    return {orig:id,id:cur,why};
  });
}
function doseFor(c,id,ps){
  const x=EX[id];if(!DOSE2[x.t])return null;
  const b={...DOSE2[x.t][c.level]};const w=Math.floor(weeksSince(c.phaseStart||c.date));
  ps=ps||painState(c);let cue='';
  if(ps.flag){b.s=Math.max(1,b.s-1);if(b.t)b.t=Math.max(15,b.t-15);if(b.min)b.min=Math.max(10,b.min-5);cue='Carga reducida por dolor: una serie menos y 20–30 % menos de peso o intensidad.'}
  else if(w>=1){
    if(['fuerza','iso','neuro','movil','plio'].includes(x.t))b.s=Math.min(b.s+1,6);
    if(w>=2&&x.t==='fuerza')cue=`Semana ${w+1} de la fase: +1 serie y sube la carga 5–10 % si el dolor a las 24 h fue ≤ 3/10.`;
    else if(w>=2&&x.t==='iso'){b.t+=15;cue=`Semana ${w+1} de la fase: +1 serie y +15 s por serie.`}
    else if(['cardio','espec'].includes(x.t)){b.min+=Math.min(15,5*w);cue=`Semana ${w+1} de la fase: +${Math.min(15,5*w)} min.`}
    else if(x.t!=='cardio'&&x.t!=='espec')cue=`Semana ${w+1} de la fase: +1 serie.`;
  }
  return {...b,cue};
}
function doseStr(d){if(!d)return 'Según indicación';const main=d.min?`${d.min} min`:`${d.s} × ${d.t?d.t+' s':d.r}`;return `${main} · ${d.note}`}
function restFor(x,lv){const r=REST[x.t];return Array.isArray(r)?r[lv]:(r||0)}

/* ===================== Evaluación del caso ===================== */
function evaluate(c){
  const {inj,grade,rev}=eff(c);const cw=cum(grade.w);const wk=weeksSince(c.date);
  let tp=0;for(let i=0;i<4;i++)if(wk>=cw[i])tp=i;
  const total=cw[4];
  const crit=inj.ph[c.phase].cr.map((_,i)=>critState(c,c.phase,i));
  const nDone=crit.filter(x=>x.met).length;const all=nDone===crit.length;
  const ps=painState(c);
  const lock=!!(rev&&rev.lock);const approved=rev&&rev.approved!=null?+rev.approved:-1;
  const needApproval=lock&&approved<c.phase+1;
  let rec;
  if(ps.alarm){rec={k:'bad',t:'Señal de alarma registrada',x:logAlarmText(ps.alarm.flags).join(' ')}}
  else if(ps.flag){rec={k:'bad',t:'Reducir carga',x:`Último registro: ${ps.why}. Regla: el dolor debe quedar en 5/10 o menos durante el ejercicio y no aumentar a la mañana siguiente. La dosis ya se ha reducido; no avances de fase hasta que se normalice.`}}
  else if(c.phase<tp&&all&&needApproval){rec={k:'warn',t:'Pendiente de aprobación profesional',x:`Se cumplen el tiempo y los criterios de la fase ${c.phase+1}. Tu profesional ha pedido aprobar cada avance.`}}
  else if(c.phase<tp&&all){rec={k:'ok',t:`Listo para la fase ${c.phase+2}`,x:`Se cumple el tiempo mínimo de tejido y todos los criterios de la fase ${c.phase+1}. El dolor está controlado.`,adv:true}}
  else if(c.phase<tp){rec={k:'warn',t:`Por tiempo tocaría la fase ${tp+1}`,x:`Faltan ${crit.length-nDone} de ${crit.length} criterios de la fase ${c.phase+1}. El tiempo solo no basta: trabaja los criterios pendientes.`}}
  else if(c.phase===3&&all){rec={k:'ok',t:'Criterios de retorno cumplidos',x:'Revisa la lista de retorno al deporte y confirma el alta con el profesional.'}}
  else if(c.phase<3&&all){rec={k:'info',t:'Criterios cumplidos antes de tiempo',x:`La fase ${c.phase+2} empieza por tiempo en la semana ${+cw[c.phase+1].toFixed(1)}. El tejido necesita tiempo: mantén la fase o avanza solo con aprobación profesional.`}}
  else rec={k:'info',t:'Mantener fase y dosis',x:`Completa los criterios de la fase ${c.phase+1}: ${nDone} de ${crit.length} cumplidos.`};
  let lv=null;const l3=ps.logs.slice(-3);
  if(ps.flag&&c.level>0)lv={to:c.level-1,why:'El dolor superó el umbral en el último registro.'};
  else if(!ps.flag&&l3.length===3&&c.level<2&&l3.every(l=>l.during<=2&&l.comp>=90&&l.rpe<=6))lv={to:c.level+1,why:'Tres sesiones completas con dolor ≤ 2/10 y esfuerzo moderado.'};
  return {wk,tp,cw,total,nDone,all,crit,rec,lv,ps,lock,needApproval};
}
function autoStep(c){
  if(!c||!c.auto)return;
  const e=evaluate(c);
  if(e.rec.adv&&c.phase<3){c.phase++;c.phaseStart=todayISO();c.hist.push({d:todayISO(),t:`Avance automático a la fase ${c.phase+1}`});UI.viewPhase=null;save(c);toast(`Avance automático a la fase ${c.phase+1}`)}
}

/* ===================== Adherencia y semáforo ===================== */
function activeDays(c){const s=new Set();c.logs.forEach(l=>s.add(l.date));c.sessions.forEach(x=>s.add(x.date));Object.keys(c.done).forEach(d=>s.add(d));return s}
function adherence(c){
  const act=activeDays(c);let sched=0,hit=0;const start=c.date>addDays(todayISO(),-14)?c.date:addDays(todayISO(),-14);
  for(let d=start;d<todayISO();d=addDays(d,1)){const dow=new Date(d+'T00:00:00').getDay();if(c.days.includes(dow)){sched++;if(act.has(d)||act.has(addDays(d,1))||act.has(addDays(d,-1)))hit++}}
  return sched?Math.round(100*hit/sched):null;
}
function lastActivity(c){const a=[...activeDays(c)].sort();return a[a.length-1]||null}
function caseSummary(c){
  const e=evaluate(c);const {inj,src}=eff(c);const reasons=[];let st='verde';
  if(e.ps.alarm){st='rojo';reasons.push('Señal de alarma')}
  if(e.ps.flag){st='rojo';reasons.push('Dolor por encima del umbral')}
  const la=lastActivity(c);const idle=la?daysBetween(la,todayISO()):daysBetween(c.date,todayISO());
  const adh=adherence(c);
  if(idle>=5){if(st!=='rojo')st='ambar';reasons.push(`${idle} días sin actividad`)}
  if(adh!=null&&adh<50){if(st!=='rojo')st='ambar';reasons.push(`Adherencia ${adh} %`)}
  if(src!=='pro'){if(st==='verde')st='ambar';reasons.push('Diagnóstico sin validar')}
  if(e.needApproval&&e.all){if(st==='verde')st='ambar';reasons.push('Espera tu aprobación de fase')}
  return {st,reasons,inj:inj.n,phase:c.phase+1,last:la,adh,name:c.name,id:c.id,side:c.side,pain:e.ps.last?e.ps.last.during:null};
}
