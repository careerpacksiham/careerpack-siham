const CFG = window.CAREERPACK_CONFIG || {};
const PROFILE = window.SIHAM_PROFILE;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const STORAGE_KEY = 'careerpack_siham_applications_v21';

const packs = [
  {id:'hotel',icon:'🏨',title:'Hôtellerie de luxe',desc:'Palaces, resorts, hôtels 5 étoiles et riads premium.',cv:'documents/cv/cv-luxury-hospitality.pdf',letter:'documents/lettres/lettre-luxury-hospitality.pdf',keywords:['hôtel','hospitality','guest','palace','resort','hébergement','réception','service','luxe'],focus:'excellence de service, standards qualité, expérience client et management des équipes'},
  {id:'restaurant',icon:'🍽️',title:'Restaurant & Lounge',desc:'Restaurants premium, rooftops, lounges et beach clubs.',cv:'documents/cv/cv-restaurant-lounge.pdf',letter:'documents/lettres/lettre-restaurant-lounge.pdf',keywords:['restaurant','lounge','rooftop','food','beverage','f&b','service','cuisine','bar'],focus:'management opérationnel, qualité de service, organisation et développement commercial'},
  {id:'opening',icon:'🚀',title:'Ouverture d’établissement',desc:'Pré-ouverture, lancement, structuration et montée en puissance.',cv:'documents/cv/cv-opening-manager.pdf',letter:'documents/lettres/lettre-opening-manager.pdf',keywords:['ouverture','opening','pré-ouverture','lancement','création','startup','recrutement','procédures'],focus:'structuration, recrutement, mise en place des procédures et lancement opérationnel'},
  {id:'executive',icon:'👔',title:'Direction & Management',desc:'Direction opérationnelle, commerciale et générale.',cv:'documents/cv/cv-executive-management.pdf',letter:'documents/lettres/lettre-executive-management.pdf',keywords:['direction','directeur','directrice','manager','management','opérations','commercial','stratégie','pilotage'],focus:'direction, leadership, pilotage de la performance et management jusqu’à 50 collaborateurs'}
];

let state = freshState();
let deferredPrompt = null;
let autosaveTimer = null;

function freshState() {
  return {id:null, offer:'', analysis:null, company:'', job:'', recruiter:'', pack:null, generated:null, quick:false, createdAt:null, updatedAt:null};
}
function uid(){return 'cp-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function getApplications(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return []}}
function writeApplications(items){localStorage.setItem(STORAGE_KEY,JSON.stringify(items))}
function setSaveState(text, ok=false){const el=$('#saveState');if(el){el.textContent=text;el.classList.toggle('saved',ok)}}

function updateClock(){
  const now=new Date();
  $('#clock').textContent=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  $('#dateText').textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(now);
  const h=now.getHours();
  $('#greeting').textContent=h<12?'Bonjour Siham':h<18?'Bon après-midi Siham':'Bonsoir Siham';
}
updateClock();setInterval(updateClock,1000);

function setAiBadge(){
  const on=Boolean(CFG.AI_ENDPOINT);
  $('#aiBadge').textContent=on?'IA connectée':'Mode autonome';
  $('#aiBadge').className='ai-badge '+(on?'online':'local');
}
setAiBadge();

function setStep(n){
  $$('.wizard-step').forEach(s=>s.hidden=Number(s.dataset.step)!==n);
  $$('.progress-dot').forEach(d=>d.classList.toggle('active',Number(d.dataset.dot)<=n));
}

function resetInputs(){
  ['offerText','company','job','recruiter'].forEach(id=>$('#'+id).value='');
}

function openWizard(flow='offer'){
  state=freshState();state.quick=flow==='apply';resetInputs();setSaveState('Non enregistrée');
  setStep(flow==='apply'?2:1);
  if(flow==='apply'){state.analysis=localAnalyze('');fillAnalysis(state.analysis)}
  $('#wizard').showModal();
}

$$('[data-flow]').forEach(b=>b.addEventListener('click',()=>b.dataset.flow==='library'?openLibrary():openWizard(b.dataset.flow)));

function cleanWords(t){return (String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9&+-]{3,}/g)||[])}
function localAnalyze(text){
  const words=cleanWords(text),freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);
  const stop=new Set(['avec','pour','dans','vous','nous','une','des','les','sur','sous','entre','poste','profil','votre','notre','être','faire','plus','cette','sera','sont','leur','leurs','ainsi','tout','tous','aux']);
  const keywords=Object.entries(freq).filter(([w])=>!stop.has(w)).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w])=>w);
  let best=packs[3],bestScore=0;
  packs.forEach(p=>{const s=p.keywords.reduce((a,k)=>a+(text.toLowerCase().includes(k)?1:0),0);if(s>bestScore){best=p;bestScore=s}});
  const profileTerms=cleanWords(PROFILE.summary+' '+PROFILE.skills.join(' '));
  const common=keywords.filter(k=>profileTerms.some(p=>p.includes(k)||k.includes(p)));
  const score=Math.min(96,Math.max(text?58:72,68+common.length*4+bestScore*3));
  return {score,sector:best.id,job:guessJob(text),company:'',keywords,strengths:['management d’équipes','direction opérationnelle','développement commercial'],gaps:keywords.filter(k=>!common.includes(k)).slice(0,3),summary:text?`L’offre correspond principalement au positionnement « ${best.title} ». Le parcours de Siham apporte une forte crédibilité en management, organisation et développement de l’activité.`:'Le mode rapide utilise le profil professionnel et le secteur que vous choisirez.',source:'local'};
}
function guessJob(t){const lines=t.split(/\n+/).map(x=>x.trim()).filter(Boolean);return lines.find(l=>/direct|manager|responsable|chef|gerant|gérant|superviseur/i.test(l)&&l.length<100)||''}

async function aiCall(action,payload){
  if(!CFG.AI_ENDPOINT)return null;
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),CFG.AI_TIMEOUT_MS||35000);
  try{
    const r=await fetch(CFG.AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,payload,profile:PROFILE}),signal:ctrl.signal});
    if(!r.ok)throw new Error('AI HTTP '+r.status);
    const data=await r.json();if(!data.ok)throw new Error(data.error||'AI error');return data.result;
  }catch(e){console.warn('Fallback local:',e);showFallbackNotice();return null}finally{clearTimeout(timer)}
}
function showFallbackNotice(){
  $('#aiBadge').textContent='Secours autonome';$('#aiBadge').className='ai-badge local';
  setTimeout(setAiBadge,5000);
}

async function runAnalysis(){
  state.offer=$('#offerText').value.trim();
  if(!state.offer){alert('Collez une offre ou choisissez le mode rapide.');return}
  setStep(2);$('#analysisLoading').hidden=false;$('#analysisPanel').style.opacity=.35;
  let result=await aiCall('analyze',{offer:state.offer});if(!result)result=localAnalyze(state.offer);
  state.analysis=result;fillAnalysis(result);$('#analysisLoading').hidden=true;$('#analysisPanel').style.opacity=1;
}
function fillAnalysis(a){
  $('#scoreValue').textContent=(a.score||72)+'%';
  $('.score-ring').style.background=`conic-gradient(var(--mocha) 0 ${a.score||72}%,#e6dad4 ${a.score||72}% 100%)`;
  $('#analysisSummary').textContent=a.summary||'';
  $('#keywordChips').innerHTML=(a.keywords||[]).slice(0,9).map(k=>`<span class="chip">${escapeHtml(k)}</span>`).join('');
  if(a.job&&!$('#job').value)$('#job').value=a.job;if(a.company&&!$('#company').value)$('#company').value=a.company;
}
$('#analyzeOffer').onclick=runAnalysis;
$('#skipOffer').onclick=()=>{state.quick=true;state.analysis=localAnalyze('');fillAnalysis(state.analysis);setStep(2)};
$('#backOffer').onclick=()=>setStep(1);
$('#chooseSector').onclick=()=>{
  state.company=$('#company').value.trim();state.job=$('#job').value.trim();state.recruiter=$('#recruiter').value.trim();
  if(!state.company||!state.job){alert('Indiquez l’entreprise et le poste visé.');return}
  renderSectors();setStep(3);
};

function renderSectors(){
  const recommended=state.analysis?.sector||'executive';
  $('#sectorRecommendation').textContent=`CareerBrain recommande « ${packs.find(p=>p.id===recommended).title} » selon l’offre et le profil de Siham. Vous gardez toujours le dernier mot.`;
  $('#sectorChoices').innerHTML='';
  packs.forEach(p=>{const b=document.createElement('button');b.type='button';b.className='sector-choice'+(p.id===recommended?' recommended':'');b.innerHTML=`<i>${p.icon}</i><strong>${p.title}${p.id===recommended?' · Recommandé':''}</strong><small>${p.desc}</small>`;b.onclick=()=>generate(p);$('#sectorChoices').appendChild(b)});
}

async function generate(p){
  state.pack=p;setStep(4);$('#generationLoading').hidden=false;$('#resultContent').style.opacity=.25;
  let generated=await aiCall('generate',{offer:state.offer,analysis:state.analysis,company:state.company,job:state.job,recruiter:state.recruiter,sector:p});
  if(!generated)generated=localGenerate(p);
  state.generated=normalizeGenerated(generated);state.createdAt=state.createdAt||new Date().toISOString();renderResult();saveApplication(true);
  $('#generationLoading').hidden=true;$('#resultContent').style.opacity=1;
}
function normalizeGenerated(g){return {...g,skills:Array.isArray(g.skills)?g.skills:[],experience:Array.isArray(g.experience)?g.experience:PROFILE.experience,letter:g.letter||'',message:g.message||'',summary:g.summary||''}}
function localGenerate(p){
  const rec=state.recruiter?`Bonjour ${state.recruiter},`:'Bonjour,';const kws=(state.analysis?.keywords||[]).slice(0,4);
  const tailoredSummary=`Manager expérimentée avec plus de 25 ans de parcours en direction d’activités, management d’équipes et développement commercial. Pour le poste de ${state.job} chez ${state.company}, elle apporte une capacité démontrée à structurer les opérations, fédérer les collaborateurs et installer une culture de performance et de qualité de service${kws.length?`, en cohérence avec les priorités de l’offre : ${kws.join(', ')}`:''}.`;
  const skills=[...new Set([p.focus.split(', ')[0],...PROFILE.skills,...kws])].slice(0,9);
  const letter=`${rec}\n\nVotre recherche d’un(e) ${state.job} au sein de ${state.company} a retenu toute mon attention. Mon parcours de direction, de management d’équipes jusqu’à 50 collaborateurs et de développement commercial me permet d’aborder cette fonction avec une vision à la fois stratégique et opérationnelle.\n\nHabituée à structurer les organisations, coordonner les équipes et accompagner la performance, je souhaite aujourd’hui mettre cette expérience au service de votre établissement. Le positionnement du poste, notamment ${kws.slice(0,3).join(', ')||p.focus}, correspond particulièrement à mes compétences et à ma manière de manager.\n\nJe serais heureuse de pouvoir échanger avec vous afin de présenter plus précisément ma démarche et la valeur que je pourrais apporter à ${state.company}.\n\nVeuillez agréer l’expression de mes salutations distinguées.\n\nSiham Felchou`;
  const message=`${rec}\n\nJe vous adresse ma candidature au poste de ${state.job} au sein de ${state.company}. Vous trouverez ci-joints mon CV et ma lettre de motivation adaptés à cette opportunité.\n\nBien cordialement,\nSiham Felchou`;
  return {summary:tailoredSummary,skills,letter,message,experience:PROFILE.experience,quality:`Dossier « ${p.title} » sélectionné. Compatibilité estimée : ${state.analysis?.score||72} %. Le CV met prioritairement en avant ${p.focus}.`,source:'local'};
}

function renderResult(){
  const g=state.generated;
  $('#analysisText').textContent=g.quality||'Dossier préparé et contrôlé.';
  $('#cvSummaryEditor').value=g.summary;
  $('#cvSkillsEditor').value=g.skills.join('\n');
  $('#letterEditor').value=g.letter;
  $('#messageEditor').value=g.message;
  renderEditablePreviews();renderBrainExplanation();
  $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab==='cv'));
  $$('.tab-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel==='cv'));
}
function syncEditorsToState(){
  if(!state.generated)return;
  state.generated.summary=$('#cvSummaryEditor').value.trim();
  state.generated.skills=$('#cvSkillsEditor').value.split(/\n|·|,/).map(x=>x.trim()).filter(Boolean);
  state.generated.letter=$('#letterEditor').value.trim();
  state.generated.message=$('#messageEditor').value.trim();
}
function renderEditablePreviews(){
  syncEditorsToState();const g=state.generated;if(!g)return;
  $('#message').textContent=g.message;$('#cvPreview').innerHTML=cvHtml(g);$('#letterPreview').innerHTML=letterHtml(g.letter);
}
function renderBrainExplanation(){
  const a=state.analysis||{},p=state.pack||packs[3];
  const strengths=(a.strengths||['management','pilotage opérationnel']).map(escapeHtml).join(', ');
  const gaps=(a.gaps||[]).length?(a.gaps||[]).map(escapeHtml).join(', '):'aucun écart majeur détecté automatiquement';
  $('#brainExplanation').innerHTML=`<p><strong>Positionnement :</strong> ${escapeHtml(p.title)} — ${escapeHtml(p.focus)}.</p><p><strong>Correspondances fortes :</strong> ${strengths}.</p><p><strong>Mots-clés retenus :</strong> ${(a.keywords||[]).slice(0,6).map(escapeHtml).join(', ')||'profil et secteur sélectionné'}.</p><p><strong>À vérifier humainement :</strong> ${gaps}. Le score reste une aide à la décision, jamais une garantie.</p>`;
}
function cvHtml(g){return `<div class="cv-head"><img src="assets/siham.jpg" alt=""><div><h3>SIHAM FELCHOU</h3><p><b>${escapeHtml(state.job)}</b> · ${escapeHtml(state.company)}</p><p>${escapeHtml(PROFILE.phone)} · ${escapeHtml(PROFILE.email)}<br>${PROFILE.address.map(escapeHtml).join(' · ')}</p></div></div><h4>Résumé exécutif</h4><p>${escapeHtml(g.summary)}</p><h4>Compétences stratégiques</h4><p>${g.skills.map(escapeHtml).join(' · ')}</p><h4>Parcours professionnel</h4>${g.experience.map(e=>`<div class="job"><strong>${escapeHtml(e.role)} — ${escapeHtml(e.company)}</strong> <em>${escapeHtml(e.years)}</em><p>${escapeHtml(e.text)}</p></div>`).join('')}<h4>Formation</h4><p>${escapeHtml(PROFILE.education)}</p>`}
function letterHtml(text){return `<h3>SIHAM FELCHOU</h3><p>${PROFILE.address.map(escapeHtml).join('<br>')}<br>${escapeHtml(PROFILE.phone)} · ${escapeHtml(PROFILE.email)}</p><p style="margin-top:22px"><b>Objet : Candidature au poste de ${escapeHtml(state.job)} — ${escapeHtml(state.company)}</b></p>${text.split('\n').map(x=>x?`<p>${escapeHtml(x)}</p>`:'<br>').join('')}`}

['cvSummaryEditor','cvSkillsEditor','letterEditor','messageEditor'].forEach(id=>$('#'+id).addEventListener('input',()=>{
  renderEditablePreviews();setSaveState('Modifications en attente');clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>saveApplication(true),700);
}));

$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===t));$$('.tab-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===t.dataset.tab))});
$('#printCv').onclick=()=>printDoc('cv');$('#printLetter').onclick=()=>printDoc('letter');

function printableBase(title, body, extraCss=''){
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
  :root{--mocha:#a47864;--mocha-dark:#765446;--mocha-soft:#eee4df;--ink:#24201e;--muted:#6e6560;--paper:#fffdfb}
  *{box-sizing:border-box}html,body{margin:0;padding:0;background:#d8d2cf;color:var(--ink);font-family:Arial,Helvetica,sans-serif}body{padding:18px}.print-help{max-width:210mm;margin:0 auto 10px;padding:10px 14px;border-radius:10px;background:#fff;color:#4d403a;font:600 13px Arial,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.12)}
  ${extraCss}
  @page{size:A4;margin:0}@media print{html,body{width:210mm;height:297mm;background:#fff}body{padding:0}.print-help{display:none!important}}
  </style></head><body><div class="print-help">Document prêt. Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ».</div>${body}<script>window.addEventListener('load',()=>{const imgs=[...document.images];Promise.all(imgs.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=i.onerror=r}))).then(()=>setTimeout(()=>window.print(),250));});<\/script></body></html>`;
}

function cvPrintHtml(g){
  const skills=(g.skills||[]).slice(0,8).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const exp=(g.experience||[]).slice(0,5).map(e=>`<div class="job"><div class="job-head"><p class="job-title">${escapeHtml(e.role)}</p><span class="job-date">${escapeHtml(e.years)}</span></div><p class="company">${escapeHtml(e.company)}</p><p>${escapeHtml(e.text)}</p></div>`).join('');
  const photoUrl=new URL('assets/siham.jpg',window.location.href).href;
  const role=state.job||PROFILE.title;
  const body=`<main class="cv"><aside class="sidebar"><div class="photo-wrap"><img class="photo" src="${photoUrl}" alt="Photo de Siham Felchou"></div><section class="side-block contact"><h2 class="side-title">Coordonnées</h2><p>${PROFILE.address.map(escapeHtml).join('<br>')}</p><p>${escapeHtml(PROFILE.phone)}</p><p>${escapeHtml(PROFILE.email)}</p></section><section class="side-block"><h2 class="side-title">Compétences</h2><ul>${skills}</ul></section><section class="side-block"><h2 class="side-title">Formation</h2><p>${escapeHtml(PROFILE.education)}</p></section></aside><section class="main"><h1 class="name">SIHAM FELCHOU</h1><p class="role">${escapeHtml(role)}${state.company?` · ${escapeHtml(state.company)}`:''}</p><div class="accent-line"></div><section class="section"><h2 class="section-title">Profil</h2><p class="summary">${escapeHtml(g.summary)}</p></section><section class="section"><h2 class="section-title">Expérience professionnelle</h2>${exp}</section><section class="section"><h2 class="section-title">Valeur ajoutée</h2><div class="value-grid"><div class="value-item">Leadership et management d’équipes jusqu’à 50 collaborateurs</div><div class="value-item">Pilotage opérationnel et développement commercial</div><div class="value-item">Structuration des organisations et optimisation des méthodes</div><div class="value-item">Culture du service, de la performance et de la relation client</div></div></section></section></main>`;
  const css=`.cv{width:210mm;height:296.5mm;overflow:hidden;margin:0 auto;background:var(--paper);display:grid;grid-template-columns:65mm 1fr;box-shadow:0 12px 38px rgba(0,0,0,.16)}.sidebar{background:linear-gradient(180deg,var(--mocha-soft),#f7f1ee 56%,#efe5e0);padding:12mm 8mm 9mm;border-right:1px solid rgba(118,84,70,.16)}.photo-wrap{width:42mm;height:42mm;margin:0 auto 8mm;border-radius:50%;padding:2.2mm;background:#fff;box-shadow:0 0 0 1px rgba(118,84,70,.25),0 8px 22px rgba(118,84,70,.18)}.photo{width:100%;height:100%;object-fit:cover;object-position:center 22%;border-radius:50%;display:block}.side-block{margin-top:6.5mm}.side-title{margin:0 0 2.2mm;color:var(--mocha-dark);font-size:9.3pt;letter-spacing:1.1px;text-transform:uppercase;border-bottom:1px solid rgba(118,84,70,.35);padding-bottom:2mm}.contact p,.sidebar li,.sidebar p{font-size:8.5pt;line-height:1.4;margin:0 0 2.2mm}.sidebar ul{list-style:none;padding:0;margin:0}.sidebar li::before{content:'•';color:var(--mocha);font-weight:bold;margin-right:2.2mm}.main{padding:12mm 12mm 9mm}.name{margin:0;font-size:24pt;letter-spacing:.7px;color:var(--mocha-dark);line-height:1}.role{margin:3mm 0 5mm;font-size:11pt;color:var(--ink);letter-spacing:.2px}.accent-line{width:36mm;height:1.1mm;background:var(--mocha);margin-bottom:6mm}.section{margin-top:4mm}.section:first-of-type{margin-top:0}.section-title{margin:0 0 2mm;color:var(--mocha-dark);font-size:10.2pt;letter-spacing:1px;text-transform:uppercase;display:flex;align-items:center;gap:3mm}.section-title::after{content:'';height:.35mm;flex:1;background:rgba(118,84,70,.28)}.summary{font-size:9.2pt;line-height:1.38;margin:0}.job{margin-bottom:3mm;break-inside:avoid}.job-head{display:grid;grid-template-columns:1fr auto;gap:5mm;align-items:baseline;margin-bottom:1.4mm}.job-title{font-size:9.6pt;font-weight:700;margin:0}.job-date{font-size:8.2pt;color:var(--mocha-dark);font-weight:700;white-space:nowrap}.company{color:var(--muted);font-size:8.5pt;margin:0 0 1.4mm;font-weight:700}.job p{font-size:8.35pt;line-height:1.3;margin:0}.value-grid{display:grid;grid-template-columns:1fr 1fr;gap:2mm 5mm}.value-item{font-size:8.35pt;line-height:1.35;padding-left:4mm;position:relative}.value-item::before{content:'✓';position:absolute;left:0;color:var(--mocha);font-weight:700}@media print{.cv{box-shadow:none;margin:0;width:210mm;height:296.5mm}}`;
  return printableBase(`CV Siham Felchou — ${role}`,body,css);
}

function letterPrintHtml(text){
  const paragraphs=String(text||'').split(/\n\s*\n/).filter(Boolean).map(p=>`<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');
  const date=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(new Date());
  const body=`<main class="letter"><header><div><h1>SIHAM FELCHOU</h1><p class="signature">Direction · Management · Développement commercial</p></div><div class="contact">${PROFILE.address.map(escapeHtml).join('<br>')}<br>${escapeHtml(PROFILE.phone)}<br>${escapeHtml(PROFILE.email)}</div></header><div class="line"></div><section class="recipient"><p><strong>${escapeHtml(state.company||'Entreprise')}</strong>${state.recruiter?`<br>À l’attention de ${escapeHtml(state.recruiter)}`:''}</p><p>Marrakech, le ${date}</p></section><p class="object"><strong>Objet :</strong> Candidature au poste de ${escapeHtml(state.job||'poste proposé')}</p><article>${paragraphs}</article><footer><span>CareerPack · Dossier de candidature personnalisé</span><strong>Siham Felchou</strong></footer></main>`;
  const css=`.letter{width:210mm;min-height:296.5mm;margin:0 auto;background:var(--paper);padding:18mm 19mm 16mm;box-shadow:0 12px 38px rgba(0,0,0,.16);position:relative}.letter header{display:grid;grid-template-columns:1fr auto;gap:15mm;align-items:start}.letter h1{margin:0;color:var(--mocha-dark);font-size:23pt;letter-spacing:.8px}.signature{margin:2.5mm 0 0;color:var(--muted);font-size:10pt}.contact{text-align:right;font-size:9pt;line-height:1.5}.line{height:1.2mm;width:38mm;background:var(--mocha);margin:7mm 0 12mm}.recipient{display:flex;justify-content:space-between;gap:15mm;font-size:9.5pt;line-height:1.45;margin-bottom:11mm}.recipient p{margin:0}.object{font-size:10pt;padding:3.5mm 4mm;background:var(--mocha-soft);border-left:1.2mm solid var(--mocha);margin:0 0 10mm}article{font-family:Georgia,'Times New Roman',serif;font-size:11pt;line-height:1.65;text-align:justify}article p{margin:0 0 6mm}footer{position:absolute;left:19mm;right:19mm;bottom:13mm;border-top:.3mm solid rgba(118,84,70,.28);padding-top:4mm;display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:8.5pt}footer strong{color:var(--mocha-dark);font-size:10pt}@media print{.letter{box-shadow:none;margin:0;width:210mm;min-height:296.5mm}}`;
  return printableBase(`Lettre de motivation — ${state.job||''}`,body,css);
}

function printDoc(type){
  renderEditablePreviews();syncEditorsToState();
  if(!state.generated){alert('Aucun dossier n’est prêt à être imprimé.');return}
  const html=type==='cv'?cvPrintHtml(state.generated):letterPrintHtml(state.generated.letter);
  const popup=window.open('','_blank');
  if(!popup){alert('Le navigateur a bloqué l’ouverture du document. Autorisez les fenêtres contextuelles pour CareerPack puis recommencez.');return}
  popup.document.open();popup.document.write(html);popup.document.close();
}

function saveApplication(silent=false){
  if(!state.generated)return;
  syncEditorsToState();const now=new Date().toISOString();state.id=state.id||uid();state.createdAt=state.createdAt||now;state.updatedAt=now;
  const record=JSON.parse(JSON.stringify(state));let items=getApplications();const idx=items.findIndex(x=>x.id===record.id);
  if(idx>=0)items[idx]=record;else items.unshift(record);items=items.slice(0,50);writeApplications(items);setSaveState('Enregistrée automatiquement',true);
  if(!silent)alert('Le dossier de candidature est enregistré dans « Mes candidatures préparées ».');
}
$('#saveApplication').onclick=()=>saveApplication(false);

async function copyText(text,label){try{await navigator.clipboard.writeText(text);alert(label+' copiée.')}catch{alert('Copie impossible sur ce navigateur. Sélectionnez le texte manuellement.')}}
$('#copyLetter').onclick=()=>{syncEditorsToState();copyText(state.generated?.letter||'','Lettre')};
$('#shareText').onclick=async()=>{syncEditorsToState();const text=state.generated?.message||'';try{if(navigator.share)await navigator.share({title:`Candidature ${state.job} — ${state.company}`,text});else await copyText(text,'Message')}catch(e){}};
$('#restart').onclick=()=>openWizard('offer');

function openLibrary(){renderSavedApplications();const list=$('#libraryList');list.innerHTML='';packs.forEach(p=>{const item=document.createElement('div');item.className='library-item';item.innerHTML=`<strong>${p.icon} ${p.title}</strong><a href="${p.cv}" target="_blank" rel="noopener">Ouvrir le CV</a><span class="library-note">Lettre personnalisée créée depuis une candidature</span>`;list.appendChild(item)});$('#libraryDialog').showModal()}
function renderSavedApplications(){
  const box=$('#savedApplications'),items=getApplications();box.innerHTML='<h3>Mes candidatures préparées</h3>';
  if(!items.length){box.innerHTML+='<p class="empty-state">Aucune candidature enregistrée pour le moment.</p>';return}
  items.forEach(item=>{
    const row=document.createElement('article');row.className='saved-item';const date=new Date(item.updatedAt||item.createdAt).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});
    row.innerHTML=`<div><strong>${escapeHtml(item.job||'Poste non nommé')}</strong><span>${escapeHtml(item.company||'Entreprise non nommée')} · ${date}</span></div><div class="saved-actions"><button type="button" data-open>Ouvrir</button><button type="button" class="danger" data-delete>Supprimer</button></div>`;
    row.querySelector('[data-open]').onclick=()=>loadApplication(item.id);row.querySelector('[data-delete]').onclick=()=>deleteApplication(item.id);box.appendChild(row);
  });
}
function loadApplication(id){
  const item=getApplications().find(x=>x.id===id);if(!item)return;
  state=item;state.pack=packs.find(p=>p.id===item.pack?.id)||item.pack||packs[3];
  $('#offerText').value=state.offer||'';$('#company').value=state.company||'';$('#job').value=state.job||'';$('#recruiter').value=state.recruiter||'';
  fillAnalysis(state.analysis||localAnalyze(state.offer||''));renderResult();setSaveState('Dossier rouvert',true);$('#libraryDialog').close();setStep(4);$('#wizard').showModal();
}
function deleteApplication(id){
  if(!confirm('Supprimer définitivement cette candidature enregistrée sur cet appareil ?'))return;
  writeApplications(getApplications().filter(x=>x.id!==id));renderSavedApplications();
}

function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false});
$('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true};
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(console.warn);
