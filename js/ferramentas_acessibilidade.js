/**
 * API centralizada para integração de acessibilidade
 *
 * @module     local_aguiaplugin/accessibility_tools
 * @copyright  2024 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Este módulo fornece uma API centralizada para acessar e utilizar as ferramentas
 * de acessibilidade do Plugin AGUIA. Este arquivo atua como um ponto de entrada
 * para que outros módulos possam integrar facilmente com as ferramentas de acessibilidade.
 * 
 * Importações:
 *   - Preferências: Carrega a API de preferências para acesso aos dados de configuração
 */

define([
    'local_aguiaplugin/preferences/api'
], function() {
    // Define o namespace global AGUIA
    window.AGUIA = window.AGUIA || {};
    
    /**
     * Inicializa as ferramentas de acessibilidade
     * @returns {Promise} Promise que resolve quando a inicialização estiver concluída
     */
    window.AGUIA.init = function() {
        return new Promise(function(resolve) {
            // Carrega as preferências do usuário
            AguiaAPI.loadPreferences().then(function(prefs) {
                // Aplica as preferências à página
                applyPreferences(prefs);
                
                // Inicializa a barra de ferramentas
                initToolbar();
                
                resolve(prefs);
            });
        });
    };
    
    /**
     * Aplica as preferências do usuário à página
     * @param {Object} prefs - Objeto com as preferências do usuário
     */
    function applyPreferences(prefs) {
        // Aplicar tamanho da fonte
        if (prefs.fontSize && prefs.fontSize !== 100) {
            const scope = document.getElementById('page') || document.querySelector('#page-content') || document.querySelector('main') || document.body;
            scope.style.fontSize = prefs.fontSize + '%';
        }
        
        // Aplicar contraste alto
        if (prefs.highContrast) {
            const scope = document.getElementById('page') || document.querySelector('#page-content') || document.querySelector('main') || document.body;
            scope.classList.add('aguia-high-contrast');
        }
        
        // Aplicar fontes para leitura facilitada
        if (prefs.readableFonts) {
            const scope = document.getElementById('page') || document.querySelector('#page-content') || document.querySelector('main') || document.body;
            scope.classList.add('aguia-readable-fonts');
        }
        
        // Aplicar modo de daltonismo
        if (prefs.colorblind && prefs.colorblind !== 'none') {
            const scope = document.getElementById('page') || document.querySelector('#page-content') || document.querySelector('main') || document.body;
            scope.classList.add('aguia-colorblind-' + prefs.colorblind);
        }
        
        // Outras preferências serão aplicadas conforme necessário
        console.log('AGUIA: Preferências aplicadas', prefs);
    }
    
    /**
     * Inicializa a barra de ferramentas de acessibilidade
     */
    function initToolbar() {
        // A implementação da barra de ferramentas será feita em outro módulo
        console.log('AGUIA: Barra de ferramentas inicializada');
    }
    
    return {
        /**
         * Inicializa as ferramentas de acessibilidade
         * @returns {Promise} Promise que resolve quando a inicialização estiver concluída
         */
        init: window.AGUIA.init,
        
        /**
         * Acesso direto à API de preferências
         */
        preferences: window.AguiaAPI
    };
});