/**
 * API de interação com preferências do AGUIA
 *
 * @module     local_aguiaplugin/preferences/api
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
            // Se o usuário estiver logado no Moodle, salva via AJAX
            if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
                const data = { preference, value };
                
                fetch(M.cfg.wwwroot + '/local/aguiaplugin/preferences/save.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Moodle-Sesskey': M.cfg.sesskey
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    // First check if the response is valid JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json().then(data => {
                            return data;
                        }).catch(error => {
                            console.error('Erro ao processar JSON:', error);
                            throw new Error('Resposta inválida do servidor');
                        });
                    } else {
                        // If not JSON, get the text and log error details
                        return response.text().then(text => {
                            console.error('Resposta não-JSON do servidor:', text);
                            throw new Error('Resposta não-JSON do servidor');
                        });
                    }
                })
                .then(data => resolve(data))
                .catch(error => {
                    console.error('Erro ao salvar preferência:', error);
                    // Save to localStorage as a fallback
                    localStorage.setItem('aguia_' + preference, JSON.stringify(value));
                    reject(error);
                });
            } else {
                // Fallback para localStorage quando não estiver logado
                localStorage.setItem('aguia_' + preference, JSON.stringify(value));
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
            // Primeiro tenta carregar do Moodle para usuários logados
            if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
                fetch(M.cfg.wwwroot + '/local/aguiaplugin/preferences/get.php', {
                    method: 'GET',
                    headers: {
                        'X-Moodle-Sesskey': M.cfg.sesskey
                    }
                })
                .then(response => {
                    // First check if the response is valid JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json().then(data => {
                            return data;
                        }).catch(error => {
                            console.error('Erro ao processar JSON:', error);
                            return { success: false, error: 'Resposta inválida do servidor' };
                        });
                    } else {
                        // If not JSON, get the text and log error details
                        return response.text().then(text => {
                            console.error('Resposta não-JSON do servidor:', text);
                            return { success: false, error: 'Resposta não-JSON do servidor' };
                        });
                    }
                })
                .then(data => {
                    if (data && data.success !== false && data.preferences) {
                        resolve(data.preferences);
                    } else {
                        // Se não houver preferências no Moodle ou ocorreu um erro, carrega do localStorage
                        console.info('Carregando preferências do localStorage devido a erro ou dados ausentes do servidor');
                        resolve(window.AguiaAPI.loadFromLocalStorage());
                    }
                })
                .catch(error => {
                    // Em caso de erro, carrega do localStorage
                    console.error('Erro ao carregar preferências:', error);
                    resolve(window.AguiaAPI.loadFromLocalStorage());
                });
            } else {
                // Para usuários não logados, carrega do localStorage
                resolve(window.AguiaAPI.loadFromLocalStorage());
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