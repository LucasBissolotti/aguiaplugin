/**
 * Implementação da lupa de conteúdo para o plugin AGUIA
 * Inspirada na funcionalidade da Hand Talk
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Definindo namespace para a funcionalidade da lupa de conteúdo
const AguiaMagnifier = {
    // Configurações da lupa
    config: {
        storageKey: 'aguia_magnifier_enabled',
        fontSize: '20px',
        fontWeight: '500',
        padding: '10px 15px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#2271ff',
        borderWidth: '2px',
        borderRadius: '8px',
        maxWidth: '300px',
        minWidth: '100px',
        zIndex: 9999
    },
    
    // Estado da lupa
    state: {
        enabled: false,
        magnifier: null,
        button: null
    },
    
    // Inicialização da lupa
    init: function() {
        // Verificar estado inicial
        this.state.enabled = this.isEnabled();
        
        // Criar o elemento da lupa
        this.createMagnifierElement();
        
        // Criar o botão da lupa
        this.createMagnifierButton();
        
        // Adicionar evento de movimento do mouse
        document.addEventListener('mousemove', this.updateMagnifier.bind(this));
        
        // Adicionar a lupa ao menu principal do AGUIA
        this.addToMainMenu();
        
        console.log('AGUIA Magnifier: Lupa de conteúdo inicializada');
    },
    
    // Verificar se a lupa estava ativada anteriormente
    isEnabled: function() {
        return localStorage.getItem(this.config.storageKey) === 'true';
    },
    
    // Salvar o estado da lupa
    saveState: function(enabled) {
        localStorage.setItem(this.config.storageKey, enabled);
        this.state.enabled = enabled;
    },
    
    // Criar o elemento da lupa que será mostrado ao usuário
    createMagnifierElement: function() {
        const magnifier = document.createElement('div');
        magnifier.id = 'aguia-content-magnifier';
        magnifier.classList.add('aguia-magnifier-hidden');
        
        // Adicionar ao body
        document.body.appendChild(magnifier);
        
        this.state.magnifier = magnifier;
    },
    
    // Criar o botão para ativar/desativar a lupa
    createMagnifierButton: function() {
        // Verificar se o botão já existe
        if (document.getElementById('aguia-magnifier-button')) {
            return;
        }
        
        // Criar o botão flutuante principal se ele ainda não existir
        let aguiaButton = document.querySelector('.aguia-button');
        if (!aguiaButton) {
            aguiaButton = document.createElement('button');
            aguiaButton.id = 'aguia-main-button';
            aguiaButton.className = 'aguia-button';
            aguiaButton.innerHTML = '<img src="/local/aguiaplugin/pix/AguiaLogo.png" alt="AGUIA" class="aguia-logo">';
            aguiaButton.setAttribute('title', 'AGUIA - Acessibilidade');
            document.body.appendChild(aguiaButton);
        }
        
        // Verificar se o painel principal do AGUIA existe ou criar
        let aguiaPanel = document.getElementById('aguia-menu-panel');
        if (!aguiaPanel) {
            aguiaPanel = document.createElement('div');
            aguiaPanel.id = 'aguia-menu-panel';
            aguiaPanel.className = 'aguia-menu-panel';
            aguiaPanel.style.display = 'none'; // Garantir que o painel esteja oculto inicialmente
            
            // Criar o título do painel
            const panelTitle = document.createElement('h3');
            panelTitle.textContent = 'Ferramentas de Acessibilidade';
            aguiaPanel.appendChild(panelTitle);
            
            // Criar o container para os botões
            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'aguia-buttons-container';
            aguiaPanel.appendChild(buttonsContainer);
            
            document.body.appendChild(aguiaPanel);
        }
        
        // Criar o botão da lupa
        const magnifierButton = document.createElement('button');
        magnifierButton.id = 'aguia-magnifier-button';
        magnifierButton.className = 'aguia-feature-button aguia-magnifier-button';
        magnifierButton.setAttribute('title', 'Ativar/Desativar lupa de conteúdo');
        magnifierButton.innerHTML = AguiaIcons.magnifier + ' Lupa de Conteúdo';
        
        // Verificar estado inicial
        if (this.state.enabled) {
            magnifierButton.classList.add('active');
            document.body.classList.add('aguia-magnifier-active');
        }
        
        // Adicionar evento de clique para ativar/desativar a lupa
        magnifierButton.addEventListener('click', this.toggleMagnifier.bind(this));
        
        // Adicionar o botão ao container de botões
        const buttonsContainer = document.querySelector('.aguia-buttons-container');
        if (buttonsContainer) {
            buttonsContainer.appendChild(magnifierButton);
        }
        
        this.state.button = magnifierButton;
    },
    
    // Alternar o estado da lupa (ativar/desativar)
    toggleMagnifier: function() {
        const isActive = this.state.enabled;
        
        if (isActive) {
            // Desativar a lupa
            this.state.button.classList.remove('active');
            document.body.classList.remove('aguia-magnifier-active');
            this.saveState(false);
        } else {
            // Ativar a lupa
            this.state.button.classList.add('active');
            document.body.classList.add('aguia-magnifier-active');
            this.saveState(true);
        }
    },
    
    // Atualizar a posição e conteúdo da lupa
    updateMagnifier: function(e) {
        if (!this.state.enabled) {
            return;
        }
        
        const magnifier = this.state.magnifier;
        
        // Obter o elemento sob o cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        
        // Verificar se o elemento é válido para exibir a lupa
        if (!element || 
            element.id === 'aguia-content-magnifier' || 
            element.id === 'aguia-standalone-magnifier' ||
            element.closest('#aguia-menu-panel') || 
            element === magnifier) {
            magnifier.classList.add('aguia-magnifier-hidden');
            return;
        }
        
        // Obter o texto do elemento
        let text = '';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            text = element.value;
        } else {
            // Buscar o elemento de texto relevante mais próximo ou usar o atual
            const textElement = this.findTextElement(element);
            
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
        
        // Se o elemento não tem texto, não mostramos a lupa
        if (!text) {
            magnifier.classList.add('aguia-magnifier-hidden');
            return;
        }
        
        // Limpar o texto removendo linhas vazias, formatações extras e estruturas
        text = this.cleanupText(text);
        
        // Definir o conteúdo da lupa
        magnifier.textContent = text;
        
        // Posicionar a lupa abaixo do cursor
        magnifier.style.left = `${e.pageX}px`;
        magnifier.style.top = `${e.pageY + 35}px`; // 35px abaixo do cursor
        
        // Mostrar a lupa
        magnifier.classList.remove('aguia-magnifier-hidden');
    },
    
    // Limpar o texto para remover apenas as linhas azuis estruturais
    cleanupText: function(text) {
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
    },
    
    // Encontrar o elemento de texto relevante mais próximo
    findTextElement: function(element) {
        // Lista de tags que geralmente contêm conteúdo de texto legível
        const contentTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'SPAN', 'A', 'STRONG', 'EM', 'LABEL', 'BUTTON', 'TD', 'TH'];
        
        // Lista de tags a serem evitadas (que não são relevantes para conteúdo)
        const avoidTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'CODE', 'PRE'];
        
        // Lista de classes/IDs que sugerem que um elemento é apenas estrutural
        const ignorePatterns = [
            'header', 'footer', 'nav', 'menu', 'sidebar', 
            'container', 'wrapper', 'row', 'col', 'grid',
            '-border', 'border-', 'outline', 'frame', 'line'
        ];
        
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
        
        // Verificar se é um elemento estrutural a ser ignorado
        const hasIgnorePattern = function(el) {
            if (!el.className && !el.id) return false;
            const classAndId = (el.className || '') + ' ' + (el.id || '');
            return ignorePatterns.some(pattern => classAndId.toLowerCase().includes(pattern));
        };
        
        // Se o elemento parecer estrutural, buscar um filho com texto
        if (hasIgnorePattern(element)) {
            for (const tag of contentTags) {
                const elements = element.querySelectorAll(tag);
                for (const el of elements) {
                    if (el.textContent.trim().length > 1) {
                        return el;
                    }
                }
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
        
        // Verificar elementos pais para encontrar o mais relevante
        let parent = element;
        let textElement = null;
        
        // Procurar em até 3 níveis acima
        for (let i = 0; i < 3; i++) {
            if (!parent || parent === document.body) break;
            
            const siblings = Array.from(parent.parentNode?.children || []);
            for (const sibling of siblings) {
                if (contentTags.includes(sibling.tagName) && 
                    sibling.textContent.trim() && 
                    sibling.textContent.trim().length > 1) {
                    textElement = sibling;
                    break;
                }
            }
            
            if (textElement) break;
            parent = parent.parentNode;
        }
        
        // Se não encontrou nada específico, retornar o elemento atual
        return textElement || element;
    },
    
    // Adicionar a lupa ao menu principal do AGUIA
    addToMainMenu: function() {
        // Aguardar a criação do menu de acessibilidade
        setTimeout(() => {
            const accessibilityMenu = document.querySelector('.aguia-accessibility-menu');
            if (accessibilityMenu) {
                const menuItem = document.createElement('li');
                menuItem.innerHTML = `<a href="#" id="aguia-menu-magnifier">${AguiaIcons.magnifier} Lupa de Conteúdo</a>`;
                
                menuItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleMagnifier();
                });
                
                accessibilityMenu.appendChild(menuItem);
                    accessibilityMenu.appendChild(menuItem);
                }
            }, 1000);
        }
    };
// Inicializar a lupa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Verificar se já existe alguma implementação
        if (!document.querySelector('h3:not([id]):not([class]):not([style*="display: none"])')) {
            // Inicializar o módulo da lupa
            setTimeout(function() {
                AguiaMagnifier.init();
            }, 500); // Pequeno atraso para garantir que o display_fix.js tenha tempo de executar
        }
    } catch (e) {
        console.error('Erro ao inicializar AguiaMagnifier:', e);
    }
});
    
    // Função para atualizar a posição e conteúdo da lupa
    function updateMagnifier(e) {
        if (!document.body.classList.contains('aguia-magnifier-active')) {
            return;
        }
        
        // Obter o elemento sob o cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        
        // Verificar se o elemento é um texto ou possui texto
        if (!element || 
            element.id === 'aguia-content-magnifier' || 
            element.closest('#aguia-accessibility-panel') || 
            element === magnifier) {
            magnifier.classList.add('aguia-magnifier-hidden');
            return;
        }
        
        // Obter o texto do elemento
        let text = '';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            text = element.value;
        } else {
            // Para outros elementos, obtemos o texto visível
            text = element.textContent.trim();
        }
        
        // Se o elemento não tem texto, não mostramos a lupa
        if (!text) {
            magnifier.classList.add('aguia-magnifier-hidden');
            return;
        }
        
        // Definir o conteúdo da lupa
        magnifier.textContent = text;
        
        // Posicionar a lupa abaixo do cursor
        magnifier.style.left = `${e.pageX}px`;
        magnifier.style.top = `${e.pageY + 25}px`; // 25px abaixo do cursor
        
        // Mostrar a lupa
        magnifier.classList.remove('aguia-magnifier-hidden');
    }
    
    // Adicionar o evento de movimento do mouse
    document.addEventListener('mousemove', updateMagnifier);
    
    // Inicializar a lupa quando o documento estiver pronto
    createMagnifierButton();
    
    // Adicionar a lupa ao menu de acessibilidade se ele existir
    const addToAccessibilityMenu = function() {
        const accessibilityMenu = document.querySelector('.aguia-accessibility-menu');
        if (accessibilityMenu) {
            const menuItem = document.createElement('li');
            menuItem.innerHTML = '<a href="#" id="aguia-menu-magnifier"><i class="fa fa-search-plus"></i> Lupa de Conteúdo</a>';
            
            menuItem.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('aguia-magnifier-button').click();
            });
            
            accessibilityMenu.appendChild(menuItem);
        }
    };
    
// Executar após um pequeno atraso para garantir que o menu já esteja disponível
setTimeout(addToAccessibilityMenu, 1000);
