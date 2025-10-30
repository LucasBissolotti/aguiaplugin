/**
 * Gerenciamento de memória para o plugin AGUIA de Acessibilidade
 * Lida com limpeza de event listeners e outros recursos para evitar vazamentos de memória
 *
 * @module     local_aguiaplugin/gerenciamento_memoria
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Lista para acompanhar os event listeners registrados
const registeredEventListeners = [];

/**
 * Registra um event listener para poder removê-lo posteriormente
 * @param {EventTarget} element - O elemento que recebe o event listener
 * @param {string} eventType - O tipo de evento (click, mousemove, etc.)
 * @param {Function} handler - A função de callback
 * @param {boolean|Object} options - Opções para o event listener
 */
function registerEventListener(element, eventType, handler, options = false) {
    if (!element || !eventType || !handler) {
        console.warn('Parâmetros inválidos para registerEventListener');
        return;
    }
    
    try {
        element.addEventListener(eventType, handler, options);
        registeredEventListeners.push({
            element,
            eventType,
            handler,
            options
        });
    } catch (error) {
        console.error('Erro ao registrar event listener:', error);
    }
}

/**
 * Remove todos os event listeners registrados
 */
function cleanupAllEventListeners() {
    try {
        while (registeredEventListeners.length > 0) {
            const listener = registeredEventListeners.pop();
            try {
                listener.element.removeEventListener(
                    listener.eventType, 
                    listener.handler, 
                    listener.options
                );
            } catch (error) {
                console.warn('Erro ao remover event listener:', error);
            }
        }
        console.log('Todos os event listeners foram removidos');
    } catch (error) {
        console.error('Erro ao limpar event listeners:', error);
    }
}

/**
 * Remove event listeners específicos de um elemento
 * @param {EventTarget} element - O elemento de onde remover os event listeners
 */
function cleanupElementEventListeners(element) {
    if (!element) {
        console.warn('Elemento inválido para cleanupElementEventListeners');
        return;
    }
    
    try {
        const remainingListeners = [];
        
        for (const listener of registeredEventListeners) {
            if (listener.element === element) {
                try {
                    listener.element.removeEventListener(
                        listener.eventType, 
                        listener.handler, 
                        listener.options
                    );
                } catch (error) {
                    console.warn(`Erro ao remover ${listener.eventType} de ${element}:`, error);
                }
            } else {
                remainingListeners.push(listener);
            }
        }
        
        // Atualiza a lista mantendo apenas os listeners que não foram removidos
        registeredEventListeners.length = 0;
        registeredEventListeners.push(...remainingListeners);
    } catch (error) {
        console.error('Erro ao limpar event listeners do elemento:', error);
    }
}

// Adiciona um event listener para limpar tudo quando a página for descarregada
window.addEventListener('beforeunload', function() {
    cleanupAllEventListeners();
    
    // Limpa outros recursos que possam estar em uso
    const helperElements = [
        'aguiaReadingHelper',
        'aguiaReadingMask',
        'aguiaCustomCursor'
    ];
    
    for (const id of helperElements) {
        const element = document.getElementById(id);
        if (element) {
            element.remove();
        }
    }
    
    // Limpa variáveis globais para liberar memória
    window.highlightedLettersLevel = null;
});

// Exporta funções para uso global
window.aguia_registerEventListener = registerEventListener;
window.aguia_cleanupAllEventListeners = cleanupAllEventListeners;
window.aguia_cleanupElementEventListeners = cleanupElementEventListeners;
