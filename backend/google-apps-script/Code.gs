/**
 * CareerPack V2 — Gemini Gateway (Google Apps Script)
 * Stocke GEMINI_API_KEY dans Script Properties.
 * Déployer comme Web App : exécuter en tant que propriétaire, accès "Toute personne".
 */
const DEFAULT_MODEL = 'gemini-2.5-flash';

function doGet() {
  return json_({ ok: true, service: 'CareerPack AI Gateway', version: '2.5.2' });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const action = body.action || '';
    const payload = body.payload || {};
    const profile = body.profile || {};
    if (!['analyze', 'generate'].includes(action)) throw new Error('Action non autorisée.');

    const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!key) throw new Error('GEMINI_API_KEY absente dans Script Properties.');
    const model = PropertiesService.getScriptProperties().getProperty('GEMINI_MODEL') || DEFAULT_MODEL;

    const prompt = action === 'analyze'
      ? buildAnalyzePrompt_(payload, profile)
      : buildGeneratePrompt_(payload, profile);

    const result = callGemini_(key, model, prompt);
    return json_({ ok: true, result: result });
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function callGemini_(key, model, prompt) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent?key=' + encodeURIComponent(key);
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.25,
        responseMimeType: 'application/json'
      }
    })
  });
  const code = response.getResponseCode();
  const text = response.getContentText();
  if (code < 200 || code >= 300) throw new Error('Gemini HTTP ' + code + ' : ' + text.slice(0, 500));
  const data = JSON.parse(text);
  const raw = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;
  if (!raw) throw new Error('Réponse Gemini vide.');
  return JSON.parse(raw);
}

function buildAnalyzePrompt_(payload, profile) {
  return `Tu es CareerBrain, analyste de recrutement senior. Analyse l'offre sans inventer de faits.

OFFRE :
${payload.offer || ''}

PROFIL CANDIDAT :
${JSON.stringify(profile)}

Réponds uniquement en JSON strict avec cette structure :
{
  "score": entier de 0 à 100,
  "sector": "hotel" | "restaurant" | "opening" | "executive",
  "job": "intitulé exact du poste détecté",
  "company": "nom réel de l'employeur ou de la marque, sinon chaîne vide",
  "companyEvidence": "court extrait exact de l'offre justifiant le nom, sinon chaîne vide",
  "keywords": [maximum 10 mots-clés ATS],
  "strengths": [3 à 5 correspondances réelles],
  "gaps": [0 à 4 écarts ou informations absentes],
  "summary": "explication claire en 2 phrases"
}
Règles strictes pour company :
- retourne uniquement l'employeur ou la marque qui recrute ;
- ne retourne jamais un type de contrat (temps plein, temps partiel, CDI, CDD, stage), un horaire, une localisation, une plateforme, une date, un niveau d'expérience ou un avantage ;
- si le nom n'est pas suffisamment certain, retourne une chaîne vide ;
- companyEvidence doit reprendre quelques mots réellement présents dans l'offre.
Le score doit être prudent et explicable. Ne transforme jamais une absence en compétence.`;
}

function buildGeneratePrompt_(payload, profile) {
  return `Tu es un binôme composé d'un recruteur exécutif et d'un rédacteur de candidatures haut de gamme. Tu adaptes fidèlement le profil à l'offre, sans inventer de diplôme, langue, outil, résultat chiffré ni expérience.\n\nPROFIL :\n${JSON.stringify(profile)}\n\nOFFRE :\n${payload.offer || 'Mode rapide sans annonce complète'}\n\nANALYSE :\n${JSON.stringify(payload.analysis || {})}\n\nCONTEXTE :\nEntreprise : ${payload.company || ''}\nPoste : ${payload.job || ''}\nRecruteur : ${payload.recruiter || ''}\nSecteur choisi : ${JSON.stringify(payload.sector || {})}\n\nRéponds uniquement en JSON strict :\n{\n  "title": "titre professionnel ciblé, sobre et crédible",\n  "summary": "résumé exécutif ciblé, 70 à 105 mots, composé de phrases courtes et distinctes",\n  "skills": [5 à 8 compétences choisies uniquement dans profile.skills],\n  "value": [4 à 6 éléments choisis uniquement dans profile.value],\n  "experience": [{"id":"identifiant exact du profil"}],\n  "strategy": {\n    "template": "executive-signature",\n    "priorityExperienceIds": ["identifiants exacts du profil dans l’ordre recommandé"],\n    "prioritySkills": ["compétences exactes de profile.skills"],\n    "atsKeywords": ["maximum 8 mots-clés réellement utiles"],\n    "rationale": "explication concise de la stratégie",\n    "warnings": ["éléments à vérifier humainement"]\n  },\n  "letter": "lettre professionnelle complète, 220 à 320 mots, structurée en 5 à 7 paragraphes courts séparés par une ligne vide",\n  "message": "message WhatsApp/email de 60 à 100 mots",\n  "quality": "phrase expliquant le positionnement retenu et les points mis en avant",\n  "source": "gemini"\n}\nStyle : cadre expérimentée, naturel, crédible, concis, jamais grandiloquent. Chaque phrase d’expérience doit exprimer une seule idée vérifiable afin de permettre un affichage en puces lisibles. Le CV doit pouvoir résister à une vérification en entretien. Les dates, entreprises et fonctions doivent rester identiques au profil source.`;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** À exécuter une fois dans l'éditeur après avoir remplacé les valeurs. */
function setupSecrets() {
  PropertiesService.getScriptProperties().setProperties({
    GEMINI_API_KEY: 'COLLEZ_VOTRE_CLE_ICI',
    GEMINI_MODEL: DEFAULT_MODEL
  });
}
