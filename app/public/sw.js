const CACHE_NAME = "sistema-dizimo-v3";

const ARQUIVOS_INICIAIS = [
    "/",
    "/favicon.png",
    "/icon-192.png",
    "/icon-512.png",
    "/manifest.webmanifest",
];

// ========================================
// INSTALAÇÃO
// ========================================

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ARQUIVOS_INICIAIS);
        })
    );

    self.skipWaiting();
});

// ========================================
// ATIVAÇÃO
// ========================================

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((nomes) => {
            return Promise.all(
                nomes
                    .filter((nome) => nome !== CACHE_NAME)
                    .map((nome) => caches.delete(nome))
            );
        })
    );

    self.clients.claim();
});

// ========================================
// REQUISIÇÕES
// ========================================

self.addEventListener("fetch", (event) => {
    const requisicao = event.request;

    // Não interfere em POST, PUT, PATCH ou DELETE.
    if (requisicao.method !== "GET") {
        return;
    }

    const url = new URL(requisicao.url);

    // Não interfere na API do Render
    // nem em outros domínios.
    if (url.origin !== self.location.origin) {
        return;
    }

    // ========================================
    // PDF.JS / MÓDULOS .MJS
    // ========================================

    // O pdf.js utiliza worker .mjs.
    // Sempre deixa esses arquivos virem da rede.
    if (url.pathname.toLowerCase().endsWith(".mjs")) {
        return;
    }

    // ========================================
    // NAVEGAÇÃO / INDEX.HTML
    // ========================================

    // Sempre tenta buscar a versão mais recente.
    // Se estiver offline, usa o cache.
    if (requisicao.mode === "navigate") {
        event.respondWith(
            fetch(requisicao)
                .then((resposta) => {
                    if (resposta && resposta.status === 200) {
                        const copia = resposta.clone();

                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put("/", copia);
                        });
                    }

                    return resposta;
                })
                .catch(() => {
                    return caches.match("/");
                })
        );

        return;
    }

    // ========================================
    // JAVASCRIPT E CSS
    // ========================================

    // Para JS e CSS:
    // rede primeiro, cache apenas se estiver offline.
    if (
        url.pathname.endsWith(".js") ||
        url.pathname.endsWith(".css")
    ) {
        event.respondWith(
            fetch(requisicao)
                .then((resposta) => {
                    if (
                        resposta &&
                        resposta.status === 200 &&
                        resposta.type !== "opaque"
                    ) {
                        const copia = resposta.clone();

                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(requisicao, copia);
                        });
                    }

                    return resposta;
                })
                .catch(() => {
                    return caches.match(requisicao);
                })
        );

        return;
    }

    // ========================================
    // DEMAIS ARQUIVOS ESTÁTICOS
    // ========================================

    // Imagens, ícones, manifest etc.
    // Pode usar cache primeiro.
    event.respondWith(
        caches.match(requisicao).then((respostaCache) => {
            if (respostaCache) {
                return respostaCache;
            }

            return fetch(requisicao).then((respostaRede) => {
                if (
                    !respostaRede ||
                    respostaRede.status !== 200 ||
                    respostaRede.type === "opaque"
                ) {
                    return respostaRede;
                }

                const copia = respostaRede.clone();

                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(requisicao, copia);
                });

                return respostaRede;
            });
        })
    );
});