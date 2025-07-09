const version = 1;
const cachename = 'app-cache-v' + version;

const arquivos = [
    "./",
    "./index.html",
    "./script.js",
    "./service-worker.js",
    "./manifest.json",
    "./style.css",
    "./imagens/logo192.png",
    "./imagens/logo512.png"
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(cachename).then(function(cache) {
            return cache.addAll(arquivos);
        })
    );
});

self.addEventListener('fetch', function(event) {
    const apiUrl = '/api'; // Rota da sua API

    // Se for a API, usa estratégia "NetworkFirst" (busca da rede, depois cache)
    if (event.request.url.includes(apiUrl)) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Atualiza o cache com a resposta da API
                    const responseClone = response.clone();
                    caches.open(cachename).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // Se offline, retorna dados cacheados (se existirem)
                    return caches.match(event.request);
                })
        );
    } else {
        // Para outros arquivos (CSS, JS, etc.)
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request).then(function(fetchResponse) {
                    let responseClone = fetchResponse.clone();
                    caches.open(cachename).then(function(cache) {
                        cache.put(event.request, responseClone);
                    });
                    return fetchResponse;
                }).catch(function() {
                    return caches.match('./index.html'); // Fallback offline
                });
            })
        );
    }
});
