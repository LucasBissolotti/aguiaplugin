/**
 * API de interação com preferências do AGUIA
 *
 * @module     local_aguiaplugin/preferences/api_preferencias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function() {
    // Namespace (espaço de nomes)
    window.AguiaAPI = window.AguiaAPI || {};

    // Controle de sincronização automática com o servidor (por padrão habilitada)
    if (typeof window.AguiaAPI.autoSync === 'undefined') {
        window.AguiaAPI.autoSync = true;
    }

    /**
     * Recupera a sesskey do Moodle (se disponível) usada para chamadas seguras ao servidor.
     * Retorna null quando a variável global M ou M.cfg.sesskey não estiver disponível.
     * @returns {string|null} Sesskey do Moodle ou null
     */
    function getSesskey() {
        if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
            return M.cfg.sesskey;
        }
        return null;
    }

    /**
     * Salva uma preferência do usuário.
     * - Faz backup local em localStorage sempre.
     * - Quando aplicável (autoSync true ou options.server=true) tenta enviar ao servidor.
     * Retorna uma Promise que resolve com o resultado (objeto com chave `success`).
     * @param {string} preference Nome da preferência
     * @param {*} value Valor a ser salvo (qualquer JSON-serializável)
     * @param {Object} [options] Opções extras (ex: {server: true} força sincronizar no servidor)
     * @returns {Promise<Object>} Resultado da operação
     */
    // Salvar preferência
    window.AguiaAPI.savePreference = function(preference, value, options) {
        return new Promise((resolve, reject) => {
            // backup local sempre
            localStorage.setItem('aguia_' + preference, JSON.stringify(value));

            const forceServer = options && options.server === true;
            const shouldSyncServer = (window.AguiaAPI.autoSync || forceServer);

            if (shouldSyncServer && typeof M !== 'undefined' && M.cfg && M.cfg.wwwroot) {
                const sesskey = getSesskey();
                const data = { preference, value, ...(sesskey ? { sesskey } : {}) };
                const saveUrl = M.cfg.wwwroot + '/local/aguiaplugin/preferences/salvar.php' + (sesskey ? ('?sesskey=' + encodeURIComponent(sesskey)) : '');

                fetch(saveUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        ...(sesskey ? { 'X-Moodle-Sesskey': sesskey } : {})
                    },
                    credentials: 'same-origin',
                    body: JSON.stringify(data)
                })
                .then(response => {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    }
                    return response.text().then(text => {
                        console.error('Resposta não-JSON do servidor:', text);
                        throw new Error('Resposta não-JSON do servidor');
                    });
                })
                .then(responseData => {
                    if (responseData && responseData.success) {
                        resolve(responseData);
                    } else {
                        resolve({ success: true, local: true, serverError: responseData && responseData.message });
                    }
                })
                .catch(error => {
                    console.error('Erro ao salvar preferência:', error);
                    resolve({ success: true, local: true, error: error.message });
                });
            } else {
                resolve({ success: true, local: true, skippedServer: true });
            }
        });
    };

    /**
     * Carrega preferências mesclando valores locais (localStorage) e valores do servidor.
     * Se o servidor responder com sucesso, as preferências são mescladas e escritas
     * em localStorage. Retorna uma Promise que resolve com o objeto de preferências.
     * @returns {Promise<Object>} Preferências mescladas
     */
    // Carregar preferências (server -> local merge)
    window.AguiaAPI.loadPreferences = function() {
        return new Promise((resolve) => {
            const localPreferences = window.AguiaAPI.loadFromLocalStorage();

            if (typeof M !== 'undefined' && M.cfg && M.cfg.wwwroot) {
                const sesskey = getSesskey();
                const url = M.cfg.wwwroot + '/local/aguiaplugin/preferences/obter.php' + (sesskey ? ('?sesskey=' + encodeURIComponent(sesskey)) : '');
                fetch(url, {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        ...(sesskey ? { 'X-Moodle-Sesskey': sesskey } : {})
                    }
                })
                .then(response => {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    }
                    throw new Error('Resposta não-JSON do servidor');
                })
                .then(data => {
                    if (data && data.success && data.preferences) {
                        const mergedPreferences = { ...localPreferences, ...data.preferences };
                        Object.keys(mergedPreferences).forEach(key => {
                            localStorage.setItem('aguia_' + key, JSON.stringify(mergedPreferences[key]));
                        });
                        resolve(mergedPreferences);
                    } else {
                        resolve(localPreferences);
                    }
                })
                .catch(() => resolve(localPreferences));
            } else {
                resolve(localPreferences);
            }
        });
    };

    /**
     * Lê uma preferência do localStorage com namespace 'aguia_'.
     * Retorna `defaultValue` quando a chave não existe ou o JSON é inválido.
     * @param {string} key Chave da preferência (sem prefixo)
     * @param {*} defaultValue Valor padrão a retornar quando não existir
     * @returns {*} Valor desserializado ou defaultValue
     */
    // Utilitários de localStorage
    window.AguiaAPI.getFromLocalStorage = function(key, defaultValue) {
        const item = localStorage.getItem('aguia_' + key);
        if (item === null) return defaultValue;
        try { return JSON.parse(item); } catch (e) { return defaultValue; }
    };

    window.AguiaAPI.loadFromLocalStorage = function() {
        const getFromLocalStorage = window.AguiaAPI.getFromLocalStorage;
        const preferences = {
            fontSize: getFromLocalStorage('fontSize', 100),
            highContrast: getFromLocalStorage('highContrast', false),
            colorIntensityMode: getFromLocalStorage('colorIntensityMode', 0),
                reduceAnimations: getFromLocalStorage('reduceAnimations', false),
                highlightedLetters: getFromLocalStorage('highlightedLetters', 0),
            readableFonts: getFromLocalStorage('readableFonts', false),
            fontMode: getFromLocalStorage('fontMode', 0),
            lineSpacing: getFromLocalStorage('lineSpacing', 0),
            letterSpacing: getFromLocalStorage('letterSpacing', 0),
            textToSpeech: getFromLocalStorage('textToSpeech', false),
            readingHelper: getFromLocalStorage('readingHelper', false),
            emphasizeLinks: getFromLocalStorage('emphasizeLinks', false),
            headerHighlight: getFromLocalStorage('headerHighlight', false),
            colorblind: getFromLocalStorage('colorblind', 'none'),
            readingMaskMode: getFromLocalStorage('readingMaskMode', 0),
            horizontalMaskLevel: getFromLocalStorage('horizontalMaskLevel', 0),
            verticalMaskLevel: getFromLocalStorage('verticalMaskLevel', 0),
            customCursor: getFromLocalStorage('customCursor', false)
        };
        if (getFromLocalStorage('invertedColors', false) === true) {
            preferences.colorIntensityMode = 3;
        }
        return preferences;
    };

    // Salvar em lote
    window.AguiaAPI.saveAll = function(preferences) {
        const entries = Object.entries(preferences || {});
        if (!entries.length) {
            return Promise.resolve({ results: {}, allOk: true });
        }
        const results = {};
        let chain = Promise.resolve();
        entries.forEach(([pref, val]) => {
            chain = chain.then(() =>
                window.AguiaAPI.savePreference(pref, val, { server: true })
                    .then(r => { results[pref] = r; })
                    .catch(e => { results[pref] = { success: false, error: (e && e.message) || 'erro' }; })
            );
        });
        return chain.then(() => {
            const allOk = Object.values(results).every(r => r && r.success);
            return { results, allOk };
        });
    };

    // Commit local -> servidor
    window.AguiaAPI.commitLocalToServer = function() {
        const prefs = window.AguiaAPI.loadFromLocalStorage();
        return window.AguiaAPI.saveAll(prefs);
    };
})();
