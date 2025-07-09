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

    // Se for requisição para a API
    if (event.request.url.includes(apiUrl)) {
        // Estratégia Network-Only para a API (nunca usa cache)
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Se offline e for API, mostra mensagem específica
                    return new Response(JSON.stringify({
                        message: "Você está offline. Os dados da API não estão disponíveis."
                    }), {
                        headers: {'Content-Type': 'application/json'}
                    });
                })
        );
    } else {
        // Para outros arquivos (CSS, JS, etc.) - estratégia Cache First
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    }
});
