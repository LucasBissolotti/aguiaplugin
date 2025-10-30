/**
 * Utilitário para detecção e registro de erros do plugin AGUIA
 * Captura erros de JavaScript e os registra para análise
 *
 * @module     local_aguiaplugin/detecao_erros
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function() {
    // Contador para limitar o número de erros registrados
    let errorCount = 0;
    const MAX_ERRORS = 50;
    
    // Armazena os erros para referência
    const errorLog = [];
    
    /**
     * Manipulador global de erros
     */
    window.addEventListener('error', function(event) {
        if (errorCount < MAX_ERRORS) {
            try {
                const error = {
                    message: event.message,
                    source: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    error: event.error ? event.error.stack : null,
                    timestamp: new Date().toISOString()
                };
                
                console.error('Erro do plugin AGUIA:', error);
                errorLog.push(error);
                errorCount++;
                
                // Se for relacionado ao plugin AGUIA, tenta recuperar
                if (event.filename && event.filename.includes('aguiaplugin')) {
                    // Tenta recuperar de erros conhecidos
                    recoverFromError(error);
                    
                    // Impede que o erro se propague no console do navegador
                    event.preventDefault();
                }
            } catch (e) {
                console.error('Erro ao processar erro:', e);
            }
        }
    });

    /**
     * Manipulador de rejeições de promessa não tratadas
     */
    window.addEventListener('unhandledrejection', function(event) {
        if (errorCount < MAX_ERRORS) {
            try {
                const error = {
                    message: event.reason ? event.reason.message : 'Promessa rejeitada',
                    stack: event.reason ? event.reason.stack : null,
                    timestamp: new Date().toISOString()
                };
                
                console.error('Rejeição de promessa não tratada (AGUIA):', error);
                errorLog.push(error);
                errorCount++;
            } catch (e) {
                console.error('Erro ao processar rejeição de promessa:', e);
            }
        }
    });
    
    /**
     * Tenta recuperar de erros conhecidos
     * @param {Object} error - O erro detectado
     */
    function recoverFromError(error) {
        // Se o erro está relacionado a letras destacadas
        if (error.message && error.message.includes('highlightedLetters')) {
            if (!window.highlightedLettersLevel) {
                window.highlightedLettersLevel = 0;
            }
            console.log('Recuperado de erro com highlightedLettersLevel');
        }
        
        // Se o erro está relacionado a elementos DOM não encontrados
        if (error.message && error.message.includes('null') && error.message.includes('classList')) {
            console.log('Erro de manipulação do DOM detectado');
        }
    }
    
    /**
     * Exporta funções de diagnóstico
     */
    /**
     * Retorna uma cópia do log interno de erros do plugin.
     * Uso: `const log = window.aguia_getErrorLog();`
     * @returns {Array<Object>} Cópia do array com objetos de erro.
     */
    window.aguia_getErrorLog = function() {
        return [...errorLog]; // Retorna uma cópia do log
    };
    
    /**
     * Limpa o log interno de erros e reseta o contador de erros.
     * Útil em ambiente de dev para reiniciar a coleta de erros.
     * @returns {void}
     */
    window.aguia_clearErrorLog = function() {
        errorLog.length = 0;
        errorCount = 0;
        console.log('Log de erros do plugin AGUIA limpo');
    };
    
    // Registra no console que o sistema de detecção de erros está ativado
    console.log('Sistema de detecção de erros do plugin AGUIA ativado');
})();
