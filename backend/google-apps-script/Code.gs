/**
 * CareerPack V2 — Gemini Gateway (Google Apps Script)
 * Stocke GEMINI_API_KEY dans Script Properties.
 * Déployer comme Web App : exécuter en tant que propriétaire, accès "Toute personne".
 */
const DEFAULT_MODEL = 'gemini-2.5-flash';

function doGet() {
  return json_({ ok: true, service: 'CareerPack AI Gateway', version: '2.0.0' });
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
  return `Tu es CareerBrain, analyste de recrutement senior. Analyse l'offre sans inventer de faits.\n\nOFFRE :\n${payload.offer || ''}\n\nPROFIL CANDIDAT :\n${JSON.stringify(profile)}\n\nRéponds uniquement en JSON strict avec cette structure :\n{\n  "score": entier de 0 à 100,\n  "sector": "hotel" | "restaurant" | "opening" | "executive",\n  "job": "intitulé du poste détecté",\n  "company": "entreprise détectée ou chaîne vide",\n  "keywords": [maximum 10 mots-clés ATS],\n  "strengths": [3 à 5 correspondances réelles],\n  "gaps": [0 à 4 écarts ou informations absentes],\n  "summary": "explication claire en 2 phrases"\n}\nLe score doit être prudent et explicable. Ne transforme jamais une absence en compétence.`;
}

function buildGeneratePrompt_(payload, profile) {
  return `Tu es un binôme composé d'un recruteur exécutif et d'un rédacteur de candidatures haut de gamme. Tu adaptes fidèlement le profil à l'offre, sans inventer de diplôme, langue, outil, résultat chiffré ni expérience.\n\nPROFIL :\n${JSON.stringify(profile)}\n\nOFFRE :\n${payload.offer || 'Mode rapide sans annonce complète'}\n\nANALYSE :\n${JSON.stringify(payload.analysis || {})}\n\nCONTEXTE :\nEntreprise : ${payload.company || ''}\nPoste : ${payload.job || ''}\nRecruteur : ${payload.recruiter || ''}\nSecteur choisi : ${JSON.stringify(payload.sector || {})}\n\nRéponds uniquement en JSON strict :\n{\n  "summary": "résumé exécutif ciblé, 70 à 100 mots",\n  "skills": [8 à 10 compétences vérifiables],\n  "experience": [reprends toutes les expériences du profil, même faits et dates, descriptions ciblées sans invention],\n  "letter": "lettre professionnelle complète, 250 à 330 mots",\n  "message": "message WhatsApp/email de 60 à 100 mots",\n  "quality": "phrase expliquant le positionnement retenu et les points mis en avant",\n  "source": "gemini"\n}\nStyle : cadre expérimentée, naturel, crédible, concis, jamais grandiloquent. Le CV doit pouvoir résister à une vérification en entretien.`;
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
