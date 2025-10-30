/**
 * Implementação da lupa de conteúdo para o plugin AGUIA
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/*
 * @module     local_aguiaplugin/ampliador_conteudo
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
        magnifierContent: null,
        button: null,
        lastMouseClientX: 0,
        lastMouseClientY: 0,
        lastFullText: '',
        lastSourceElement: null,
        overlay: null,
        overlayPanel: null,
        overlayContent: null,
        expandFab: null
    },
    
    /**
     * Inicializa a lupa: cria elementos, registra eventos e aplica estado salvo.
     */
    // Inicialização da lupa
    init: function() {
        // Verificar estado inicial
        this.state.enabled = this.isEnabled();
        
        // Criar o elemento da lupa
        this.createMagnifierElement();
        
        // Criar o botão da lupa
        this.createMagnifierButton();

    // Criar elementos do leitor expandido (overlay)
    this.createReaderOverlay();
        
        // Adicionar evento de movimento do mouse
    this._pendingMouseEvent = null;
    this._pendingRaf = null;
    document.addEventListener('mousemove', this._onMouseMove.bind(this));

    // Habilitar rolagem com a roda do mouse dentro da caixa da lupa
    // Mesmo com pointer-events: none, capturamos no documento e redirecionamos para a lupa
    document.addEventListener('wheel', this.handleWheelScroll.bind(this), { passive: false });
        
        // Adicionar a lupa ao menu principal do AGUIA
        this.addToMainMenu();
        
        // Obter o escopo do AGUIA
        const aguiaScope = document.getElementById('aguia-scope-element') || 
                          window.AGUIA_SCOPE || 
                          document.querySelector('#page') || 
                          document.querySelector('#page-content') || 
                          document.querySelector('main') || 
                          document.body;
        
        // Aplicar o estado inicial se estiver ativado
        if (this.state.enabled) {
            aguiaScope.classList.add('aguia-magnifier-active');
            // Ativar os botões
            if (this.state.button) {
                this.state.button.classList.add('active');
            }
            const menuButton = document.getElementById('aguiaMagnifierBtn');
            if (menuButton) {
                menuButton.classList.add('active');
            }
        }
        
        // Expor a variável AGUIA_SCOPE globalmente para uso em outros scripts
        window.AGUIA_SCOPE = aguiaScope;
        
    console.log('Lupa de conteúdo AGUIA inicializada');
    },
    
    /**
     * Retorna se a lupa estava ativada (consultando localStorage ou estado do menu).
     * @returns {boolean}
     */
    // Verificar se a lupa estava ativada anteriormente
    isEnabled: function() {
        const savedState = localStorage.getItem(this.config.storageKey);
        // Se não houver estado salvo, verifica o botão do menu
        if (savedState === null) {
            const menuButton = document.getElementById('aguiaMagnifierBtn');
            return menuButton ? menuButton.classList.contains('active') : false;
        }
        return savedState === 'true';
    },
    
    /**
     * Indica se a lupa está atualmente ativa.
     * @returns {boolean}
     */
    // Método para verificar se a lupa está ativa
    isActive: function() {
        return this.state.enabled;
    },
    
    /**
     * Persiste o estado da lupa em localStorage e atualiza o estado interno.
     * @param {boolean} enabled
     */
    // Salvar o estado da lupa
    saveState: function(enabled) {
        localStorage.setItem(this.config.storageKey, enabled);
        this.state.enabled = enabled;
    },
    
    /**
     * Cria e insere no DOM o elemento que funciona como lupa de conteúdo e
     * seu painel interno rolável.
     * @returns {void}
     */
    // Criar o elemento da lupa que será mostrado ao usuário
    createMagnifierElement: function() {
        const magnifier = document.createElement('div');
        magnifier.id = 'aguia-content-magnifier';
        magnifier.classList.add('aguia-magnifier-hidden');
        // Conteúdo interno rolável
        const content = document.createElement('div');
        content.className = 'aguia-magnifier-content';
        magnifier.appendChild(content);
        
        // Obter o escopo do AGUIA
        const aguiaScope = document.getElementById('aguia-scope-element') || 
                          window.AGUIA_SCOPE || 
                          document.body;
        
        // Adicionar ao escopo do AGUIA ou ao body se não encontrar
        aguiaScope.appendChild(magnifier);
        
        this.state.magnifier = magnifier;
        this.state.magnifierContent = content;

        // Botão flutuante separado (fora da lupa) para Expandir
        const fab = document.createElement('button');
        fab.id = 'aguia-magnifier-expand-fab';
        fab.type = 'button';
        fab.setAttribute('aria-label', 'Expandir leitura em tela cheia');
        fab.textContent = 'Expandir';
        fab.addEventListener('click', (e) => {
            e.preventDefault();
            const txt = this.state.lastFullText || this.state.magnifierContent?.textContent || '';
            if (txt && txt.trim().length > 0) {
                this.openReaderOverlay(txt);
            }
        });
        fab.style.display = 'none';
        (document.body).appendChild(fab);
        this.state.expandFab = fab;
    },
    
    /**
     * Cria o botão que ativa/desativa a lupa e o insere no painel do plugin.
     * @returns {void}
     */
    // Criar o botão para ativar/desativar a lupa
    createMagnifierButton: function() {
        // Verificar se o botão já existe
        if (document.getElementById('aguia-magnifier-button')) {
            return;
        }
        
        // Criar o botão flutuante
        const button = document.createElement('button');
        
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
            aguiaPanel.style.display = 'none';
            
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
            const scope = document.getElementById('page') || document.querySelector('#page-content') || document.querySelector('main') || document.body;
            scope.classList.add('aguia-magnifier-active');
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
    
    /**
     * Alterna o modo da lupa (liga/desliga), atualiza classes visuais e guarda
     * @returns {void}
     */
    // Alternar o estado da lupa (ativar/desativar)
    toggleMagnifier: function() {
        const isActive = this.state.enabled;
        
        // Obter o escopo do AGUIA
        const aguiaScope = document.getElementById('aguia-scope-element') || 
                          window.AGUIA_SCOPE || 
                          document.querySelector('#page') || 
                          document.querySelector('#page-content') || 
                          document.querySelector('main') || 
                          document.body;
        
        if (isActive) {
            // Desativar a lupa
            this.state.button.classList.remove('active');
            aguiaScope.classList.remove('aguia-magnifier-active');
            this.saveState(false);
            if (this.state.expandFab) this.state.expandFab.style.display = 'none';
            
            // Atualiza também o botão no menu principal
            const menuButton = document.getElementById('aguiaMagnifierBtn');
            if (menuButton) {
                menuButton.classList.remove('active');
            }
            try { document.body.classList.remove('aguia-magnifier-active'); } catch (e) {}
        } else {
            // Ativar a lupa
            this.state.button.classList.add('active');
            aguiaScope.classList.add('aguia-magnifier-active');
            this.saveState(true);
            
            // Atualiza também o botão no menu principal
            const menuButton = document.getElementById('aguiaMagnifierBtn');
            if (menuButton) {
                menuButton.classList.add('active');
            }
            // Aplicar cursor de lupa no escopo completo (estilo adicional em CSS)
            try { document.body.classList.add('aguia-magnifier-active'); } catch (e) {}
        }
    },
    
    _onMouseMove: function(e) {
        this._pendingMouseEvent = e;
        if (this._pendingRaf) return;
        this._pendingRaf = window.requestAnimationFrame(() => {
            this._pendingRaf = null;
            if (this._pendingMouseEvent) {
                this.updateMagnifier(this._pendingMouseEvent);
                this._pendingMouseEvent = null;
            }
        });
    },

    /**
     * Atualiza a posição e o conteúdo da lupa com base no evento de mouse.
     * Mostra/oculta a lupa conforme o elemento alvo e popula o painel com
     * o texto extraído do elemento mais relevante próximo ao cursor.
     * @param {MouseEvent} e Evento de movimento do mouse
     * @returns {void}
     */
    // Atualizar a posição e conteúdo da lupa
    updateMagnifier: function(e) {
        // Obter o escopo do AGUIA
        const aguiaScope = document.getElementById('aguia-scope-element') || 
                          window.AGUIA_SCOPE || 
                          document.querySelector('#page') || 
                          document.querySelector('#page-content') || 
                          document.querySelector('main') || 
                          document.body;
                          
        if (!this.state.enabled || !aguiaScope.classList.contains('aguia-magnifier-active')) {
            return;
        }
        
    const magnifier = this.state.magnifier;
    // Registrar última posição do mouse para lógica de rolagem
    this.state.lastMouseClientX = e.clientX;
    this.state.lastMouseClientY = e.clientY;
        
    // Obter o elemento sob o cursor
    const element = document.elementFromPoint(e.clientX, e.clientY);
        
        // Verificar se o elemento é válido para exibir a lupa
        try {
        } catch (err) {}

        if (!element || 
            element.id === 'aguia-content-magnifier' || 
            element.id === 'aguia-standalone-magnifier' ||
            element.closest('#aguia-menu-panel') || 
            element.closest('#aguiaMenu') ||
            element === magnifier) {
            magnifier.classList.add('aguia-magnifier-hidden');
            if (this.state.expandFab) this.state.expandFab.style.display = 'none';
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
                text = textElement.textContent || '';
                // Guardar elemento fonte para possível uso no overlay
                this.state.lastSourceElement = textElement;
                
                // Se não tivermos texto significativo, verificar se temos texto alternativo
                if (!text && textElement.getAttribute('alt')) {
                    text = textElement.getAttribute('alt');
                }
                
                // Se não tivermos texto significativo, verificar se temos aria-label
                if (!text && textElement.getAttribute('aria-label')) {
                    text = textElement.getAttribute('aria-label');
                }
            } else {
                text = element.textContent || '';
                this.state.lastSourceElement = element;
            }
        }
        
        const elRect = element.getBoundingClientRect();
        const area = elRect.width * elRect.height;
        if (!text || area < 400) {
            magnifier.classList.add('aguia-magnifier-hidden');
            if (this.state.expandFab) this.state.expandFab.style.display = 'none';
            return;
        }
        
        // Limpar o texto removendo linhas vazias, formatações extras e estruturas
    text = this.cleanupText(text);
    // Guardar o texto completo (sem truncar) para o overlay e para rolagem
    this.state.lastFullText = text;
        
        // Definir o conteúdo da lupa
        if (this.state.magnifierContent) {
            this.state.magnifierContent.textContent = text;
        } else {
            magnifier.textContent = text;
        }
        
    // Posicionar a lupa abaixo do cursor (use page coords to follow scroll)
    const pageX = (e.pageX !== undefined) ? e.pageX : e.clientX + (window.pageXOffset || document.documentElement.scrollLeft);
    const pageY = (e.pageY !== undefined) ? e.pageY : e.clientY + (window.pageYOffset || document.documentElement.scrollTop);
    magnifier.style.left = `${pageX}px`;
    magnifier.style.top = `${pageY + 35}px`; // 35px abaixo do cursor
        
        // Mostrar a lupa
        magnifier.classList.remove('aguia-magnifier-hidden');

        // Posicionar e mostrar o botão Expandir próximo ao canto inferior direito da lupa
        if (this.state.expandFab) {
            const rect = magnifier.getBoundingClientRect();
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const fabX = rect.left + scrollX + rect.width - 80; // um pouco para dentro
            const fabY = rect.top + scrollY + rect.height - 40;
            this.state.expandFab.style.left = `${fabX}px`;
            this.state.expandFab.style.top = `${fabY}px`;
            this.state.expandFab.style.display = 'inline-block';
        }
    },

    // Permitir rolagem do conteúdo dentro da lupa com a roda do mouse
    handleWheelScroll: function(e) {
        // Se não está ativo, ignorar
        if (!this.state.enabled || !this.state.magnifier || this.state.magnifier.classList.contains('aguia-magnifier-hidden')) {
            return;
        }

        const magnifier = this.state.magnifier;
        const rect = magnifier.getBoundingClientRect();
        const x = this.state.lastMouseClientX;
        const y = this.state.lastMouseClientY;

        // Verificar se o cursor está sobre a lupa
        const overMagnifier = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        if (!overMagnifier) {
            return;
        }

        // Checar se há conteúdo para rolar na lupa
        const canScrollDown = magnifier.scrollTop + magnifier.clientHeight < magnifier.scrollHeight;
        const canScrollUp = magnifier.scrollTop > 0;

        const deltaY = e.deltaY;
        const scrollingDown = deltaY > 0;

        // Só previne a rolagem da página se a lupa puder rolar nessa direção
        if ((scrollingDown && canScrollDown) || (!scrollingDown && canScrollUp)) {
            e.preventDefault();
            magnifier.scrollTop += deltaY;
        }
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
        
        // Não truncar: precisamos do texto completo para leitura
        
        // Remover linhas azuis causadas por bordas e contornos
        cleaned = cleaned.replace(/border(-[a-z]+)?:[^;]+;/g, '');
        cleaned = cleaned.replace(/outline(-[a-z]+)?:[^;]+;/g, '');
        
        // Remover múltiplos espaços
        cleaned = cleaned.replace(/\s\s+/g, ' ');
        
        // Não truncar
        
        return cleaned;
    },

    // Criar elementos do overlay de leitura expandida
    createReaderOverlay: function() {
        if (this.state.overlay) return;
        const overlay = document.createElement('div');
        overlay.id = 'aguia-magnifier-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.style.display = 'none';

        const panel = document.createElement('div');
        panel.className = 'aguia-reader-panel';

        const header = document.createElement('div');
        header.className = 'aguia-reader-header';
        const title = document.createElement('div');
        title.className = 'aguia-reader-title';
        title.textContent = 'Leitura ampliada';
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'aguia-reader-close';
        closeBtn.setAttribute('aria-label', 'Fechar leitura');
        closeBtn.textContent = 'Fechar';
        closeBtn.addEventListener('click', () => this.closeReaderOverlay());

        header.appendChild(title);
        header.appendChild(closeBtn);

        const content = document.createElement('div');
        content.className = 'aguia-reader-content';

        panel.appendChild(header);
        panel.appendChild(content);
        overlay.appendChild(panel);

        // Interações de fechamento
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeReaderOverlay();
            }
        });

        document.body.appendChild(overlay);
        this.state.overlay = overlay;
        this.state.overlayPanel = panel;
        this.state.overlayContent = content;

        // Fechar com ESC e trap de foco no overlay
        if (!overlay._aguiaKeyHandler) {
            overlay._aguiaKeyHandler = (e) => {
                // Fecha com ESC
                if (e.key === 'Escape' || e.key === 'Esc') {
                    if (this.isReaderOpen()) {
                        e.preventDefault();
                        this.closeReaderOverlay();
                    }
                    return;
                }

                if (e.key === 'Tab') {
                    // manter o foco dentro do overlay
                    const focusable = overlay.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (!focusable || focusable.length === 0) return;
                    const first = focusable[0];
                    const last = focusable[focusable.length - 1];
                    if (!e.shiftKey && document.activeElement === last) {
                        e.preventDefault();
                        first.focus();
                    } else if (e.shiftKey && document.activeElement === first) {
                        e.preventDefault();
                        last.focus();
                    }
                }
            };
        }
    },

    isReaderOpen: function() {
        return !!(this.state.overlay && this.state.overlay.style.display !== 'none');
    },

    openReaderOverlay: function(text) {
        this.createReaderOverlay();
        if (!this.state.overlay || !this.state.overlayContent) return;
        this.state.overlayContent.textContent = text || this.state.lastFullText || '';
        this.state.overlay.style.display = 'block';
        this.state.overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('aguia-reader-open');
        // Foco no painel para navegação por teclado. Guardar foco anterior e instalar trap
        try {
            this.state.overlay._aguiaPreviousFocus = document.activeElement;
        } catch (e) {
            this.state.overlay._aguiaPreviousFocus = null;
        }

        this.state.overlay.setAttribute('aria-modal', 'true');

        this.state.overlayPanel.setAttribute('tabindex', '-1');
        this.state.overlayPanel.focus({ preventScroll: true });

        // Instalar handler de teclado no document (capturing) para garantir ESC e trap de foco
        if (this.state.overlay._aguiaKeyHandler) {
            this.state.overlay._docKeyHandler = (e) => this.state.overlay._aguiaKeyHandler(e);
            document.addEventListener('keydown', this.state.overlay._docKeyHandler, true);
        }
        if (this.state.expandFab) this.state.expandFab.style.display = 'none';
    },

    closeReaderOverlay: function() {
        if (!this.state.overlay) return;
        this.state.overlay.style.display = 'none';
        this.state.overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('aguia-reader-open');

        // Remover aria-modal e handler de teclado e restaurar foco
        try {
            this.state.overlay.removeAttribute('aria-modal');
        } catch (e) {}
        if (this.state.overlay._aguiaKeyHandler) {
            try {
                if (this.state.overlay._docKeyHandler) {
                    document.removeEventListener('keydown', this.state.overlay._docKeyHandler, true);
                    this.state.overlay._docKeyHandler = null;
                }
            } catch (e) {}
        }
        try {
            if (this.state.overlay._aguiaPreviousFocus && typeof this.state.overlay._aguiaPreviousFocus.focus === 'function') {
                this.state.overlay._aguiaPreviousFocus.focus();
            }
        } catch (e) {}
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
            // Procurar a categoria de Orientação e Navegação
            const navigationCategory = document.querySelector('.aguia-category:has(h3.aguia-category-title:contains("Orientação"))');
            
            if (navigationCategory) {
                const navigationGrid = navigationCategory.querySelector('.aguia-options-grid');
                if (navigationGrid) {
                    // Criar o botão de lupa no formato correto
                    const lupaOption = {
                        iconSvg: AguiaIcons.magnifier,
                        text: 'Lupa de Conteúdo',
                        action: this.toggleMagnifier.bind(this),
                        ariaLabel: 'Ativar ou desativar lupa de conteúdo',
                        id: 'aguiaMagnifierBtn'
                    };
                    
                    // Criar o botão usando a função existente
                    const button = this.createOptionButton(lupaOption);
                    
                    // Aplicar a classe active se a lupa estiver ativa
                    if (this.state.enabled) {
                        button.classList.add('active');
                    }
                    
                    navigationGrid.appendChild(button);
                    
                    console.log('AGUIA: Botão de lupa adicionado ao menu');
                } else {
                    console.log('AGUIA: Grid de navegação não encontrado');
                }
            } else {
                console.log('AGUIA: Categoria de navegação não encontrada');
                
                // Tenta adicionar à primeira categoria disponível como fallback
                const anyCategory = document.querySelector('.aguia-category');
                if (anyCategory) {
                    const grid = anyCategory.querySelector('.aguia-options-grid');
                    if (grid) {
                        const lupaButton = document.createElement('button');
                        lupaButton.className = 'aguia-option';
                        lupaButton.id = 'aguiaMagnifierBtn';
                        lupaButton.innerHTML = `<span class="icon">${AguiaIcons.magnifier}</span><span class="text">Lupa de Conteúdo</span>`;
                        lupaButton.addEventListener('click', this.toggleMagnifier.bind(this));
                        
                        // Aplicar a classe active se a lupa estiver ativa
                        if (this.state.enabled) {
                            lupaButton.classList.add('active');
                        }
                        
                        grid.appendChild(lupaButton);
                        console.log('AGUIA: Botão de lupa adicionado como fallback');
                    }
                }
            }
        }, 1000);
    },
    
    // Função para criar botões de opção com estilo consistente
    createOptionButton: function(option) {
        const button = document.createElement('button');
        button.className = 'aguia-option';
        button.id = option.id;
        button.setAttribute('role', 'button');
        button.setAttribute('aria-label', option.ariaLabel);
        button.setAttribute('tabindex', '0');
        
        // Ícone (SVG se disponível, emoji como fallback)
        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon';
        
        if (option.iconSvg) {
            // Usar ícone SVG da biblioteca
            iconSpan.innerHTML = option.iconSvg;
        } else if (option.icon) {
            // Fallback para ícone de emoji
            iconSpan.textContent = option.icon;
        }
        
        iconSpan.setAttribute('aria-hidden', 'true');
        button.appendChild(iconSpan);
        
        // Texto
        const textSpan = document.createElement('span');
        textSpan.className = 'text';
        textSpan.textContent = option.text;
        button.appendChild(textSpan);
        
        // Eventos
        button.addEventListener('click', option.action);
        button.addEventListener('keydown', function(e) {
            // Permitir navegação por teclado (WCAG 2.1.1)
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                option.action();
            }
        });
        
        return button;
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