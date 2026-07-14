const packs=[
  {id:'hotel',icon:'🏨',title:'Hôtellerie de luxe',desc:'Palaces, resorts, hôtels 5 étoiles et riads premium.',cv:'documents/cv/cv-luxury-hospitality.pdf',letter:'documents/lettres/lettre-luxury-hospitality.pdf',focus:'excellence de service, standards qualité, expérience client et management des équipes'},
  {id:'restaurant',icon:'🍽️',title:'Restaurant & Lounge',desc:'Restaurants premium, rooftops, lounges et beach clubs.',cv:'documents/cv/cv-restaurant-lounge.pdf',letter:'documents/lettres/lettre-restaurant-lounge.pdf',focus:'management opérationnel, qualité de service, organisation et développement commercial'},
  {id:'opening',icon:'🚀',title:'Ouverture d’établissement',desc:'Pré-ouverture, lancement, structuration et montée en puissance.',cv:'documents/cv/cv-opening-manager.pdf',letter:'documents/lettres/lettre-opening-manager.pdf',focus:'structuration, recrutement, mise en place des procédures et lancement opérationnel'},
  {id:'executive',icon:'👔',title:'Direction & Management',desc:'Direction opérationnelle, commerciale et générale.',cv:'documents/cv/cv-executive-management.pdf',letter:'documents/lettres/lettre-executive-management.pdf',focus:'direction, leadership, pilotage de la performance et management jusqu’à 50 collaborateurs'}
];

const $=s=>document.querySelector(s);
const wizard=$('#wizard'),libraryDialog=$('#libraryDialog'),sectorChoices=$('#sectorChoices');
let current=null,deferredPrompt=null;

function updateClock(){
  const now=new Date();
  $('#clock').textContent=new Intl.DateTimeFormat('fr-FR',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  $('#dateText').textContent=new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(now);
  const h=now.getHours();
  $('#greeting').textContent=h<12?'Bonjour Siham':h<18?'Bon après-midi Siham':'Bonsoir Siham';
}
updateClock();setInterval(updateClock,1000);

packs.forEach(p=>{
  const b=document.createElement('button');
  b.type='button';b.className='sector-choice';
  b.innerHTML=`<i>${p.icon}</i><strong>${p.title}</strong><small>${p.desc}</small>`;
  b.addEventListener('click',()=>selectSector(p));
  sectorChoices.appendChild(b);
});

function setStep(n){
  document.querySelectorAll('.wizard-step').forEach(s=>s.hidden=Number(s.dataset.step)!==n);
  document.querySelectorAll('.progress-dot').forEach(d=>d.classList.toggle('active',Number(d.dataset.dot)<=n));
}
function openWizard(){current=null;setStep(1);wizard.showModal()}
function selectSector(p){
  current=p;
  $('#assistantHint').textContent=`Pour ${p.title.toLowerCase()}, je mettrai en avant : ${p.focus}.`;
  setStep(2);setTimeout(()=>$('#company').focus(),100);
}
document.querySelectorAll('[data-flow]').forEach(b=>{
  b.addEventListener('click',()=>{
    const flow=b.dataset.flow;
    if(flow==='library'){renderLibrary();libraryDialog.showModal();return}
    openWizard();
  });
});
$('#backToSectors').addEventListener('click',()=>setStep(1));

$('#prepare').addEventListener('click',()=>{
  const company=$('#company').value.trim();
  const job=$('#job').value.trim();
  const recruiter=$('#recruiter').value.trim();
  if(!current){setStep(1);return}
  if(!company||!job){alert("Indiquez l’entreprise et le poste visé.");return}
  const hello=recruiter?`Bonjour ${recruiter},`:'Bonjour,';
  const text=`${hello}

Je vous adresse ma candidature au poste de ${job} au sein de ${company}. Mon expérience en direction, management d’équipes et développement commercial correspond aux responsabilités de cette fonction.

Vous trouverez ci-joints mon CV et ma lettre de motivation adaptés à votre établissement.

Bien cordialement,
Siham Felchou`;
  $('#message').textContent=text;
  $('#analysisText').textContent=`CareerPack a sélectionné le dossier « ${current.title} » et met en avant ${current.focus}.`;
  $('#viewCv').href=current.cv;
  $('#viewLetter').href=current.letter;
  setStep(3);
});

$('#shareText').addEventListener('click',async()=>{
  const text=$('#message').textContent;
  try{
    if(navigator.share) await navigator.share({title:'Candidature Siham Felchou',text});
    else{await navigator.clipboard.writeText(text);alert('Le message a été copié.');}
  }catch(e){}
});
$('#restart').addEventListener('click',()=>{
  $('#company').value='';$('#job').value='';$('#recruiter').value='';openWizard();
});

function renderLibrary(){
  const list=$('#libraryList');list.innerHTML='';
  packs.forEach(p=>{
    const item=document.createElement('div');item.className='library-item';
    item.innerHTML=`<strong>${p.icon} ${p.title}</strong><a href="${p.cv}" target="_blank">CV</a><a href="${p.letter}" target="_blank">Lettre</a>`;
    list.appendChild(item);
  });
}

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();deferredPrompt=e;$('#installBtn').hidden=false;
});
$('#installBtn').addEventListener('click',async()=>{
  if(!deferredPrompt)return;
  deferredPrompt.prompt();await deferredPrompt.userChoice;
  deferredPrompt=null;$('#installBtn').hidden=true;
});

if('serviceWorker'in navigator){
  navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}