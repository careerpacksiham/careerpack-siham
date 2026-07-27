// CareerPack V2.5.2 — Édition finale figée : profil local, documents contrôlés et PWA stabilisée
const CFG = window.CAREERPACK_CONFIG || {};
const BASE_PROFILE = window.SIHAM_PROFILE;
const PROFILE_STORAGE_KEY = 'careerpack_siham_profile_v252';
const BACKUP_SCHEMA = 'careerpack-siham-backup-v1';
let PROFILE = loadProfile();
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
let previewFitToWidth = true;
let previewResizeTimer = null;
let pendingProfilePhoto = null;

function freshState() {
  return {id:null, offer:'', analysis:null, company:'', job:'', recruiter:'', pack:null, generated:null, quick:false, createdAt:null, updatedAt:null, exportHistory:[]};
}
function deepClone(value){return JSON.parse(JSON.stringify(value))}
function mergeProfile(base,saved={}){
  const merged={...deepClone(base),...saved};
  merged.address=Array.isArray(saved.address)?saved.address:deepClone(base.address||[]);
  merged.language=Array.isArray(saved.language)?saved.language:deepClone(base.language||[]);
  merged.leadership=Array.isArray(saved.leadership)?saved.leadership:deepClone(base.leadership||[]);
  merged.skills=Array.isArray(saved.skills)?saved.skills:deepClone(base.skills||[]);
  merged.value=Array.isArray(saved.value)?saved.value:deepClone(base.value||[]);
  merged.experience=Array.isArray(saved.experience)&&saved.experience.length?saved.experience.map((e,i)=>({...deepClone(base.experience?.[i]||{}),...e,id:e.id||base.experience?.[i]?.id||`profile-exp-${i}`})):deepClone(base.experience||[]);
  merged.photo={src:'assets/siham.jpg',x:50,y:23,zoom:100,...(base.photo||{}),...(saved.photo||{})};
  return merged;
}
function loadProfile(){
  try{return mergeProfile(BASE_PROFILE,JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)||'{}'))}catch{return mergeProfile(BASE_PROFILE,{})}
}
function persistProfile(profile){
  try{localStorage.setItem(PROFILE_STORAGE_KEY,JSON.stringify(profile));return true}catch(e){console.warn('Profil local non sauvegardé:',e);return false}
}
function firstName(){return String(PROFILE.name||'Siham').trim().split(/\s+/)[0]||'Siham'}
function safeLines(value){return String(value||'').split(/\n|•|·/).map(x=>x.trim()).filter(Boolean)}

function uid(){return 'cp-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function getApplications(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return []}}
function writeApplications(items){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items));return true}catch(e){console.warn('Sauvegarde locale indisponible:',e);return false}}
function setSaveState(text, ok=false){const el=$('#saveState');if(el){el.textContent=text;el.classList.toggle('saved',ok)}}

function updateClock(){
  const now=new Date();
  $('#clock').textContent=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  $('#dateText').textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(now);
  const h=now.getHours();
  const name=firstName();
  $('#greeting').textContent=h<12?`Bonjour ${name}`:h<18?`Bon après-midi ${name}`:`Bonsoir ${name}`;
}
function applyProfileToUi(){
  const img=$('.profile img');
  if(img){img.src=PROFILE.photo?.src||'assets/siham.jpg';img.alt=PROFILE.name||'Siham Felchou';img.style.objectPosition=`${PROFILE.photo?.x??50}% ${PROFILE.photo?.y??23}%`;img.style.transform=`scale(${(PROFILE.photo?.zoom||100)/100})`;}
  updateClock();
}
applyProfileToUi();setInterval(updateClock,1000);

function setAiBadge(){
  const on=Boolean(CFG.AI_ENDPOINT);
  $('#aiBadge').textContent=on?'IA connectée':'Mode autonome';
  $('#aiBadge').className='ai-badge '+(on?'online':'local');
}
setAiBadge();

function setStep(n){
  $$('.wizard-step').forEach(s=>s.hidden=Number(s.dataset.step)!==n);
  $$('.progress-dot').forEach(d=>d.classList.toggle('active',Number(d.dataset.dot)<=n));
  $('#wizard').classList.toggle('result-mode',n===4);
  if(n!==4)closeActionsMenu();
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
  const raw=String(text||'');
  const words=cleanWords(raw),freq={};words.forEach(w=>freq[w]=(freq[w]||0)+1);
  const stop=new Set(['avec','pour','dans','vous','nous','une','des','les','sur','sous','entre','poste','profil','votre','notre','etre','faire','plus','cette','sera','sont','leur','leurs','ainsi','tout','tous','aux','par','qui','que','ses','nos','vos','afin','missions','mission','recherchons','recherche','experimentee','experimente','candidate','candidat','temps','plein','partiel','cdi','cdd','stage','interim','freelance','presentiel','hybride','teletravail','remote','marrakech','safi','maroc','morocco','postuler','candidature']);
  const companyTokens=new Set(cleanWords(guessCompany(raw)));
  const keywords=Object.entries(freq).filter(([w])=>!stop.has(w)&&!companyTokens.has(w)).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([w])=>w);
  let best=packs[3],bestScore=0;
  packs.forEach(p=>{const score=p.keywords.reduce((sum,k)=>sum+(raw.toLowerCase().includes(k)?1:0),0);if(score>bestScore){best=p;bestScore=score}});
  const profileCorpus=cleanWords([PROFILE.summary,...PROFILE.skills,...PROFILE.leadership,...PROFILE.experience.flatMap(e=>[e.role,e.company,e.text])].join(' '));
  const common=keywords.filter(k=>profileCorpus.some(p=>p===k||p.includes(k)||k.includes(p)));
  const strengths=[...new Set([...common.slice(0,3),...PROFILE.skills.slice(0,3)])].slice(0,5);
  const score=Math.min(94,Math.max(raw?56:70,64+common.length*4+bestScore*3));
  return {
    score,
    sector:best.id,
    job:guessJob(raw),
    company:guessCompany(raw),
    keywords,
    strengths,
    gaps:keywords.filter(k=>!common.includes(k)).slice(0,4),
    summary:raw?`L’offre se rapproche du positionnement « ${best.title} ». Le profil présente des correspondances solides en direction, management et développement commercial ; les mots-clés non démontrés restent signalés pour vérification.`:'Le mode rapide s’appuie sur le profil professionnel validé et sur le secteur choisi.',
    source:'local'
  };
}
function guessJob(text){
  const raw=String(text||'');
  const lines=raw.split(/\n+/).map(x=>x.trim()).filter(Boolean);
  const explicit=lines.find(l=>/^(?:poste|intitul[eé](?: du poste)?|fonction)\s*[:\-–—]/i.test(l));
  if(explicit)return explicit.replace(/^[^:\-–—]+[:\-–—]\s*/,'').trim().slice(0,100);
  const standalone=lines.find(l=>/direct|manager|responsable|chef|g[eé]rant|superviseur|coordinateur|operations|opérations/i.test(l)&&l.length<100&&l.split(/\s+/).length<=10&&!isCompanyNoise(l)&&!/^nous\b/i.test(l)&&!/[.!?]$/.test(l));
  if(standalone)return standalone;
  const contextual=raw.match(/\b(?:un|une)\s+((?:directeur|directrice|manager|responsable|chef|g[eé]rant|superviseur|coordinateur)[^.,;\n]{0,80})/i);
  if(contextual)return contextual[1].trim().slice(0,100);
  return '';
}
function cleanDetectedCompany(value=''){
  let result=String(value||'').replace(/^(entreprise|soci[eé]t[eé]|employeur|company|organisation|organization)\s*[:\-–—]\s*/i,'').replace(/\s+(?:un|une)\s+(?:directeur|directrice|manager|responsable|chef|g[eé]rant|superviseur|coordinateur).*$/i,'').replace(/^[•·|\-–—\s]+|[•·|\-–—\s]+$/g,'').replace(/\s{2,}/g,' ').trim();
  const parts=result.split(/\s+[|·•]\s+|\s+[-–—]\s+/).map(x=>x.trim()).filter(Boolean);
  if(parts.length>1){const plausible=parts.find(part=>!isCompanyNoise(part)&&!/^marrakech|casablanca|rabat|agadir|tanger|maroc|morocco$/i.test(part));if(plausible)result=plausible;}
  return result.slice(0,90);
}
function isCompanyNoise(value=''){
  const v=normalizedToken(value);
  if(!v)return true;
  const exact=[
    'temps plein','temps partiel','mi temps','full time','part time','cdi','cdd','stage','interim','freelance','contrat','contractuel',
    'sur site','sur place','presentiel','hybride','teletravail','remote','journee','nuit','week end','horaire flexible',
    'postuler','postuler maintenant','candidature simplifiee','enregistrer','offre d emploi','description du poste','profil recherche','a propos du poste',
    'debutant accepte','niveau intermediaire','confirme','senior','junior'
  ];
  if(exact.includes(v))return true;
  if(/^(temps (plein|partiel)|mi temps|full time|part time|cdi|cdd|stage|interim|freelance|sur site|sur place|presentiel|hybride|teletravail|remote)\b/.test(v))return true;
  if(/^(il y a|publiee?|mise en ligne|plus de|moins de|candidats?|vues?|salaire|remuneration|avantages?|horaires?|type de contrat|niveau d experience)\b/.test(v))return true;
  if(/^(marrakech|casablanca|rabat|agadir|tanger|maroc|morocco)( safi)?$/.test(v))return true;
  if(/\b(par semaine|par mois|par an|dh|mad|eur|€)\b/.test(v)&&/\d/.test(v))return true;
  return false;
}
function isLikelyCompanyName(value=''){
  const line=cleanDetectedCompany(value);
  if(!line||line.length<2||line.length>90||isCompanyNoise(line))return false;
  if(/https?:|www\.|@/.test(line))return false;
  if(/[.!?]$/.test(line)&&line.split(/\s+/).length>5)return false;
  if(/^(missions?|responsabilit[eé]s?|qualifications?|comp[eé]tences?|profil|avantages?|description|r[eé]sum[eé]|localisation|lieu)\b/i.test(line))return false;
  const words=line.split(/\s+/).filter(Boolean);
  if(words.length>11)return false;
  const companyMarker=/(h[oô]tel|riad|resort|palace|groupe|group|restaurant|lounge|spa|club|hospitality|collection|company|sarl|s\.a\.?|llc|marriott|accor|fairmont|mandarin|aman|selman|mamounia|mansour)/i.test(line);
  const jobLike=/^(directeur|directrice|manager|responsable|chef|superviseur|coordinateur|g[eé]rant|assistant|commercial|receptionniste|serveur|cuisinier)\b/i.test(line);
  if(jobLike&&!companyMarker)return false;
  const titleWords=words.filter(w=>/^[A-ZÀ-ÖØ-Ý][A-Za-zÀ-ÖØ-öø-ÿ&'’-]*$/.test(w)).length;
  const upperWords=words.filter(w=>w.length>1&&w===w.toUpperCase()&&/[A-ZÀ-ÖØ-Ý]/.test(w)).length;
  return companyMarker||titleWords>=Math.max(1,Math.ceil(words.length*.45))||upperWords>=Math.max(1,Math.ceil(words.length*.5));
}
function guessCompany(text){
  const raw=String(text||'');
  const lines=raw.split(/\n+/).map((text,index)=>({text:text.trim(),index})).filter(x=>x.text);
  for(let i=0;i<lines.length;i++){
    const line=lines[i].text;
    const explicit=line.match(/^(?:nom de l['’]entreprise|entreprise|soci[eé]t[eé]|employeur|company|organisation|organization)\s*[:\-–—]\s*(.+)$/i);
    if(explicit&&isLikelyCompanyName(explicit[1]))return cleanDetectedCompany(explicit[1]);
    if(/^(?:nom de l['’]entreprise|entreprise|soci[eé]t[eé]|employeur|company|organisation|organization)\s*:?$/i.test(line)){
      const next=lines[i+1]?.text||'';if(isLikelyCompanyName(next))return cleanDetectedCompany(next);
    }
  }
  const contextualPatterns=[
    /(?:chez|au sein de|rejoignez|rejoindre)\s+([A-ZÀ-ÖØ-Ý][^\n,.;:]{2,80})/gi,
    /(?:^|\n)\s*([A-ZÀ-ÖØ-Ý][^\n]{2,75}?)\s+(?:recrute|recherche)\b/gim,
    /(?:à propos de|about)\s+([A-ZÀ-ÖØ-Ý][^\n,.;:]{2,80})/gi
  ];
  for(const re of contextualPatterns){
    let match;while((match=re.exec(raw))){const candidate=cleanDetectedCompany(match[1]);if(isLikelyCompanyName(candidate))return candidate;}
  }
  const jobIndex=lines.findIndex(x=>/direct|manager|responsable|chef|g[eé]rant|superviseur|coordinateur|operations|opérations/i.test(x.text)&&x.text.length<100&&!isCompanyNoise(x.text));
  const scored=[];
  for(const item of lines){
    const line=cleanDetectedCompany(item.text);if(!isLikelyCompanyName(line))continue;
    let score=0;
    if(/(h[oô]tel|riad|resort|palace|groupe|group|restaurant|lounge|spa|club|hospitality|collection|sarl|s\.a\.?|llc)/i.test(line))score+=18;
    if(item.index<8)score+=7;
    if(jobIndex>=0){const distance=Math.abs(item.index-jobIndex);score+=Math.max(0,11-distance*2);if(item.index===jobIndex+1)score+=5;if(item.index===jobIndex-1)score+=4;}
    const words=line.split(/\s+/);const titleWords=words.filter(w=>/^[A-ZÀ-ÖØ-Ý]/.test(w)).length;score+=Math.min(6,titleWords);
    if(words.length<=5)score+=3;
    scored.push({line,score,index:item.index});
  }
  scored.sort((a,b)=>b.score-a.score||a.index-b.index);
  return scored[0]?.score>=8?scored[0].line:'';
}
function normalizeAnalysisResult(result,offer){
  const r=result&&typeof result==='object'?{...result}:{};
  const proposed=cleanDetectedCompany(r.company||'');
  const fallback=guessCompany(offer);
  r.company=isLikelyCompanyName(proposed)?proposed:fallback;
  if(!r.job||isCompanyNoise(r.job))r.job=guessJob(offer);
  return r;
}

function profileForAi(){const copy=deepClone(PROFILE);if(copy.photo)copy.photo={x:copy.photo.x,y:copy.photo.y,zoom:copy.photo.zoom};return copy}
async function aiCall(action,payload){
  if(!CFG.AI_ENDPOINT)return null;
  const ctrl=new AbortController();const timer=setTimeout(()=>ctrl.abort(),CFG.AI_TIMEOUT_MS||35000);
  try{
    const r=await fetch(CFG.AI_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,payload,profile:profileForAi()}),signal:ctrl.signal});
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
  result=normalizeAnalysisResult(result,state.offer);
  state.analysis=result;fillAnalysis(result);$('#analysisLoading').hidden=true;$('#analysisPanel').style.opacity=1;
}
function fillAnalysis(a){
  a=normalizeAnalysisResult(a,state.offer||$('#offerText').value||'');
  $('#scoreValue').textContent=(a.score||72)+'%';
  $('.score-ring').style.background=`conic-gradient(var(--mocha) 0 ${a.score||72}%,#e6dad4 ${a.score||72}% 100%)`;
  $('#analysisSummary').textContent=a.summary||'';
  $('#keywordChips').innerHTML=(a.keywords||[]).slice(0,9).map(k=>`<span class="chip">${escapeHtml(k)}</span>`).join('');
  if(a.job&&!$('#job').value)$('#job').value=a.job;if(a.company&&!$('#company').value)$('#company').value=a.company;
  const note=$('#companyDetectionNote');if(note){
    if(a.company)note.textContent=a.companyEvidence?`Détectée dans l’offre : « ${a.companyEvidence} ». Vérifiez avant de continuer.`:'Entreprise détectée automatiquement. Vérifiez avant de continuer.';
    else note.textContent='Entreprise non détectée avec certitude : saisissez-la manuellement.';
    note.classList.toggle('warning',!a.company);
  }
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
  try{
    let generated=await aiCall('generate',{offer:state.offer,analysis:state.analysis,company:state.company,job:state.job,recruiter:state.recruiter,sector:p});
    if(!generated)generated=localGenerate(p);
    state.generated=normalizeGenerated(generated);state.createdAt=state.createdAt||new Date().toISOString();renderResult();saveApplication(true);
  }catch(e){
    console.error('Génération impossible:',e);alert('CareerPack n’a pas pu finaliser le dossier. Le profil reste intact ; recommencez la génération.');
  }finally{
    $('#generationLoading').hidden=true;$('#resultContent').style.opacity=1;
  }
}
function normalizedToken(value=''){
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function scoreExperienceForContext(exp,p,keywords=[]){
  const corpus=normalizedToken([exp.role,exp.company,exp.text].join(' '));
  const terms=[...(p?.keywords||[]),...keywords].map(normalizedToken).filter(Boolean);
  const role=normalizedToken(exp.role);
  const seniority=role.includes('associee gerante')?8:role.includes('consultante')?5:role.includes('responsable commerciale')?5:role==='gerante'?4:role.includes('responsable')?3:0;
  return terms.reduce((sum,t)=>sum+(corpus.includes(t)?2:0),0)+seniority;
}
function buildLocalStrategy(p){
  const keywords=(state.analysis?.keywords||[]).slice(0,8);
  const ranked=PROFILE.experience.map((e,index)=>({id:e.id,score:scoreExperienceForContext(e,p,keywords)+(PROFILE.experience.length-index)*1.25,index})).sort((a,b)=>b.score-a.score||a.index-b.index);
  const profileSkills=PROFILE.skills.map(skill=>({skill,score:[...(p?.keywords||[]),...keywords].reduce((sum,k)=>sum+(normalizedToken(skill).includes(normalizedToken(k))||normalizedToken(k).includes(normalizedToken(skill))?2:0),0)}));
  const prioritySkills=profileSkills.sort((a,b)=>b.score-a.score).map(x=>x.skill);
  return {
    template:'executive-signature',
    priorityExperienceIds:ranked.map(x=>x.id),
    prioritySkills,
    atsKeywords:keywords,
    rationale:`Le modèle Executive Signature est retenu pour préserver une présentation sobre, senior et vérifiable. Les expériences sont ordonnées selon leur proximité avec le poste de ${state.job}.`,
    warnings:(state.analysis?.gaps||[]).slice(0,4)
  };
}
function mergeExperienceAgainstProfile(candidate=[],strategy={}){
  const list=PROFILE.experience.map((source,index)=>{
    const proposed=(candidate||[]).find(x=>x&&((x.id&&x.id===source.id)||(normalizedToken(x.role)===normalizedToken(source.role)&&normalizedToken(x.company)===normalizedToken(source.company))));
    return {
      id:source.id,
      role:source.role,
      company:source.company,
      years:source.years,
      text:source.text,
      visible:proposed?.visible!==false,
      order:index
    };
  });
  // Le parcours reste en chronologie inverse, comme dans le CV étalon validé.
  // La stratégie CareerBrain sert à expliquer les priorités et à cibler les textes,
  // sans produire une chronologie incohérente.
  list.forEach((item,index)=>item.order=index);
  return list;
}
function normalizeGenerated(g={}){
  const strategy={...buildLocalStrategy(state.pack||packs[3]),...(g.strategy||{})};
  const allowedSkills=new Map(PROFILE.skills.map(x=>[normalizedToken(x),x]));
  const proposedSkills=(Array.isArray(g.skills)?g.skills:[]).map(x=>String(x).trim()).filter(Boolean);
  const verifiedSkills=[];
  for(const skill of [...proposedSkills,...(strategy.prioritySkills||[]),...PROFILE.skills]){
    const direct=allowedSkills.get(normalizedToken(skill));
    const verified=direct||PROFILE.skills.find(x=>normalizedToken(x).includes(normalizedToken(skill))||normalizedToken(skill).includes(normalizedToken(x)));
    if(verified&&!verifiedSkills.includes(verified))verifiedSkills.push(verified);
  }
  return {
    ...g,
    title:String(g.title||state.job||PROFILE.title).trim(),
    summary:String(g.summary||PROFILE.summary).trim(),
    skills:verifiedSkills.slice(0,8),
    value:[...new Set([...(Array.isArray(g.value)?g.value:[]),...PROFILE.value].map(v=>PROFILE.value.find(source=>normalizedToken(source)===normalizedToken(v))).filter(Boolean))].slice(0,6),
    experience:mergeExperienceAgainstProfile(g.experience,strategy),
    letter:String(g.letter||''),
    message:String(g.message||''),
    messageBase:String(g.messageBase||g.message||''),
    messageChannel:g.messageChannel||'email',
    strategy,
    pageMode:g.pageMode||'auto',
    resolvedPages:Number(g.resolvedPages||1),
    fitMode:g.fitMode||'normal',
    fitIssue:Boolean(g.fitIssue),
    quality:String(g.quality||'Dossier préparé à partir du profil validé.'),
    source:g.source||'local'
  };
}
function localGenerate(p){
  const rec=state.recruiter?`Bonjour ${state.recruiter},`:'Bonjour,';
  const strategy=buildLocalStrategy(p);
  const kws=strategy.atsKeywords.slice(0,4);
  const tailoredSummary=`Manager expérimentée avec plus de 25 ans de parcours dans la direction d’activités, le développement commercial et le management d’équipes. Pour le poste de ${state.job} chez ${state.company}, elle met en avant sa capacité à structurer les opérations, fédérer les collaborateurs, piloter la performance et maintenir un haut niveau de qualité de service. Son approche associe vision stratégique, efficacité de terrain, sens de l’organisation et satisfaction client.`;
  const skills=strategy.prioritySkills.slice(0,8);
  const experience=mergeExperienceAgainstProfile([],strategy);
  const letter=`${rec}

Votre recherche d’un(e) ${state.job} au sein de ${state.company} a retenu toute mon attention. Mon parcours de plus de 25 ans dans la direction d’activités, le développement commercial et le management d’équipes me permet d’aborder cette fonction avec une vision à la fois stratégique, opérationnelle et résolument orientée vers la qualité de service.

J’ai notamment piloté des organisations comptant jusqu’à 50 collaborateurs, accompagné des dirigeants dans des phases de structuration et de développement, coordonné des équipes commerciales et conduit des activités nécessitant rigueur, réactivité et sens des responsabilités. Ces expériences m’ont appris à transformer les objectifs en plans d’action concrets, à fédérer les équipes et à suivre durablement la performance.

Le positionnement du poste, notamment ${kws.slice(0,3).join(', ')||p.focus}, correspond particulièrement à mes compétences et à ma manière de manager. Je souhaite aujourd’hui mettre cette expérience au service de ${state.company}, en contribuant à l’efficacité des opérations, à l’engagement des collaborateurs et à la satisfaction des clients.

Disponible et pleinement investie dans cette nouvelle étape professionnelle, je serais heureuse de pouvoir échanger avec vous afin de présenter plus précisément ma démarche, ma compréhension de vos enjeux et la valeur que je pourrais apporter à votre organisation.

Veuillez agréer l’expression de mes salutations distinguées.

${PROFILE.name}`;
  const message=`${rec}\n\nJe vous adresse ma candidature au poste de ${state.job} au sein de ${state.company}. Vous trouverez ci-joints mon CV et ma lettre de motivation adaptés à cette opportunité.\n\nBien cordialement,\n${PROFILE.name}`;
  return {title:state.job||PROFILE.title,summary:tailoredSummary,skills,value:PROFILE.value,letter,message,messageBase:message,messageChannel:'email',experience,strategy,pageMode:'auto',quality:`Le CV Executive Signature est adapté au poste de ${state.job}. L’ordre des expériences et les compétences ont été priorisés selon l’offre, sans modifier les faits validés.`,source:'local'};
}

function renderResult(){
  const g=state.generated;
  if(!g)return;
  if(!g._careerBrainOriginal)g._careerBrainOriginal=JSON.parse(JSON.stringify(g));
  $('#analysisText').textContent=g.quality||'Dossier préparé et contrôlé.';
  $('#cvTitleEditor').value=g.title||state.job||PROFILE.title;
  $('#cvSummaryEditor').value=g.summary;
  $('#cvSkillsEditor').value=g.skills.join('\n');
  $('#cvValueEditor').value=(g.value||[]).join('\n');
  $('#letterEditor').value=g.letter;
  $('#messageEditor').value=g.message;
  $('#messageChannel').value=g.messageChannel||'email';
  $$('input[name="cvPageMode"]').forEach(r=>r.checked=r.value===(g.pageMode||'auto'));
  previewFitToWidth=true;closeActionsMenu();renderExperienceEditor();renderEditablePreviews();renderBrainExplanation();
  $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab==='cv'));
  $$('.tab-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel==='cv'));
}
function syncEditorsToState(){
  if(!state.generated)return;
  state.generated.title=$('#cvTitleEditor').value.trim()||state.job||PROFILE.title;
  state.generated.summary=$('#cvSummaryEditor').value.trim();
  state.generated.skills=$('#cvSkillsEditor').value.split(/\n|·|,/).map(x=>x.trim()).filter(Boolean).slice(0,10);
  state.generated.value=$('#cvValueEditor').value.split(/\n/).map(x=>x.trim()).filter(Boolean).slice(0,6);
  state.generated.letter=$('#letterEditor').value.trim();
  state.generated.message=$('#messageEditor').value.trim();
  state.generated.messageChannel=$('#messageChannel')?.value||state.generated.messageChannel||'email';
}
function renderExperienceEditor(){
  const box=$('#experienceEditor');if(!box||!state.generated)return;
  const items=[...(state.generated.experience||[])].sort((a,b)=>(a.order||0)-(b.order||0));
  box.innerHTML='';
  items.forEach((e,index)=>{
    const card=document.createElement('article');card.className='experience-edit-card'+(e.visible===false?' is-hidden':'');card.dataset.id=e.id;
    card.innerHTML=`<div class="experience-edit-top"><label class="visibility-toggle"><input type="checkbox" ${e.visible!==false?'checked':''}> Afficher</label><div class="order-actions"><button type="button" data-up aria-label="Monter">↑</button><button type="button" data-down aria-label="Descendre">↓</button></div></div><div class="experience-fields"><label>Fonction<input data-role value="${escapeHtml(e.role)}"></label><label>Entreprise<input data-company value="${escapeHtml(e.company)}"></label><label>Période<input data-years value="${escapeHtml(e.years)}"></label><label class="wide">Description<textarea data-text rows="3">${escapeHtml(e.text)}</textarea></label></div>`;
    card.querySelector('input[type=checkbox]').onchange=ev=>{e.visible=ev.target.checked;card.classList.toggle('is-hidden',!e.visible);scheduleCvUpdate()};
    ['role','company','years','text'].forEach(k=>card.querySelector(`[data-${k}]`).oninput=ev=>{e[k]=ev.target.value;scheduleCvUpdate()});
    card.querySelector('[data-up]').onclick=()=>moveExperience(e.id,-1);
    card.querySelector('[data-down]').onclick=()=>moveExperience(e.id,1);
    box.appendChild(card);
  });
}
function moveExperience(id,delta){
  const arr=[...(state.generated.experience||[])].sort((a,b)=>(a.order||0)-(b.order||0));
  const i=arr.findIndex(x=>x.id===id),j=i+delta;if(i<0||j<0||j>=arr.length)return;
  [arr[i],arr[j]]=[arr[j],arr[i]];arr.forEach((x,n)=>x.order=n);state.generated.experience=arr;renderExperienceEditor();scheduleCvUpdate();
}
function scheduleCvUpdate(){
  renderEditablePreviews();setSaveState('Modifications en attente');clearTimeout(autosaveTimer);autosaveTimer=setTimeout(()=>saveApplication(true),700);
}
function renderEditablePreviews(){
  syncEditorsToState();const g=state.generated;if(!g)return;
  $('#message').textContent=g.message;$('#letterPreview').innerHTML=letterHtml(g.letter);updateLetterAudit();updateChangeSummary();if(g.pageMode==='auto')g.resolvedPages=1;renderCvPreview('normal',0);
}
const FIT_MODES=['normal','compact','dense'];
function renderCvPreview(mode='normal',attempt=0){
  const frame=$('#cvPreviewFrame');if(!frame||!state.generated)return;
  const g=state.generated;
  const useTwoPages=g.pageMode==='two'||(g.pageMode==='auto'&&g.resolvedPages===2);
  g.fitMode=mode;
  g.resolvedPages=useTwoPages?2:1;
  frame.style.height=useTwoPages?'594mm':'297mm';
  frame.srcdoc=cvPrintHtml(g,false,mode);
  frame.onload=()=>{
    try{
      const doc=frame.contentDocument;
      const elements=[...doc.querySelectorAll('.cv-page,.cv,.main,.sidebar')];
      const overflow=elements.some(el=>el.scrollHeight>el.clientHeight+3||el.scrollWidth>el.clientWidth+3);
      if(!useTwoPages&&overflow&&attempt<FIT_MODES.length-1){renderCvPreview(FIT_MODES[attempt+1],attempt+1);return;}
      if(!useTwoPages&&overflow&&g.pageMode==='auto'){g.resolvedPages=2;renderCvPreview('normal',0);return;}
      g.fitMode=mode;g.fitIssue=overflow;
      const status=$('#cvFitStatus');
      if(overflow){status.textContent='Contenu trop long';status.classList.add('error');status.classList.remove('ok')}
      else if(useTwoPages){status.textContent='2 pages A4 validées';status.classList.add('ok');status.classList.remove('error')}
      else{status.textContent=mode==='normal'?'1 page A4 validée':`1 page A4 · ${mode==='compact'?'compression légère':'compression renforcée'}`;status.classList.add('ok');status.classList.remove('error')}
      updateCvAudit();updatePreviewScale();
    }catch(e){$('#cvFitStatus').textContent=useTwoPages?'2 pages chargées':'Aperçu chargé';updateCvAudit();updatePreviewScale()}
  };
}
function updatePreviewScale(){
  const stage=$('#a4Stage'),canvas=$('#a4Canvas'),frame=$('#cvPreviewFrame');
  if(!stage||!canvas||!frame)return;
  requestAnimationFrame(()=>{
    const style=getComputedStyle(stage);
    const available=Math.max(1,stage.clientWidth-parseFloat(style.paddingLeft||0)-parseFloat(style.paddingRight||0));
    const baseWidth=frame.offsetWidth||794;
    const baseHeight=frame.offsetHeight||1123;
    const scale=previewFitToWidth?Math.min(1,available/baseWidth):1;
    frame.style.transform=`scale(${scale})`;
    canvas.style.width=`${Math.round(baseWidth*scale)}px`;
    canvas.style.height=`${Math.round(baseHeight*scale)}px`;
    stage.classList.toggle('is-full-size',!previewFitToWidth);
    const toggle=$('#previewZoomToggle');
    if(toggle){toggle.textContent=previewFitToWidth?'Voir à 100 %':'Adapter à l’écran';toggle.setAttribute('aria-pressed',String(!previewFitToWidth));}
  });
}
function setActionsMenu(open){
  const dock=$('#resultActionsDock'),toggle=$('#mobileActionsToggle');if(!dock||!toggle)return;
  dock.classList.toggle('open',Boolean(open));toggle.setAttribute('aria-expanded',String(Boolean(open)));
  const icon=toggle.querySelector('b');if(icon)icon.textContent=open?'⌄':'⌃';
}
function closeActionsMenu(){setActionsMenu(false)}

function cvCorpus(){
  if(!state.generated)return '';
  const g=state.generated;
  return normalizedToken([g.title,g.summary,...g.skills,...g.value,...(g.experience||[]).filter(e=>e.visible!==false).flatMap(e=>[e.role,e.company,e.text])].join(' '));
}
function updateCvAudit(){
  const g=state.generated;if(!g)return;
  const visible=(g.experience||[]).filter(e=>e.visible!==false);
  const keywords=(state.analysis?.keywords||g.strategy?.atsKeywords||[]).slice(0,8);
  const corpus=cvCorpus();
  const covered=keywords.filter(k=>corpus.includes(normalizedToken(k)));
  const summaryWords=g.summary.trim().split(/\s+/).filter(Boolean).length;
  const checks=[
    {label:'Titre professionnel ciblé',ok:g.title.trim().length>=5,blocking:true},
    {label:`Résumé exécutif (${summaryWords} mots)`,ok:summaryWords>=55&&summaryWords<=125,blocking:false},
    {label:`Compétences vérifiées (${g.skills.length})`,ok:g.skills.length>=5&&g.skills.length<=8,blocking:true},
    {label:`Expériences complètes (${visible.length})`,ok:visible.length>=3&&visible.every(e=>e.role&&e.company&&e.years&&e.text),blocking:true},
    {label:`Tenue sur ${g.resolvedPages===2?'deux pages':'une page'} A4`,ok:!g.fitIssue,blocking:true},
    {label:`Couverture des mots-clés (${covered.length}/${keywords.length||0})`,ok:!keywords.length||covered.length>=Math.min(3,keywords.length),blocking:false}
  ];
  const penalties=checks.reduce((sum,c)=>sum+(c.ok?0:(c.blocking?18:8)),0);
  const score=Math.max(0,100-penalties);
  $('#cvQualityScore').textContent=`${score}/100`;
  $('#cvQualityScore').classList.toggle('ok',score>=85&&!checks.some(c=>c.blocking&&!c.ok));
  $('#cvQualityScore').classList.toggle('error',checks.some(c=>c.blocking&&!c.ok));
  $('#cvAuditList').innerHTML=checks.map(c=>`<div class="audit-item ${c.ok?'ok':'warn'}"><span>${c.ok?'✓':'!'}</span><p>${escapeHtml(c.label)}</p></div>`).join('');
  $('#atsKeywordCoverage').innerHTML=keywords.length?keywords.map(k=>`<span class="ats-chip ${covered.includes(k)?'covered':'missing'}">${covered.includes(k)?'✓ ':''}${escapeHtml(k)}</span>`).join(''):'<span class="ats-empty">Aucune offre complète : contrôle ATS non applicable.</span>';
  const blockers=checks.filter(c=>c.blocking&&!c.ok);
  const print=$('#printCv');print.disabled=blockers.length>0;print.title=blockers.length?`Export bloqué : ${blockers.map(x=>x.label).join(', ')}`:'CV prêt à exporter';
  g.audit={score,checks,coveredKeywords:covered,blocked:blockers.length>0};
}

function renderBrainExplanation(){
  const a=state.analysis||{},p=state.pack||packs[3],strategy=state.generated?.strategy||buildLocalStrategy(p);
  const strengths=(a.strengths||['management','pilotage opérationnel']).map(escapeHtml).join(', ');
  const gaps=(strategy.warnings||a.gaps||[]).length?(strategy.warnings||a.gaps).map(escapeHtml).join(', '):'aucun écart majeur détecté automatiquement';
  const priorities=(strategy.priorityExperienceIds||[]).slice(0,3).map(id=>PROFILE.experience.find(e=>e.id===id)?.role).filter(Boolean).map(escapeHtml).join(', ');
  $('#brainExplanation').innerHTML=`<p><strong>Modèle :</strong> Executive Signature, dérivé du CV étalon validé.</p><p><strong>Positionnement :</strong> ${escapeHtml(p.title)} — ${escapeHtml(p.focus)}.</p><p><strong>Expériences prioritaires :</strong> ${priorities||'ordre chronologique du profil'}.</p><p><strong>Correspondances fortes :</strong> ${strengths}.</p><p><strong>Mots-clés retenus :</strong> ${(strategy.atsKeywords||a.keywords||[]).slice(0,6).map(escapeHtml).join(', ')||'profil et secteur sélectionné'}.</p><p><strong>À vérifier humainement :</strong> ${gaps}. Les dates, entreprises et fonctions restent verrouillées sur le profil validé.</p>`;
}

function splitSentences(text=''){
  const clean=String(text||'').replace(/\s+/g,' ').trim();if(!clean)return [];
  return (clean.match(/[^.!?]+[.!?]+(?:[»”"']|$)?|[^.!?]+$/g)||[clean]).map(x=>x.trim()).filter(Boolean);
}
function experienceTextHtml(text=''){
  const sentences=splitSentences(text);
  if(sentences.length<=1)return `<p class="job-copy">${escapeHtml(sentences[0]||text)}</p>`;
  return `<ul class="job-bullets">${sentences.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`;
}
function summaryHtml(text=''){
  const sentences=splitSentences(text);if(sentences.length<3)return `<p class="summary">${escapeHtml(text)}</p>`;
  const cut=Math.ceil(sentences.length/2);
  return `<div class="summary paragraphs"><p>${sentences.slice(0,cut).map(escapeHtml).join(' ')}</p><p>${sentences.slice(cut).map(escapeHtml).join(' ')}</p></div>`;
}
function letterParagraphs(text=''){
  return String(text||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
}
function letterHtml(text){
  const paragraphs=letterParagraphs(text).map(p=>`<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');
  return `<div class="letter-preview-page"><h3>${escapeHtml((PROFILE.name||'Siham Felchou').toUpperCase())}</h3><p>${PROFILE.address.map(escapeHtml).join('<br>')}<br>${escapeHtml(PROFILE.phone)} · ${escapeHtml(PROFILE.email)}</p><p class="letter-object"><b>Objet : Candidature au poste de ${escapeHtml(state.job)} — ${escapeHtml(state.company)}</b></p>${paragraphs}</div>`;
}
function updateLetterAudit(){
  if(!state.generated)return;const text=state.generated.letter||'';const words=text.split(/\s+/).filter(Boolean).length;
  const ok=words>=170&&words<=390&&Boolean(state.company&&state.job)&&letterParagraphs(text).length>=4;
  const status=$('#letterStatus');if(status){status.textContent=ok?`Lettre validée · ${words} mots`:`À vérifier · ${words} mots`;status.classList.toggle('ok',ok);status.classList.toggle('error',!ok)}
  state.generated.letterAudit={ok,words};const print=$('#printLetter');if(print){print.disabled=!ok;print.title=ok?'Lettre prête à exporter':'Lettre incomplète ou trop courte';}
}
function updateChangeSummary(){
  const el=$('#cvChangeSummary'),g=state.generated,o=g?._careerBrainOriginal;if(!el||!g||!o)return;
  let count=0;if(g.title!==o.title)count++;if(g.summary!==o.summary)count++;
  if(JSON.stringify(g.skills)!==JSON.stringify(o.skills))count++;if(JSON.stringify(g.value)!==JSON.stringify(o.value))count++;
  const current=(g.experience||[]).map(({role,company,years,text,visible,order})=>({role,company,years,text,visible,order}));
  const original=(o.experience||[]).map(({role,company,years,text,visible,order})=>({role,company,years,text,visible,order}));
  if(JSON.stringify(current)!==JSON.stringify(original))count++;
  el.textContent=count?`${count} zone${count>1?'s':''} modifiée${count>1?'s':''} depuis CareerBrain`:'Aucune modification manuelle';
  el.classList.toggle('changed',count>0);
}
function adaptMessageToChannel(channel){
  if(!state.generated)return;const base=state.generated.messageBase||state.generated.message||'';
  const greeting=state.recruiter?`Bonjour ${state.recruiter},`:'Bonjour,';
  let text=base;
  if(channel==='linkedin')text=`${greeting}\n\nJe me permets de vous contacter au sujet du poste de ${state.job} chez ${state.company}. Mon parcours en direction, management d’équipes et développement commercial correspond aux enjeux de cette fonction. Je serais ravie d’échanger avec vous et de vous transmettre mon dossier complet.\n\nBien cordialement,\n${PROFILE.name}`;
  if(channel==='whatsapp')text=`${greeting}\n\nJe vous contacte au sujet du poste de ${state.job} chez ${state.company}. Je vous transmets mon CV et ma lettre adaptés à cette opportunité. Je reste disponible pour un échange.\n\nBien cordialement,\n${PROFILE.name}`;
  if(channel==='email')text=`${greeting}\n\nJe vous adresse ma candidature au poste de ${state.job} au sein de ${state.company}. Vous trouverez ci-joints mon CV et ma lettre de motivation adaptés à cette opportunité. Je reste à votre disposition pour un entretien.\n\nBien cordialement,\n${PROFILE.name}`;
  state.generated.messageChannel=channel;state.generated.message=text;$('#messageEditor').value=text;renderEditablePreviews();scheduleCvUpdate();
}

['cvTitleEditor','cvSummaryEditor','cvSkillsEditor','cvValueEditor','letterEditor','messageEditor'].forEach(id=>$('#'+id).addEventListener('input',scheduleCvUpdate));
$('#previewZoomToggle').onclick=()=>{previewFitToWidth=!previewFitToWidth;updatePreviewScale()};
$$('input[name="cvPageMode"]').forEach(r=>r.onchange=()=>{if(!state.generated)return;state.generated.pageMode=r.value;state.generated.resolvedPages=r.value==='two'?2:1;scheduleCvUpdate()});
$('#adaptMessage').onclick=()=>adaptMessageToChannel($('#messageChannel').value);
$('#messageChannel').onchange=()=>{if(state.generated)state.generated.messageChannel=$('#messageChannel').value};
$('#mobileActionsToggle').onclick=()=>setActionsMenu(!$('#resultActionsDock').classList.contains('open'));
$('#resultActions').addEventListener('click',()=>{if(window.matchMedia('(max-width: 650px)').matches)closeActionsMenu()});
$('#wizard').addEventListener('close',closeActionsMenu);
window.addEventListener('resize',()=>{clearTimeout(previewResizeTimer);previewResizeTimer=setTimeout(updatePreviewScale,100)});
$('#resetCvContent').onclick=()=>{
  const original=state.generated?._careerBrainOriginal;if(!original)return;
  const keep={letter:state.generated.letter,message:state.generated.message,_careerBrainOriginal:original};
  state.generated={...JSON.parse(JSON.stringify(original)),...keep};renderResult();scheduleCvUpdate();
};
$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.toggle('active',x===t));$$('.tab-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===t.dataset.tab));if(t.dataset.tab==='cv')setTimeout(updatePreviewScale,0);closeActionsMenu()});
$('#printCv').onclick=()=>printDoc('cv');$('#printLetter').onclick=()=>printDoc('letter');

function printableBase(title, body, extraCss='', autoPrint=true){
  const bodyPadding=autoPrint?'18px':'0';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>
  :root{--mocha:#a47864;--mocha-dark:#765446;--mocha-soft:#eee4df;--ink:#24201e;--muted:#6e6560;--paper:#fffdfb}
  *{box-sizing:border-box}html,body{margin:0;padding:0;background:#d8d2cf;color:var(--ink);font-family:Arial,Helvetica,sans-serif}body{padding:${bodyPadding}}.print-help{max-width:210mm;margin:0 auto 10px;padding:10px 14px;border-radius:10px;background:#fff;color:#4d403a;font:600 13px Arial,sans-serif;box-shadow:0 4px 16px rgba(0,0,0,.12)}
  ${extraCss}
  @page{size:A4;margin:0}@media print{html,body{width:210mm;height:297mm;background:#fff}body{padding:0}.print-help{display:none!important}}
  </style></head><body>${autoPrint?'<div class="print-help">Document prêt. Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF ».</div>':''}${body}${autoPrint?`<script>window.addEventListener('load',()=>{const imgs=[...document.images];Promise.all(imgs.map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=i.onerror=r}))).then(()=>setTimeout(()=>window.print(),250));});<\/script>`:''}</body></html>`;
}
function cvPrintHtml(g,autoPrint=true,fitMode='normal'){
  const skills=(g.skills||[]).slice(0,8).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const leadership=(PROFILE.leadership||[]).slice(0,5).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const languages=(PROFILE.language||[]).map(x=>`<p>${escapeHtml(x)}</p>`).join('');
  const visibleExp=(g.experience||[]).filter(e=>e.visible!==false).sort((a,b)=>(a.order||0)-(b.order||0)).slice(0,8);
  const values=(g.value||[]).slice(0,6).map(v=>`<div class="value-item">${escapeHtml(v)}</div>`).join('');
  const rawPhoto=PROFILE.photo?.src||'assets/siham.jpg';
  const photoUrl=/^(data:|https?:|blob:)/.test(rawPhoto)?rawPhoto:new URL(rawPhoto,document.baseURI).href;
  const photoX=Number(PROFILE.photo?.x??50),photoY=Number(PROFILE.photo?.y??23),photoZoom=Math.max(1,Number(PROFILE.photo?.zoom||100)/100);
  const role=g.title||state.job||PROFILE.title;
  const displayName=(PROFILE.name||'Siham Felchou').toUpperCase();
  const expHtml=list=>list.map(e=>`<article class="job"><div class="job-head"><p class="job-title">${escapeHtml(e.role)}</p><span class="job-date">${escapeHtml(e.years)}</span></div><p class="company">${escapeHtml(e.company)}</p>${experienceTextHtml(e.text)}</article>`).join('');
  const sidebar=(page=1)=>`<aside class="sidebar"><div class="photo-wrap"><img class="photo" src="${photoUrl}" alt="Photo de ${escapeHtml(PROFILE.name||'Siham Felchou')}"></div><section class="side-block contact"><h2 class="side-title">Coordonnées</h2><p><strong>Téléphone</strong><br>${escapeHtml(PROFILE.phone)}</p><p><strong>E-mail</strong><br>${escapeHtml(PROFILE.email)}</p><p><strong>Adresse</strong><br>${(PROFILE.address||[]).map(escapeHtml).join('<br>')}</p></section><section class="side-block"><h2 class="side-title">Domaines d’expertise</h2><ul>${skills}</ul></section><section class="side-block"><h2 class="side-title">Leadership</h2><ul>${leadership}</ul></section><section class="side-block"><h2 class="side-title">Langues</h2>${languages}</section>${page>1?`<p class="page-number">Page ${page}</p>`:''}</aside>`;
  const header=`<h1 class="name">${escapeHtml(displayName)}</h1><p class="role">${escapeHtml(role)}</p><div class="accent-line"></div>`;
  const formation=`<section class="section education"><h2 class="section-title">Formation</h2><p><strong>${escapeHtml(PROFILE.education)}</strong><br>${escapeHtml(PROFILE.educationSchool)}<br><span>${escapeHtml(PROFILE.educationLevel)}</span></p></section>`;
  const valueBlock=`<section class="section"><h2 class="section-title">Valeur ajoutée</h2><div class="value-grid">${values}</div></section>`;
  const useTwoPages=g.pageMode==='two'||g.resolvedPages===2;
  let body='';
  if(useTwoPages){
    const split=Math.max(1,Math.ceil(visibleExp.length/2));
    const page1=visibleExp.slice(0,split),page2=visibleExp.slice(split);
    body=`<main class="cv-document two-pages fit-${escapeHtml(fitMode)}"><section class="cv-page">${sidebar(1)}<section class="main">${header}<section class="section"><h2 class="section-title">Résumé exécutif</h2>${summaryHtml(g.summary)}</section><section class="section"><h2 class="section-title">Parcours professionnel</h2>${expHtml(page1)}</section></section></section><section class="cv-page">${sidebar(2)}<section class="main">${header}<section class="section"><h2 class="section-title">Parcours professionnel · suite</h2>${expHtml(page2)}</section>${formation}${valueBlock}</section></section></main>`;
  }else{
    body=`<main class="cv-document fit-${escapeHtml(fitMode)}"><section class="cv-page cv">${sidebar(1)}<section class="main">${header}<section class="section"><h2 class="section-title">Résumé exécutif</h2>${summaryHtml(g.summary)}</section><section class="section"><h2 class="section-title">Parcours professionnel</h2>${expHtml(visibleExp)}</section>${formation}${valueBlock}</section></section></main>`;
  }
  const css=`.cv-document{width:210mm;margin:0 auto}.cv-page{width:210mm;height:297mm;overflow:hidden;margin:0 auto;background:var(--paper);display:grid;grid-template-columns:62mm 1fr;box-shadow:0 12px 38px rgba(0,0,0,.16);break-after:page}.cv-page:last-child{break-after:auto}.sidebar{height:297mm;overflow:hidden;background:#eee4df;padding:14mm 7.5mm 9mm;border-right:.25mm solid rgba(118,84,70,.17);position:relative}.photo-wrap{width:40mm;height:40mm;margin:0 auto 10mm;border-radius:50%;padding:2mm;background:#fff;overflow:hidden}.photo{width:100%;height:100%;object-fit:cover;object-position:${photoX}% ${photoY}%;transform:scale(${photoZoom});border-radius:50%;display:block}.side-block{margin-top:7.2mm}.side-title{margin:0 0 2.3mm;color:var(--mocha-dark);font-size:9.1pt;letter-spacing:1.25px;text-transform:uppercase;border-bottom:.3mm solid rgba(118,84,70,.42);padding-bottom:2mm}.contact p,.sidebar li,.sidebar p{font-size:8.2pt;line-height:1.35;margin:0 0 2.4mm}.sidebar ul{list-style:none;padding:0;margin:0}.sidebar li{position:relative;padding-left:4mm}.sidebar li::before{content:'•';position:absolute;left:0;color:var(--mocha);font-weight:bold}.page-number{position:absolute;bottom:7mm;left:0;right:0;text-align:center;color:var(--muted)}.main{height:297mm;overflow:hidden;padding:14mm 13mm 9mm}.name{margin:0;font-size:24pt;letter-spacing:.6px;color:var(--mocha-dark);line-height:1}.role{margin:3mm 0 6mm;font-size:10.8pt;color:var(--ink)}.accent-line{width:36mm;height:1.1mm;background:var(--mocha);margin-bottom:8mm}.section{margin-top:4.1mm}.section:first-of-type{margin-top:0}.section-title{margin:0 0 2.2mm;color:var(--mocha-dark);font-size:10pt;letter-spacing:1px;text-transform:uppercase;display:flex;align-items:center;gap:3mm}.section-title::after{content:'';height:.25mm;flex:1;background:rgba(118,84,70,.34)}.summary{font-size:8.75pt;line-height:1.42;margin:0;orphans:3;widows:3}.summary.paragraphs p{margin:0 0 2.1mm}.summary.paragraphs p:last-child{margin-bottom:0}.job{margin-bottom:3.1mm;break-inside:avoid;page-break-inside:avoid}.job-head{display:grid;grid-template-columns:1fr auto;gap:5mm;align-items:baseline;margin-bottom:1.3mm}.job-title{font-size:9.4pt;font-weight:700;margin:0}.job-date{font-size:8.1pt;color:var(--mocha-dark);font-weight:700;white-space:nowrap}.company{color:var(--muted);font-size:8.2pt;margin:0 0 1.3mm;font-weight:700}.job-copy,.job-bullets{font-size:8.05pt;line-height:1.36;margin:0}.job-bullets{padding:0 0 0 4mm;display:grid;gap:1.1mm}.job-bullets li{padding-left:.5mm;orphans:2;widows:2}.education p{font-size:8.3pt;line-height:1.38;margin:0}.education span{color:var(--muted)}.value-grid{display:grid;grid-template-columns:1fr 1fr;gap:2mm 6mm}.value-item{font-size:8.1pt;line-height:1.32;padding-left:4mm;position:relative;break-inside:avoid}.value-item::before{content:'✓';position:absolute;left:0;color:var(--mocha);font-weight:700}.fit-compact .sidebar{padding-top:12mm}.fit-compact .photo-wrap{width:37mm;height:37mm;margin-bottom:7mm}.fit-compact .side-block{margin-top:5.8mm}.fit-compact .contact p,.fit-compact .sidebar li,.fit-compact .sidebar p{font-size:7.8pt;line-height:1.28;margin-bottom:2mm}.fit-compact .main{padding-top:12mm}.fit-compact .name{font-size:22pt}.fit-compact .role{margin:2.5mm 0 5mm;font-size:10.2pt}.fit-compact .accent-line{margin-bottom:6mm}.fit-compact .section{margin-top:3.3mm}.fit-compact .summary{font-size:8.2pt;line-height:1.34}.fit-compact .job{margin-bottom:2.5mm}.fit-compact .job-copy,.fit-compact .job-bullets{font-size:7.7pt;line-height:1.26}.fit-compact .job-bullets{gap:.7mm}.fit-compact .section-title{font-size:9.4pt;margin-bottom:1.8mm}.fit-compact .value-item,.fit-compact .education p{font-size:7.8pt}.fit-dense .sidebar{padding:10mm 6.5mm 7mm}.fit-dense .photo-wrap{width:34mm;height:34mm;margin-bottom:5mm}.fit-dense .side-block{margin-top:4.5mm}.fit-dense .side-title{font-size:8.3pt;margin-bottom:1.5mm;padding-bottom:1.3mm}.fit-dense .contact p,.fit-dense .sidebar li,.fit-dense .sidebar p{font-size:7.35pt;line-height:1.2;margin-bottom:1.5mm}.fit-dense .main{padding:10mm 11mm 7mm}.fit-dense .name{font-size:20pt}.fit-dense .role{margin:2mm 0 4mm;font-size:9.4pt}.fit-dense .accent-line{margin-bottom:5mm}.fit-dense .section{margin-top:2.6mm}.fit-dense .section-title{font-size:8.9pt;margin-bottom:1.4mm}.fit-dense .summary{font-size:7.7pt;line-height:1.24}.fit-dense .job{margin-bottom:1.9mm}.fit-dense .job-head{margin-bottom:.8mm}.fit-dense .job-title{font-size:8.7pt}.fit-dense .job-date,.fit-dense .company{font-size:7.4pt}.fit-dense .job-copy,.fit-dense .job-bullets{font-size:7.25pt;line-height:1.18}.fit-dense .job-bullets{gap:.45mm}.fit-dense .education p,.fit-dense .value-item{font-size:7.35pt;line-height:1.2}.fit-dense .value-grid{gap:1.4mm 5mm}@media print{.cv-document,.cv-page{box-shadow:none;margin:0}.cv-page{width:210mm;height:297mm}.two-pages .cv-page+ .cv-page{page-break-before:always}}`;
  return printableBase(`CV ${PROFILE.name||'Siham Felchou'} — ${role}`,body,css,autoPrint);
}

function letterPrintHtml(text){
  const paragraphs=letterParagraphs(text).map(p=>`<p>${escapeHtml(p).replace(/\n/g,'<br>')}</p>`).join('');
  const date=new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(new Date());
  const name=PROFILE.name||'Siham Felchou';
  const body=`<main class="letter"><header><div><h1>${escapeHtml(name.toUpperCase())}</h1><p class="signature">${escapeHtml(PROFILE.title||'Direction · Management · Développement commercial')}</p></div><div class="contact">${(PROFILE.address||[]).map(escapeHtml).join('<br>')}<br>${escapeHtml(PROFILE.phone)}<br>${escapeHtml(PROFILE.email)}</div></header><div class="line"></div><section class="recipient"><p><strong>${escapeHtml(state.company||'Entreprise')}</strong>${state.recruiter?`<br>À l’attention de ${escapeHtml(state.recruiter)}`:''}</p><p>Marrakech, le ${date}</p></section><p class="object"><strong>Objet :</strong> Candidature au poste de ${escapeHtml(state.job||'poste proposé')}</p><article>${paragraphs}</article><footer><span>CareerPack · Dossier de candidature personnalisé</span><strong>${escapeHtml(name)}</strong></footer></main>`;
  const css=`.letter{width:210mm;min-height:297mm;margin:0 auto;background:var(--paper);padding:17mm 18mm 13mm;box-shadow:0 12px 38px rgba(0,0,0,.16);display:flex;flex-direction:column}.letter header{display:grid;grid-template-columns:1fr auto;gap:15mm;align-items:start}.letter h1{margin:0;color:var(--mocha-dark);font-size:22pt;letter-spacing:.8px}.signature{margin:2.5mm 0 0;color:var(--muted);font-size:9.6pt;max-width:105mm}.contact{text-align:right;font-size:8.8pt;line-height:1.45}.line{height:1.2mm;width:38mm;background:var(--mocha);margin:6mm 0 10mm}.recipient{display:flex;justify-content:space-between;gap:15mm;font-size:9.3pt;line-height:1.45;margin-bottom:8mm}.recipient p{margin:0}.object{font-size:9.8pt;padding:3.3mm 4mm;background:var(--mocha-soft);border-left:1.2mm solid var(--mocha);margin:0 0 8mm}article{font-family:Georgia,'Times New Roman',serif;font-size:10.5pt;line-height:1.58;text-align:left;orphans:3;widows:3;flex:1}article p{margin:0 0 4.8mm;break-inside:avoid}footer{margin-top:5mm;border-top:.3mm solid rgba(118,84,70,.28);padding-top:4mm;display:flex;justify-content:space-between;align-items:center;color:var(--muted);font-size:8.3pt}footer strong{color:var(--mocha-dark);font-size:9.5pt}@media print{.letter{box-shadow:none;margin:0;width:210mm;min-height:297mm}}`;
  return printableBase(`Lettre de motivation — ${state.job||''}`,body,css);
}

function safeFilename(value=''){
  return normalizedToken(value).replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'').toUpperCase()||'DOCUMENT';
}
function buildExportFilename(type){
  const date=new Date().toISOString().slice(0,10);
  return `${safeFilename(PROFILE.name||'Siham Felchou')}_${type==='cv'?'CV':'LETTRE'}_${safeFilename(state.job)}_${safeFilename(state.company)}_${date}.pdf`;
}
function recordExport(type){
  state.exportHistory=Array.isArray(state.exportHistory)?state.exportHistory:[];
  state.exportHistory.unshift({type,at:new Date().toISOString(),filename:buildExportFilename(type)});
  state.exportHistory=state.exportHistory.slice(0,30);saveApplication(true);
}
function printDoc(type){
  syncEditorsToState();
  if(!state.generated){alert('Aucun dossier n’est prêt à être imprimé.');return}
  if(type==='cv'){
    updateCvAudit();
    if(state.generated.fitIssue){alert(`Le CV dépasse encore ${state.generated.resolvedPages===2?'les deux pages':'la page'} A4. Réduisez le contenu ou changez le format avant l’export.`);return}
    if(state.generated.audit?.blocked){alert('Le contrôle avant export a détecté un élément bloquant. Corrigez les points signalés avant de générer le PDF.');return}
  }else{
    updateLetterAudit();if(!state.generated.letterAudit?.ok){alert('La lettre n’est pas encore validée. Vérifiez son contenu, le poste et l’entreprise avant l’export.');return}
  }
  const html=type==='cv'?cvPrintHtml(state.generated,true,state.generated.fitMode||'normal'):letterPrintHtml(state.generated.letter);
  const popup=window.open('','_blank');
  if(!popup){alert('Le navigateur a bloqué l’ouverture du document. Autorisez les fenêtres contextuelles pour CareerPack puis recommencez.');return}
  recordExport(type);popup.document.open();popup.document.write(html);popup.document.close();
}

function saveApplication(silent=false){
  if(!state.generated)return false;
  syncEditorsToState();const now=new Date().toISOString();state.id=state.id||uid();state.createdAt=state.createdAt||now;state.updatedAt=now;
  const record=JSON.parse(JSON.stringify(state));let items=getApplications();const idx=items.findIndex(x=>x.id===record.id);
  if(idx>=0)items[idx]=record;else items.unshift(record);items=items.slice(0,50);
  const persisted=writeApplications(items);
  setSaveState(persisted?'Enregistrée automatiquement':'Sauvegarde locale indisponible',persisted);
  if(!silent)alert(persisted?'Le dossier de candidature est enregistré dans « Mes candidatures préparées ».':'Le navigateur bloque la sauvegarde locale. Le dossier reste ouvert, mais ne sera pas conservé après fermeture.');
  return persisted;
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
    const exportsCount=Array.isArray(item.exportHistory)?item.exportHistory.length:0;
    row.innerHTML=`<div><strong>${escapeHtml(item.job||'Poste non nommé')}</strong><span>${escapeHtml(item.company||'Entreprise non nommée')} · ${date}${exportsCount?` · ${exportsCount} export${exportsCount>1?'s':''}`:''}</span></div><div class="saved-actions"><button type="button" data-open>Ouvrir</button><button type="button" class="danger" data-delete>Supprimer</button></div>`;
    row.querySelector('[data-open]').onclick=()=>loadApplication(item.id);row.querySelector('[data-delete]').onclick=()=>deleteApplication(item.id);box.appendChild(row);
  });
}
function loadApplication(id){
  const item=getApplications().find(x=>x.id===id);if(!item)return;
  state=item;state.pack=packs.find(p=>p.id===item.pack?.id)||item.pack||packs[3];state.generated=normalizeGenerated(state.generated||{});
  $('#offerText').value=state.offer||'';$('#company').value=state.company||'';$('#job').value=state.job||'';$('#recruiter').value=state.recruiter||'';
  fillAnalysis(state.analysis||localAnalyze(state.offer||''));renderResult();setSaveState('Dossier rouvert',true);$('#libraryDialog').close();setStep(4);$('#wizard').showModal();
}
function deleteApplication(id){
  if(!confirm('Supprimer définitivement cette candidature enregistrée sur cet appareil ?'))return;
  writeApplications(getApplications().filter(x=>x.id!==id));renderSavedApplications();
}

function fillProfileForm(){
  $('#profileName').value=PROFILE.name||'';$('#profileTitle').value=PROFILE.title||'';$('#profilePhone').value=PROFILE.phone||'';$('#profileEmail').value=PROFILE.email||'';
  $('#profileAddress').value=(PROFILE.address||[]).join('\n');$('#profileSummary').value=PROFILE.summary||'';$('#profileSkills').value=(PROFILE.skills||[]).join('\n');
  $('#profileLeadership').value=(PROFILE.leadership||[]).join('\n');$('#profileLanguages').value=(PROFILE.language||[]).join('\n');$('#profileValue').value=(PROFILE.value||[]).join('\n');
  $('#profileEducation').value=PROFILE.education||'';$('#profileEducationSchool').value=PROFILE.educationSchool||'';$('#profileEducationLevel').value=PROFILE.educationLevel||'';
  $('#profilePhotoZoom').value=PROFILE.photo?.zoom||100;$('#profilePhotoX').value=PROFILE.photo?.x??50;$('#profilePhotoY').value=PROFILE.photo?.y??23;pendingProfilePhoto=PROFILE.photo?.src||'assets/siham.jpg';
  renderProfilePhotoPreview();renderProfileExperienceEditor();
}
function renderProfilePhotoPreview(){
  const img=$('#profilePhotoPreview');if(!img)return;img.src=pendingProfilePhoto||'assets/siham.jpg';img.style.objectPosition=`${$('#profilePhotoX').value}% ${$('#profilePhotoY').value}%`;img.style.transform=`scale(${Number($('#profilePhotoZoom').value)/100})`;
}
function renderProfileExperienceEditor(){
  const box=$('#profileExperienceEditor');box.innerHTML='';
  (PROFILE.experience||[]).forEach((e,index)=>{const card=document.createElement('article');card.className='experience-edit-card';card.dataset.index=index;card.innerHTML=`<div class="experience-fields"><label>Fonction<input data-role value="${escapeHtml(e.role)}"></label><label>Entreprise<input data-company value="${escapeHtml(e.company)}"></label><label>Période<input data-years value="${escapeHtml(e.years)}"></label><label class="wide">Description<textarea data-text rows="4">${escapeHtml(e.text)}</textarea></label></div>`;box.appendChild(card)});
}
function profileExperiencesFromForm(){
  return $$('#profileExperienceEditor .experience-edit-card').map((card,index)=>({id:PROFILE.experience?.[index]?.id||`profile-exp-${index}`,role:card.querySelector('[data-role]').value.trim(),company:card.querySelector('[data-company]').value.trim(),years:card.querySelector('[data-years]').value.trim(),text:card.querySelector('[data-text]').value.trim()}));
}
function openProfileEditor(){fillProfileForm();$('#profileDialog').showModal()}
async function resizePhotoFile(file){
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{const img=new Image();img.onerror=reject;img.onload=()=>{const max=800,scale=Math.min(1,max/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.86))};img.src=reader.result};reader.readAsDataURL(file)});
}
function saveProfileFromForm(){
  const next=mergeProfile(BASE_PROFILE,{...PROFILE,name:$('#profileName').value.trim()||PROFILE.name,title:$('#profileTitle').value.trim(),phone:$('#profilePhone').value.trim(),email:$('#profileEmail').value.trim(),address:safeLines($('#profileAddress').value),summary:$('#profileSummary').value.trim(),skills:safeLines($('#profileSkills').value),leadership:safeLines($('#profileLeadership').value),language:safeLines($('#profileLanguages').value),value:safeLines($('#profileValue').value),education:$('#profileEducation').value.trim(),educationSchool:$('#profileEducationSchool').value.trim(),educationLevel:$('#profileEducationLevel').value.trim(),experience:profileExperiencesFromForm(),photo:{src:pendingProfilePhoto||'assets/siham.jpg',zoom:Number($('#profilePhotoZoom').value),x:Number($('#profilePhotoX').value),y:Number($('#profilePhotoY').value)}});
  if(!next.email||!next.phone||!next.summary||next.skills.length<3||next.experience.some(e=>!e.role||!e.company||!e.years||!e.text)){alert('Le profil contient des informations essentielles incomplètes. Vérifiez les coordonnées, le résumé, les compétences et toutes les expériences.');return}
  if(!persistProfile(next)){alert('Le navigateur n’a pas pu enregistrer le profil. Vérifiez l’espace disponible sur cet appareil.');return}
  PROFILE=next;applyProfileToUi();$('#profileDialog').close();alert('Le profil de référence est enregistré sur cet appareil. Il sera utilisé pour les prochaines candidatures.');
}
function exportBackup(){
  const payload={schema:BACKUP_SCHEMA,version:'2.5.2',exportedAt:new Date().toISOString(),profile:PROFILE,applications:getApplications()};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`CareerPack_Siham_Sauvegarde_${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function importBackupFile(file){
  try{const data=JSON.parse(await file.text());if(data.schema!==BACKUP_SCHEMA||!data.profile||!Array.isArray(data.applications))throw new Error('format');if(!confirm(`Importer cette sauvegarde (${data.applications.length} dossier(s)) et remplacer les données locales actuelles ?`))return;const profile=mergeProfile(BASE_PROFILE,data.profile);if(!persistProfile(profile)||!writeApplications(data.applications))throw new Error('storage');PROFILE=profile;applyProfileToUi();renderSavedApplications();alert('Sauvegarde importée avec succès.');}catch(e){alert('Cette sauvegarde est invalide ou n’a pas pu être enregistrée sur cet appareil.');}
}

function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
$('#profileBtn').onclick=openProfileEditor;
['profilePhotoZoom','profilePhotoX','profilePhotoY'].forEach(id=>$('#'+id).addEventListener('input',renderProfilePhotoPreview));
$('#profilePhotoFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{pendingProfilePhoto=await resizePhotoFile(file);renderProfilePhotoPreview()}catch{alert('Cette image n’a pas pu être chargée.')}};
$('#saveProfile').onclick=saveProfileFromForm;
$('#resetProfile').onclick=()=>{if(!confirm('Restaurer le profil d’origine et supprimer les modifications locales du profil ?'))return;PROFILE=mergeProfile(BASE_PROFILE,{});persistProfile(PROFILE);fillProfileForm();applyProfileToUi()};
$('#exportBackup').onclick=exportBackup;
$('#importBackup').onchange=e=>{const file=e.target.files?.[0];if(file)importBackupFile(file);e.target.value=''};
$('#company').addEventListener('input',()=>{const note=$('#companyDetectionNote');if(note){note.textContent='Nom corrigé ou confirmé manuellement.';note.classList.remove('warning')}});
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false});
$('#installBtn').onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;$('#installBtn').hidden=true};
if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(console.warn);
