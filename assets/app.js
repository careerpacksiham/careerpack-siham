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
function printDoc(type){renderEditablePreviews();document.body.classList.add('print-'+type);window.print();setTimeout(()=>document.body.classList.remove('print-'+type),500)}

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

function openLibrary(){renderSavedApplications();const list=$('#libraryList');list.innerHTML='';packs.forEach(p=>{const item=document.createElement('div');item.className='library-item';item.innerHTML=`<strong>${p.icon} ${p.title}</strong><a href="${p.cv}" target="_blank">CV</a><a href="${p.letter}" target="_blank">Lettre</a>`;list.appendChild(item)});$('#libraryDialog').showModal()}
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
