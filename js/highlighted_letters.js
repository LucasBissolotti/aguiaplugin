/**
 * Funcionalidade de letras destacadas - inspirada no Hand Talk
 * Implementa algoritmo que destaca letras para facilitar a leitura
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Importando a variável do arquivo principal de acessibilidade
// Evita duplicação de variáveis globais
// highlightedLettersLevel é declarada em accessibility_wcag.js

// Elementos que serão processados para destacar letras
const textSelectors = 'p, h1, h2, h3, h4, h5, h6, li, td, th, figcaption, label, blockquote';

// Caracteres especiais e pontuação que receberão tratamento especial
const specialChars = ['.', ',', ';', ':', '!', '?', '-', '–', '—', '(', ')', '[', ']', '"', "'"];

// Vogais que serão destacadas
const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ü'];

/**
 * Função principal para ativar/desativar o destaque de letras
 * Simplificado para apenas alternar entre ativado e desativado
 */
function toggleHighlightedLetters() {
    try {
        // Alterna entre ativado e desativado
        if (typeof highlightedLettersLevel === 'undefined') {
            console.error('highlightedLettersLevel não está definido. Usando valor padrão 0.');
            window.highlightedLettersLevel = 0;
        }
        
        window.highlightedLettersLevel = window.highlightedLettersLevel === 0 ? 1 : 0;
        
        // Remove qualquer destaque de letras anterior
        if (document && document.body) {
            document.body.classList.remove('aguia-highlighted-letters', 'level-1', 'level-2', 'level-3');
        }
        
        // Atualiza UI
        const highlightBtn = document.getElementById('aguiaHighlightedLettersBtn');
        if (highlightBtn) {
            // Atualiza o estado do botão
            if (window.highlightedLettersLevel > 0) {
                highlightBtn.classList.add('active');
                document.body.classList.add('aguia-highlighted-letters');
                document.body.classList.add('level-1'); // Sempre usa level-1
                
                // Verifica se a função showStatusMessage existe
                if (typeof showStatusMessage === 'function') {
                    showStatusMessage('Letras destacadas ativado', 'success');
                }
            } else {
                highlightBtn.classList.remove('active');
                
                // Verifica se a função showStatusMessage existe
                if (typeof showStatusMessage === 'function') {
                    showStatusMessage('Letras destacadas desativado');
                }
            }
        }
        
        // Salva preferência se a função existir
        if (typeof saveUserPreference === 'function') {
            saveUserPreference('highlightedLetters', window.highlightedLettersLevel);
        }
    } catch (error) {
        console.error('Erro ao alternar letras destacadas:', error);
    }
}

/**
 * Aplica o destaque de letras de acordo com o nível
 * @param {number} level - Nível de destaque (1-3)
 */
function applyLetterHighlighting(level) {
    // Não precisamos fazer nada programaticamente, já que estamos usando apenas CSS para aplicar negrito
    // Os estilos CSS já aplicam o font-weight de acordo com o nível
    console.log(`Aplicando letras destacadas nível ${level} - apenas negrito`);
    
    // Não precisa de processamento de elementos individuais, pois o CSS já aplica o estilo globalmente
}

/**
 * Remove todos os destaques de letras aplicados
 */
function removeAllLetterHighlighting() {
    // Não precisamos remover nada manualmente, basta remover as classes CSS do body
    // As classes são removidas em toggleHighlightedLetters()
    console.log("Removendo letras destacadas");
}

// Removemos as funções de destaque de letras individuais, pois estamos usando apenas negrito aplicado via CSS

// Removemos as funções de processamento de HTML e observador do DOM, 
// pois estamos usando apenas CSS para aplicar o negrito ao texto
// Não precisamos mais manipular o DOM diretamente

/**
 * Carrega as preferências do usuário para o destaque de letras
 * Esta função deve ser chamada durante a inicialização
 * Simplificado para aplicar apenas negrito
 */
function loadHighlightedLettersPreference() {
    try {
        // Verifica se a função getStoredPreference existe
        if (typeof getStoredPreference !== 'function') {
            console.warn('Função getStoredPreference não encontrada');
            return;
        }

        const level = parseInt(getStoredPreference('highlightedLetters')) || 0;
        if (level > 0) {
            // Acessa a variável global do arquivo accessibility_wcag.js
            if (typeof window.highlightedLettersLevel !== 'undefined') {
                window.highlightedLettersLevel = 1; // Sempre usa nível 1
            }
            
            if (document && document.body) {
                document.body.classList.add('aguia-highlighted-letters');
                document.body.classList.add('level-1');
                
                // Atualiza o botão se existir
                const highlightBtn = document.getElementById('aguiaHighlightedLettersBtn');
                if (highlightBtn) {
                    highlightBtn.classList.add('active');
                }
            }
        }
    } catch (error) {
        console.error('Erro ao carregar preferências de letras destacadas:', error);
    }
}

/**
 * Obtém uma preferência armazenada
 * @param {string} key - A chave da preferência
 * @returns {*} - O valor armazenado ou undefined
 */
function getStoredPreference(key) {
    try {
        // Verifica se key é válido
        if (!key || typeof key !== 'string') {
            console.warn('Chave inválida para getStoredPreference');
            return undefined;
        }
        
        // Tenta obter do localStorage se disponível
        if (typeof localStorage !== 'undefined') {
            try {
                return localStorage.getItem(`aguia_${key}`);
            } catch (storageError) {
                // Pode ocorrer erro de segurança em alguns contextos
                console.warn('Erro ao acessar localStorage:', storageError);
            }
        }
    } catch (error) {
        console.error('Erro em getStoredPreference:', error);
    }
    return undefined;
}

// Removemos os estilos dinâmicos, pois estamos usando apenas CSS para aplicar negrito
