/**
 * Script adicional para garantir que o botão da lupa funcione independentemente
 * Implementação da lupa de conteúdo para o plugin AGUIA
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/*
 * @module     local_aguiaplugin/ampliador_autonomo
 */

/**
 * Responsável por criar o botão e a lupa standalone.
 */
(function() {
    // Definições de constantes
    const STORAGE_KEY = 'aguia_magnifier_enabled';
    const BUTTON_ID = 'aguia-magnifier-standalone-button';
    const MAGNIFIER_ID = 'aguia-standalone-magnifier';
    
    /**
     * Cria o elemento da lupa no DOM se ainda não existir.
     * Retorna o elemento criado ou o existente.
     *
     * @returns {HTMLElement|null} Elemento da lupa ou null se não for possível criá-lo
     */
    // Criar o elemento da lupa
    function createMagnifier() {
        // Verificar se já existe
        if (document.getElementById(MAGNIFIER_ID)) {
            return;
        }
        
        // Obter o escopo do AGUIA
        const aguiaScope = document.getElementById('aguia-scope-element') || 
                          window.AGUIA_SCOPE || 
                          document.querySelector('#page') || 
                          document.querySelector('#page-content') || 
                          document.querySelector('main') || 
                          document.body;
        
        const magnifier = document.createElement('div');
        magnifier.id = MAGNIFIER_ID;
        magnifier.className = 'aguia-magnifier aguia-magnifier-hidden';
        
        // Adicionar ao escopo do AGUIA ou ao body se não encontrar
        aguiaScope.appendChild(magnifier);
        
        return magnifier;
    }
    
    /**
     * Cria o botão flutuante da lupa (standalone). O botão é inserido no
     * documento mas fica invisível por padrão para preservar funcionalidade
     * sem afetar a interface visual.
     *
     * @returns {HTMLButtonElement} O botão criado
     */
    // Criar o botão flutuante da lupa
    function createButton() {
        // Verificar se já existe ou se deve ser ocultado
        if (document.getElementById(BUTTON_ID)) {
            return;
        }
        
        // Criar o botão mas mantê-lo invisível na DOM
        // para preservar a funcionalidade sem exibição visual
        const button = document.createElement('button');
        button.id = BUTTON_ID;
        button.className = 'aguia-standalone-button';
        button.setAttribute('aria-label', 'Ativar Lupa de Conteúdo');
        button.setAttribute('title', 'Lupa de Conteúdo');
        button.style.display = 'none'; // Ocultar o botão visualmente
        button.style.visibility = 'hidden'; // Garantir que está invisível
        button.style.opacity = '0'; // Completamente transparente
        button.style.pointerEvents = 'none'; // Não interceptar eventos
        
        // Ícone de lupa
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5Z"/>
            </svg>
        `;
        
        // Verificar o estado da lupa
        const isEnabled = localStorage.getItem(STORAGE_KEY) === 'true';
        if (isEnabled) {
            button.classList.add('active');
            const scope = document.getElementById('page') || document.querySelector('#page-content') || document.querySelector('main') || document.body;
            scope.classList.add('aguia-magnifier-active');
        }
        
        // Adicionar ao body
        document.body.appendChild(button);
        
        return button;
    }
    
    /**
     * Alterna o estado da lupa (ativa/inativa) atualizando classes no
     * escopo do AGUIA e persistindo o estado em localStorage.
     * @param {HTMLElement} button Elemento botão que controla a lupa
     * @returns {void}
     */
    // Alternar o estado da lupa
    function toggleMagnifier(button) {
        const isActive = button.classList.contains('active');
        
        // Obter o escopo do AGUIA
        const aguiaScope = document.getElementById('aguia-scope-element') || 
                          window.AGUIA_SCOPE || 
                          document.querySelector('#page') || 
                          document.querySelector('#page-content') || 
                          document.querySelector('main') || 
                          document.body;
        
        if (isActive) {
            button.classList.remove('active');
            aguiaScope.classList.remove('aguia-magnifier-active');
            localStorage.setItem(STORAGE_KEY, 'false');
        } else {
            button.classList.add('active');
            aguiaScope.classList.add('aguia-magnifier-active');
            localStorage.setItem(STORAGE_KEY, 'true');
        }
    }
    
    /**
     * Dado um elemento apontado (por exemplo, um nó clicado), procura o
     * elemento que contém o texto mais relevante nas proximidades. Evita
     * elementos não relevantes (scripts, estilos, pre/code) e retorna o
     * elemento que melhor representa conteúdo legível.
     *
     * @param {Element} element Elemento de partida
     * @returns {Element|null} Elemento de texto encontrado ou null
     */
    // Encontrar o elemento de texto relevante mais próximo
    function findTextElement(element) {
        // Lista de tags que geralmente contêm conteúdo de texto legível
        const contentTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'SPAN', 'A', 'STRONG', 'EM', 'LABEL', 'BUTTON', 'TD', 'TH'];
        
        // Lista de tags a serem evitadas (que não são relevantes para conteúdo)
        const avoidTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE'];
        
        // Verificar se o elemento deve ser evitado completamente
        if (avoidTags.includes(element.tagName)) {
            return null;
        }
        
        // Verificar se o elemento atual tem uma tag de conteúdo
        if (contentTags.includes(element.tagName)) {
            const text = element.textContent.trim();
            if (text && text.length > 1) {
                return element;
            }
        }
        
        // Verificar se o elemento tem texto direto significativo
        if (element.childNodes && element.childNodes.length > 0) {
            let hasDirectText = false;
            
            for (const node of element.childNodes) {
                if (node.nodeType === Node.TEXT_NODE && 
                    node.textContent.trim().length > 1) {
                    hasDirectText = true;
                    break;
                }
            }
            
            if (hasDirectText) {
                return element;
            }
        }
        
        // Procurar nos filhos primeiro
        for (const tag of contentTags) {
            const childElements = element.querySelectorAll(tag);
            for (const child of childElements) {
                if (child.textContent.trim().length > 1) {
                    return child;
                }
            }
        }
        
        // Se não encontrou nada específico, retornar o elemento atual
        return element;
        
        // Verificar se é um elemento estrutural a ser ignorado
        const hasIgnorePattern = (el) => {
            if (!el.className && !el.id) return false;
            const classAndId = (el.className || '') + ' ' + (el.id || '');
            return ignorePatterns.some(pattern => classAndId.toLowerCase().includes(pattern));
        };
        
        // Se o elemento parecer estrutural, buscar um elemento filho com texto
        if (hasIgnorePattern(element)) {
            // Procurar um elemento filho que seja de conteúdo
            const contentChild = Array.from(element.querySelectorAll(contentTags.join(',')))
                .find(el => el.textContent.trim().length > 1);
                
            if (contentChild) {
                return contentChild;
            }
        }
        
        // Se for um elemento que contém texto diretamente, retorná-lo
        if (element.childNodes && element.childNodes.length && 
            Array.from(element.childNodes).some(node => 
                node.nodeType === Node.TEXT_NODE && node.textContent.trim() && 
                node.textContent.trim().length > 1 && 
                !/^[#.{}\[\]]+$/.test(node.textContent.trim())
            )) {
            return element;
        }
        
        // Verificar elementos pais para encontrar o mais relevante
        let parent = element;
        let textElement = null;
        
        // Procurar em até 4 níveis acima
        for (let i = 0; i < 4; i++) {
            if (!parent || parent === document.body) break;
            
            // Verificar elementos irmãos
            const siblings = Array.from(parent.parentNode?.children || []);
            for (const sibling of siblings) {
                if (contentTags.includes(sibling.tagName) && 
                    sibling.textContent.trim() && 
                    sibling.textContent.trim().length > 1 && 
                    !/^[#.{}\[\]]+$/.test(sibling.textContent.trim()) &&
                    !hasIgnorePattern(sibling)) {
                    textElement = sibling;
                    break;
                }
            }
            
            if (textElement) break;
            parent = parent.parentNode;
        }
        
        return textElement || element;
    }
    
    /**
     * Limpa uma string de texto removendo trechos de CSS/estrutura que podem
     * aparecer como ruído (linhas, declarações de estilo) e limita o
     * comprimento para exibição na lupa.
     *
     * @param {string} text Texto bruto
     * @returns {string} Texto limpo
     */
    // Limpar o texto para remover apenas as linhas azuis estruturais
    function cleanupText(text) {
        // Remover linhas vazias e espaços extras
        let cleaned = text.replace(/\n\s*\n/g, '\n').trim();
        
        // Remover apenas caracteres de código específicos que causam linhas azuis
        cleaned = cleaned.replace(/\{|\}|<style>|<\/style>/g, '');
        
        // Remover padrões específicos de CSS que aparecem como linhas azuis
        cleaned = cleaned.replace(/\.[-a-z0-9_]+\s*\{\s*border[^}]*\}/gi, '');
        cleaned = cleaned.replace(/\.[-a-z0-9_]+\s*\{\s*outline[^}]*\}/gi, '');
        cleaned = cleaned.replace(/border(-[a-z]+)?:\s*[^;]+;/gi, '');
        cleaned = cleaned.replace(/outline(-[a-z]+)?:\s*[^;]+;/gi, '');
        
        // Remover declarações de CSS puras que podem causar linhas
        cleaned = cleaned.replace(/^\s*\.[a-z0-9_-]+\s*\{[^}]*\}\s*$/gmi, '');
        cleaned = cleaned.replace(/^\s*#[a-z0-9_-]+\s*\{[^}]*\}\s*$/gmi, '');
        
        // Preservar quebras de linha normais e formatação do texto
        cleaned = cleaned.replace(/\s{3,}/g, ' ');
        
        // Limitar o comprimento máximo do texto para evitar sobrecarga
        if (cleaned.length > 500) {
            cleaned = cleaned.substring(0, 500) + '...';
        }
        cleaned = cleaned.replace(/[\[\]#.]/g, ' ');
        
        // Remover linhas azuis (que geralmente são delimitadores de CSS/HTML)
        cleaned = cleaned.replace(/border(-[a-z]+)?:[^;]+;/g, '');
        cleaned = cleaned.replace(/outline(-[a-z]+)?:[^;]+;/g, '');
        
        // Remover múltiplos espaços
        cleaned = cleaned.replace(/\s\s+/g, ' ');
        
        // Limitar o comprimento máximo do texto para evitar sobrecarga
        if (cleaned.length > 500) {
            cleaned = cleaned.substring(0, 500) + '...';
        }
        
        return cleaned;
    }
    
    // Atualizar a posição e conteúdo da lupa
    function updateMagnifier(e, magnifier) {
        // Obter o escopo do AGUIA
        const aguiaScope = document.getElementById('aguia-scope-element') || 
                          window.AGUIA_SCOPE || 
                          document.querySelector('#page') || 
                          document.querySelector('#page-content') || 
                          document.querySelector('main') || 
                          document.body;
                          
        if (!aguiaScope.classList.contains('aguia-magnifier-active')) {
            magnifier.classList.add('aguia-magnifier-hidden');
            return;
        }
        
        // Obter o elemento sob o cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        
        // Verificar se o elemento é válido
        if (!element || 
            element === magnifier || 
            element.id === BUTTON_ID || 
            element.id === 'aguia-content-magnifier' || 
            element.id === MAGNIFIER_ID ||
            element.closest('#aguiaMenu')) {
            magnifier.classList.add('aguia-magnifier-hidden');
            return;
        }
        
        // Obter o texto do elemento
        let text = '';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            text = element.value;
        } else {
            // Buscar o elemento de texto relevante mais próximo ou usar o atual
            const textElement = findTextElement(element);
            
            // Extrair o texto mantendo a estrutura da página
            if (textElement) {
                // Obter o texto diretamente para preservar a estrutura da página
                text = textElement.textContent.trim();
                
                // Se não tivermos texto significativo, verificar se temos texto alternativo
                if (!text && textElement.getAttribute('alt')) {
                    text = textElement.getAttribute('alt');
                }
                
                // Se não tivermos texto significativo, verificar se temos aria-label
                if (!text && textElement.getAttribute('aria-label')) {
                    text = textElement.getAttribute('aria-label');
                }
            } else {
                text = element.textContent.trim();
            }
        }
        
        // Se não houver texto, esconder a lupa
        if (!text) {
            magnifier.classList.add('aguia-magnifier-hidden');
            return;
        }
        
        // Limpar o texto para remover elementos estruturais
        text = cleanupText(text);
        
        // Atualizar o conteúdo da lupa
        magnifier.textContent = text;
        
        // Posicionar a lupa abaixo do cursor
        magnifier.style.left = `${e.pageX}px`;
        magnifier.style.top = `${e.pageY + 35}px`;
        
        // Mostrar a lupa
        magnifier.classList.remove('aguia-magnifier-hidden');
    }
    
    // Inicializar quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Verificar se já existe o elemento principal aguia-content-magnifier
            if (!document.getElementById('aguia-content-magnifier')) {
                // Criar elementos apenas se não existirem já
                const magnifier = createMagnifier();
                const button = createButton();
                
                // Adicionar evento de clique ao botão
                button.addEventListener('click', function() {
                    toggleMagnifier(button);
                });
                
                // Adicionar atalho de teclado para ativar/desativar a lupa (Alt+L)
                document.addEventListener('keydown', function(e) {
                    // Verificar se é a combinação Alt+L
                    if (e.altKey && e.key.toLowerCase() === 'l') {
                        // Simular clique no botão
                        toggleMagnifier(button);
                        e.preventDefault();
                    }
                });
                
                // Adicionar evento de movimento do mouse
                document.addEventListener('mousemove', function(e) {
                    updateMagnifier(e, magnifier);
                });
            }
        } catch (error) {
            console.error('Erro ao inicializar lupa standalone:', error);
        }
        
        // Adicionar estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .aguia-standalone-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background-color: #2271ff;
                color: white;
                border: none;
                border-radius: 50%;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                transition: all 0.3s ease;
            }
            
            .aguia-standalone-button:hover {
                background-color: #1b5fd0;
                transform: scale(1.1);
            }
            
            .aguia-standalone-button.active {
                background-color: #185abc;
                box-shadow: 0 0 0 3px rgba(34, 113, 255, 0.3);
            }
            
            .aguia-magnifier {
                position: absolute;
                background-color: white;
                border: 2px solid #2271ff;
                border-radius: 8px;
                padding: 12px 18px;
                font-size: 22px !important;
                font-weight: 500;
                color: #000;
                z-index: 9998;
                max-width: 300px;
                min-width: 100px;
                max-height: 300px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                pointer-events: none;
                transition: opacity 0.2s ease;
                overflow-y: auto;
                overflow-x: hidden;
                white-space: normal;
                line-height: 1.5;
            }
            
            .aguia-magnifier-hidden {
                opacity: 0 !important;
                visibility: hidden !important;
            }
            
            .aguia-magnifier-active p:hover,
            .aguia-magnifier-active span:hover,
            .aguia-magnifier-active a:hover,
            .aguia-magnifier-active h1:hover,
            .aguia-magnifier-active h2:hover,
            .aguia-magnifier-active h3:hover,
            .aguia-magnifier-active h4:hover,
            .aguia-magnifier-active h5:hover,
            .aguia-magnifier-active h6:hover,
            .aguia-magnifier-active li:hover,
            .aguia-magnifier-active td:hover,
            .aguia-magnifier-active div:hover {
                outline: 2px solid rgba(34, 113, 255, 0.5);
                cursor: help;
            }
        `;
        
        document.head.appendChild(style);
    });
})();
