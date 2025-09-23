/**
 * API de interação com preferências do AGUIA
 *
 * @module     local_aguiaplugin/api
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function() {
    // Namespace para a API AGUIA
    window.AguiaAPI = window.AguiaAPI || {};
    
    /**
     * Salva uma preferência do usuário
     * @param {string} preference - Nome da preferência
     * @param {*} value - Valor da preferência
     * @returns {Promise} - Promise que resolve quando a preferência for salva
     */
    window.AguiaAPI.savePreference = function(preference, value) {
        return new Promise((resolve, reject) => {
            // Sempre salva no localStorage como backup
            localStorage.setItem('aguia_' + preference, JSON.stringify(value));
            
            // Se o usuário estiver logado no Moodle, tenta salvar via AJAX
            if (typeof M !== 'undefined' && M.cfg && M.cfg.wwwroot) {
                const data = { preference, value };
                
                fetch(M.cfg.wwwroot + '/local/aguiaplugin/preferences/save.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    // Verificar se a resposta é JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    } else {
                        // Se não for JSON, usar o localStorage (já salvo acima)
                        console.warn('Resposta não-JSON do servidor ao salvar preferência');
                        throw new Error('Resposta não-JSON do servidor');
                    }
                })
                .then(data => {
                    if (data && data.success) {
                        resolve(data);
                    } else {
                        console.warn('Servidor retornou erro ao salvar preferência:', data.message);
                        // Mas já temos no localStorage, então podemos resolver com sucesso local
                        resolve({ success: true, local: true, serverError: data.message });
                    }
                })
                .catch(error => {
                    console.error('Erro ao salvar preferência no servidor:', error);
                    // Mas já temos no localStorage, então podemos resolver com sucesso local
                    resolve({ success: true, local: true, error: error.message });
                });
            } else {
                // Quando não tem acesso ao Moodle, usamos apenas o localStorage
                resolve({ success: true, local: true });
            }
        });
    };
    
    /**
     * Carrega as preferências do usuário
     * @returns {Promise} - Promise que resolve com as preferências do usuário
     */
    window.AguiaAPI.loadPreferences = function() {
        return new Promise((resolve) => {
            // Carrega as preferências do localStorage primeiro para termos um fallback imediato
            const localPreferences = window.AguiaAPI.loadFromLocalStorage();
            
            // Primeiro tenta carregar do Moodle
            if (typeof M !== 'undefined' && M.cfg && M.cfg.wwwroot) {
                fetch(M.cfg.wwwroot + '/local/aguiaplugin/preferences/get.php', {
                    method: 'GET',
                    credentials: 'same-origin' // Importante para cookies de sessão
                })
                .then(response => {
                    // Verificar se a resposta é JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    } else {
                        console.warn('Resposta não-JSON do servidor ao carregar preferências');
                        throw new Error('Resposta não-JSON do servidor');
                    }
                })
                .then(data => {
                    if (data && data.success && data.preferences) {
                        // Combina as preferências do servidor com as locais para caso falte algo
                        const mergedPreferences = { ...localPreferences, ...data.preferences };
                        
                        // Salva as preferências atualizadas no localStorage
                        Object.keys(mergedPreferences).forEach(key => {
                            localStorage.setItem('aguia_' + key, JSON.stringify(mergedPreferences[key]));
                        });
                        
                        resolve(mergedPreferences);
                    } else {
                        // Se não houver preferências no servidor, usa as do localStorage
                        console.info('Nenhuma preferência encontrada no servidor, usando localStorage');
                        resolve(localPreferences);
                    }
                })
                .catch((error) => {
                    // Em caso de erro, usa as preferências do localStorage
                    console.warn('Erro ao carregar preferências do servidor:', error);
                    resolve(localPreferences);
                });
            } else {
                // Para usuários não logados ou quando não tem acesso ao Moodle, usa localStorage
                resolve(localPreferences);
            }
        });
    };
    
    /**
     * Recupera um valor do localStorage
     * @param {string} key - Chave a ser recuperada
     * @param {any} defaultValue - Valor padrão caso a chave não exista
     * @returns {any} - Valor recuperado ou valor padrão
     */
    window.AguiaAPI.getFromLocalStorage = function(key, defaultValue) {
        const item = localStorage.getItem('aguia_' + key);
        if (item === null) return defaultValue;
        try {
            return JSON.parse(item);
        } catch (e) {
            return defaultValue;
        }
    };
    
    /**
     * Carrega preferências do localStorage
     * @returns {Object} - Objeto com as preferências do usuário
     */
    window.AguiaAPI.loadFromLocalStorage = function() {
        const getFromLocalStorage = window.AguiaAPI.getFromLocalStorage;
        
        const preferences = {
            fontSize: getFromLocalStorage('fontSize', 100),
            highContrast: getFromLocalStorage('highContrast', false),
            colorIntensityMode: getFromLocalStorage('colorIntensityMode', 0),
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
        
        // Compatibilidade com versões anteriores
        if (getFromLocalStorage('invertedColors', false) === true) {
            preferences.colorIntensityMode = 3; // Escala de cinza é o mais próximo das cores invertidas
        }
        
        return preferences;
    };
})();