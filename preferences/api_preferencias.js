/**
 * API de interação com preferências do AGUIA
 *
 * @module     local_aguiaplugin/preferences/api_preferencias
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function() {
    window.AguiaAPI = window.AguiaAPI || {};
    
    window.AguiaAPI.savePreference = function(preference, value) {
        return new Promise((resolve, reject) => {
            if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
                const data = { preference, value };
                
                fetch(M.cfg.wwwroot + '/local/aguiaplugin/preferences/salvar.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Moodle-Sesskey': M.cfg.sesskey
                    },
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
                .then(responseData => resolve(responseData))
                .catch(error => {
                    console.error('Erro ao salvar preferência:', error);
                    localStorage.setItem('aguia_' + preference, JSON.stringify(value));
                    reject(error);
                });
            } else {
                localStorage.setItem('aguia_' + preference, JSON.stringify(value));
                resolve({ success: true, local: true });
            }
        });
    };
    
    window.AguiaAPI.loadPreferences = function() {
        return new Promise((resolve) => {
            if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
                fetch(M.cfg.wwwroot + '/local/aguiaplugin/preferences/obter.php', {
                    method: 'GET',
                    headers: {
                        'X-Moodle-Sesskey': M.cfg.sesskey
                    }
                })
                .then(response => {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    }
                    return response.text().then(text => {
                        console.error('Resposta não-JSON do servidor:', text);
                        return { success: false, error: 'Resposta não-JSON do servidor' };
                    });
                })
                .then(data => {
                    if (data && data.success !== false && data.preferences) {
                        resolve(data.preferences);
                    } else {
                        console.info('Carregando preferências do localStorage devido a erro ou dados ausentes do servidor');
                        resolve(window.AguiaAPI.loadFromLocalStorage());
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar preferências:', error);
                    resolve(window.AguiaAPI.loadFromLocalStorage());
                });
            } else {
                resolve(window.AguiaAPI.loadFromLocalStorage());
            }
        });
    };
    
    window.AguiaAPI.getFromLocalStorage = function(key, defaultValue) {
        const item = localStorage.getItem('aguia_' + key);
        if (item === null) return defaultValue;
        try {
            return JSON.parse(item);
        } catch (e) {
            return defaultValue;
        }
    };
    
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
        
        if (getFromLocalStorage('invertedColors', false) === true) {
            preferences.colorIntensityMode = 3;
        }
        
        return preferences;
    };
})();
