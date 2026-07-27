const CACHE='careerpack-siham-v2-5-3-clock-header';
const ASSETS=['./','index.html','config.js','assets/style.css','assets/app.js','assets/profile.js','assets/siham.jpg','manifest.webmanifest','documents/cv/cv-executive-management.pdf','documents/cv/cv-luxury-hospitality.pdf','documents/cv/cv-restaurant-lounge.pdf','documents/cv/cv-opening-manager.pdf'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([clients.claim(),caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))});
