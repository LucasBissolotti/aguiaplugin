// Plugin AGUIA para acessibilidade - Implementação WCAG 2.1 Nível AA

/**
 * Plugin AGUIA de Acessibilidade seguindo as diretrizes WCAG 2.1 nível AA
 *
 * Este script implementa um menu de acessibilidade com recursos como:
 * - Aumento/diminuição de texto (WCAG 1.4.4)
 * - Alto contraste (WCAG 1.4.3, 1.4.6)
 * - Fontes legíveis (WCAG 1.4.8)
 * - Espaçamento adequado (WCAG 1.4.8)
 * - Texto para fala (WCAG 1.4.1)
 * - Auxiliar de leitura (WCAG 2.4.8)
 * 
 * @module     local_aguiaplugin/acessibilidade_wcag
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

document.addEventListener('DOMContentLoaded', function() {
    // Os estilos CSS agora são carregados pelo PHP
    // Desliga a sincronização automática com o servidor; salvamento manual via botão
    if (window.AguiaAPI) {
        window.AguiaAPI.autoSync = false;
    }
    
    // Inicialização das variáveis
    let currentFontSize = 100;
    let highContrastEnabled = false;
    let colorIntensityMode = 0; // 0: normal, 1: baixa intensidade, 2: alta intensidade, 3: escala de cinza
    let readableFontsEnabled = false;
    let fontMode = 0; // 0: padrão, 1: fontes legíveis, 2: OpenDyslexic
    let lineSpacingLevel = 0; // 0: desativado, 1: pequeno, 2: médio, 3: grande
    let letterSpacingLevel = 0; // 0: desativado, 1: pequeno, 2: médio, 3: grande
    let textToSpeechEnabled = false;
    let readingHelperEnabled = false;
    let emphasizeLinksEnabled = false;
    let headerHighlightEnabled = false; // Nova variável para controlar o destaque de cabeçalhos
    let hideImagesEnabled = false; // Nova variável para controlar a ocultação de imagens
    let colorBlindMode = 'none'; // Valores possíveis: none, protanopia, deuteranopia, tritanopia, achromatopsia
    let readingMaskMode = 0; // 0: desativado, 1: horizontal, 2: vertical (manter por compatibilidade)
    let horizontalMaskLevel = 0; // 0: desativado, 1: pequeno, 2: médio, 3: grande
    let verticalMaskLevel = 0; // 0: desativado, 1: pequeno, 2: médio, 3: grande
    let customCursorEnabled = false; // Nova variável para controlar o cursor personalizado
    let highlightedLettersLevel = 0; // 0: desativado, 1: pequeno, 2: médio, 3: grande
    
    // Define um contêiner de escopo para aplicar os estilos de acessibilidade apenas no conteúdo da página
    function getAguiaScopeElement() {
        // Tente encontrar elementos típicos de header, conteúdo principal e footer
        const content = document.getElementById('page')
            || document.querySelector('#page-content')
            || document.querySelector('main')
            || document.querySelector('#region-main')
            || document.body;

        const header = document.querySelector('header, #page-header, .page-header, .header, #moodleheader');
        const footer = document.querySelector('footer, #page-footer, .page-footer, .footer, #moodlefooter');

        // Subimos a partir do conteúdo procurando um ancestral que contenha header e footer
        let node = content;
        while (node && node !== document.body) {
            const hasHeader = header ? node.contains(header) : false;
            const hasFooter = footer ? node.contains(footer) : false;
            if (hasHeader && hasFooter) {
                return node;
            }
            node = node.parentElement;
        }

        // Se o ancestral comum for apenas o <body>, evitamos usá-lo para não afetar a UI do plugin
        // e mantemos o container de conteúdo como escopo padrão
        return content;
    }
    const AGUIA_SCOPE = getAguiaScopeElement();
    // Tornamos o AGUIA_SCOPE acessível globalmente para que outros scripts possam usá-lo
    window.AGUIA_SCOPE = AGUIA_SCOPE;
    
    // Adicionar um ID ao elemento de escopo para facilitar sua localização
    AGUIA_SCOPE.id = AGUIA_SCOPE.id || 'aguia-scope-element';
    
    // Cria o botão de acessibilidade com a imagem AGUIA
    createAccessibilityButton();
    
    // Cria o menu de acessibilidade
    createAccessibilityMenu();
    
    // Cria a mensagem de status
    createStatusMessage();
    
    // Recupera preferências salvas do usuário
    loadUserPreferences();
    
    // Função para criar o botão de acessibilidade
    function createAccessibilityButton() {
        const button = document.createElement('button');
        button.id = 'aguiaButton';
        button.className = 'aguia-button pulse';
        button.setAttribute('aria-label', 'Menu de Acessibilidade AGUIA');
        button.setAttribute('title', 'Abrir menu de acessibilidade');
        button.setAttribute('aria-haspopup', 'true');
        button.setAttribute('aria-expanded', 'false');
        
        // Aplicar estilo diretamente ao botão para garantir a aparência correta
        button.style.backgroundColor = '#2271ff';
        button.style.borderRadius = '10px';
        button.style.border = '2px solid #2271ff';
        button.style.width = '46px';
        button.style.height = '46px';
        button.style.padding = '0';
        button.style.overflow = 'visible';
        
        // Criar a imagem do logo
        const img = document.createElement('img');
        img.src = M.cfg.wwwroot + '/local/aguiaplugin/pix/AguiaLogo.png';
        img.alt = 'Logo AGUIA - Acessibilidade';
        img.className = 'aguia-logo';
        // Aplicar estilo diretamente à imagem para garantir que não tenha margem branca
        img.style.width = '36px';
        img.style.height = '36px';
        img.style.borderRadius = '8px';
        img.style.objectFit = 'cover';
        img.style.padding = '0';
        img.style.margin = '0';
        img.style.border = 'none';
        button.appendChild(img);
        
        // Criar a faixa de hover com o texto AGUIA
        const createHoverBanner = () => {
            // Verificar se o banner já existe
            if (document.getElementById('aguiaBanner')) return;
            
            const banner = document.createElement('div');
            banner.id = 'aguiaBanner';
            banner.textContent = 'AGUIA';
            banner.style.position = 'absolute';
            banner.style.left = '-100px';
            banner.style.top = '0';
            banner.style.height = '40px'; /* Mesmo tamanho do botão */
            banner.style.backgroundColor = '#2271ff';
            banner.style.color = 'white';
            banner.style.padding = '0 30px'; /* Aumentado horizontalmente */
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.justifyContent = 'flex-end';
            banner.style.borderRadius = '10px';
            banner.style.fontWeight = 'bold';
            banner.style.fontSize = '14px';
            banner.style.boxShadow = '0 3px 10px rgba(0, 86, 179, 0.5)';
            banner.style.border = '1px solid #2271ff';
            banner.style.whiteSpace = 'nowrap';
            banner.style.zIndex = '9998';
            banner.style.opacity = '0';
            banner.style.transform = 'translateX(20px)';
            banner.style.transition = 'all 0.3s ease';
            banner.style.pointerEvents = 'none';
            
            document.body.appendChild(banner);
            return banner;
        };
        
        // Adicionar eventos de hover
        button.addEventListener('mouseenter', () => {
            const banner = createHoverBanner();
            if (banner) {
                setTimeout(() => {
                    banner.style.opacity = '1';
                    banner.style.left = '-115px';
                    banner.style.transform = 'translateX(0)';
                }, 10);
            }
        });
        
        button.addEventListener('mouseleave', () => {
            const banner = document.getElementById('aguiaBanner');
            if (banner) {
                banner.style.opacity = '0';
                banner.style.left = '-100px';
                banner.style.transform = 'translateX(20px)';
            }
        });
        
        // Adicionar evento de clique
        button.addEventListener('click', toggleMenu);
        button.addEventListener('keydown', function(e) {
            // Permitir navegação por teclado (WCAG 2.1.1)
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
        
        document.body.appendChild(button);
        
        // Remove a animação de pulsar após 5 segundos
        setTimeout(function() {
            button.classList.remove('pulse');
        }, 5000);
    }
    
    // Função para alternar o menu
    function toggleMenu() {
        const menu = document.getElementById('aguiaMenu');
        const button = document.getElementById('aguiaButton');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            menu.style.display = 'none';
            button.setAttribute('aria-expanded', 'false');
            // Remove aria-modal and keyboard trap when fechando
            try {
                menu.removeAttribute('aria-modal');
            } catch (e) {}
            if (menu._aguiaKeyHandler) {
                menu.removeEventListener('keydown', menu._aguiaKeyHandler);
                menu._aguiaKeyHandler = null;
            }
            // Restaurar foco para o elemento que abriu o menu
            try {
                if (menu._aguiaPreviousFocus && typeof menu._aguiaPreviousFocus.focus === 'function') {
                    menu._aguiaPreviousFocus.focus();
                }
            } catch (e) {}
        } else {
            menu.style.display = 'block';
            button.setAttribute('aria-expanded', 'true');
            // Marcar modal para tecnologias assistivas
            menu.setAttribute('aria-modal', 'true');
            // Guardar o elemento previamente focado para restaurar depois
            try {
                menu._aguiaPreviousFocus = document.activeElement;
            } catch (e) {
                menu._aguiaPreviousFocus = null;
            }
            // Foco no primeiro elemento do menu (WCAG 2.4.3)
            const firstFocusable = menu.querySelector('button, [tabindex="0"]');
            if (firstFocusable) {
                firstFocusable.focus();
            }

            // Instala um trap simples de foco + handler Esc para fechar o diálogo
            if (!menu._aguiaKeyHandler) {
                menu._aguiaKeyHandler = function(e) {
                    // Fecha com ESC
                    if (e.key === 'Escape' || e.key === 'Esc') {
                        e.preventDefault();
                        toggleMenu();
                        return;
                    }

                    if (e.key === 'Tab') {
                        // manter o foco dentro do menu
                        const focusable = menu.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
                menu.addEventListener('keydown', menu._aguiaKeyHandler);
            }
        }
    }
    
    // Função para criar o menu de acessibilidade
    function createAccessibilityMenu() {
        const menu = document.createElement('div');
        menu.id = 'aguiaMenu';
        menu.className = 'aguia-menu';
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-labelledby', 'aguiaMenuTitle');
        
        // Cabeçalho do menu
        const header = document.createElement('div');
        header.className = 'aguia-menu-header';
        
        // Título do menu
        const title = document.createElement('h2');
        title.id = 'aguiaMenuTitle';
        title.textContent = 'Menu de Acessibilidade';
        
        // Botão de fechar
        const closeBtn = document.createElement('button');
        closeBtn.className = 'aguia-menu-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Fechar menu de acessibilidade');
        closeBtn.addEventListener('click', toggleMenu);
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        menu.appendChild(header);
        
        // Container para o conteúdo do menu com rolagem
        const menuContent = document.createElement('div');
        menuContent.className = 'aguia-menu-content';
        
        // Organizamos as opções em categorias
        
        // Categoria: Fonte (anteriormente Conteúdo)
        const contentCategory = document.createElement('div');
        contentCategory.className = 'aguia-category';
        
        const contentTitle = document.createElement('h3');
        contentTitle.className = 'aguia-category-title';
        contentTitle.textContent = 'Fonte';
        contentCategory.appendChild(contentTitle);
        
        // Grid para as opções da categoria Fonte
        const contentGrid = document.createElement('div');
        contentGrid.className = 'aguia-options-grid';
        
        // Opções de fonte
        const contentOptions = [
            {
                iconSvg: AguiaIcons.increaseText,
                text: 'Aumentar Texto', 
                action: increaseFontSize,
                ariaLabel: 'Aumentar tamanho do texto',
                id: 'aguiaIncreaseFontBtn'
            },
            { 
                iconSvg: AguiaIcons.fontSingleA,
                text: 'Fontes Legíveis', 
                action: toggleReadableFonts,
                ariaLabel: 'Ativar ou desativar fontes mais legíveis',
                id: 'aguiaReadableFontsBtn'
            },
            { 
                iconSvg: AguiaIcons.lineSpacing,
                text: 'Espaçamento entre Linhas', 
                action: toggleLineSpacing,
                ariaLabel: 'Ajustar espaçamento entre linhas do texto',
                id: 'aguiaLineSpacingBtn'
            },
            { 
                iconSvg: AguiaIcons.letterSpacing,
                text: 'Espaçamento entre Letras', 
                action: toggleLetterSpacing,
                ariaLabel: 'Ajustar espaçamento entre letras do texto',
                id: 'aguiaLetterSpacingBtn'
            },
            { 
                iconSvg: AguiaIcons.highlightedLetters,
                text: 'Letras Destacadas', 
                action: toggleHighlightedLetters,
                ariaLabel: 'Ativar ou desativar destaque para letras',
                id: 'aguiaHighlightedLettersBtn'
            }
        ];
        
        // Adiciona as opções de fonte ao grid
        contentOptions.forEach(option => {
            const button = createOptionButton(option);
            contentGrid.appendChild(button);
        });
        
        contentCategory.appendChild(contentGrid);
        
        // Adiciona controle deslizante para tamanho de fonte
        const fontSizeControl = document.createElement('div');
        fontSizeControl.className = 'aguia-slider-control';
        
        const fontSizeLabel = document.createElement('label');
        fontSizeLabel.className = 'aguia-slider-label';
        fontSizeLabel.textContent = 'Tamanho do Texto';
        fontSizeLabel.setAttribute('for', 'aguiaFontSizeSlider');
        fontSizeLabel.setAttribute('data-value', currentFontSize + '%');
        fontSizeLabel.id = 'aguiaFontSizeLabel';
        
        const fontSizeSlider = document.createElement('input');
        fontSizeSlider.type = 'range';
        fontSizeSlider.id = 'aguiaFontSizeSlider';
        fontSizeSlider.className = 'aguia-slider';
        fontSizeSlider.min = '100';
        fontSizeSlider.max = '150';
        fontSizeSlider.step = '10';
        fontSizeSlider.value = currentFontSize;
        
        fontSizeSlider.addEventListener('input', function() {
            const newSize = parseInt(this.value);
            setFontSize(newSize);
            fontSizeLabel.setAttribute('data-value', newSize + '%');
        });
        
        fontSizeControl.appendChild(fontSizeLabel);
        fontSizeControl.appendChild(fontSizeSlider);
        contentCategory.appendChild(fontSizeControl);
        
        // Categoria: Cores
        const colorsCategory = document.createElement('div');
        colorsCategory.className = 'aguia-category';
        
        const colorsTitle = document.createElement('h3');
        colorsTitle.className = 'aguia-category-title';
        colorsTitle.textContent = 'Cores e Contraste';
        colorsCategory.appendChild(colorsTitle);
        
        // Grid para as opções da categoria Cores
        const colorsGrid = document.createElement('div');
        colorsGrid.className = 'aguia-options-grid';
        
        // Opções de cores
        const colorsOptions = [
            { 
                iconSvg: AguiaIcons.contrast, 
                text: 'Alto Contraste', 
                action: toggleHighContrast,
                ariaLabel: 'Ativar ou desativar o modo de alto contraste melhorado',
                id: 'aguiaHighContrastBtn'
            },
            { 
                iconSvg: AguiaIcons.colorIntensity, 
                text: 'Intensidade de Cores', 
                action: toggleColorIntensity,
                ariaLabel: 'Alternar entre os níveis de intensidade de cores',
                id: 'aguiaColorIntensityBtn'
            }
        ];
        
        // Adiciona as opções de cores ao grid
        colorsOptions.forEach(option => {
            const button = createOptionButton(option);
            colorsGrid.appendChild(button);
        });
        
        colorsCategory.appendChild(colorsGrid);
        
        // Título para a subcategoria de daltonismo
        const colorblindTitle = document.createElement('h3');
        colorblindTitle.className = 'aguia-category-title';
        colorblindTitle.textContent = 'Modos de Daltonismo';
        colorsCategory.appendChild(colorblindTitle);
        
        // Botão para abrir o painel de daltonismo
        const colorblindButton = document.createElement('button');
        colorblindButton.className = 'aguia-option';
        colorblindButton.id = 'aguiaColorblindButton';
        colorblindButton.setAttribute('aria-label', 'Opções de daltonismo');
        colorblindButton.innerHTML = `<span class="icon">${AguiaIcons.colorblind}</span><span class="text">Daltonismo</span>`;
        colorblindButton.addEventListener('click', function() {
            toggleColorblindPanel();
        });
        
        // Adiciona o botão à categoria de cores
        colorsCategory.appendChild(colorblindButton);
        
        // Cria o painel de opções de daltonismo
        const colorblindPanel = document.createElement('div');
        colorblindPanel.className = 'aguia-submenu';
        colorblindPanel.id = 'aguiaColorblindPanel';
        colorblindPanel.style.display = 'none';
        
        // Cabeçalho do painel
        const colorblindPanelHeader = document.createElement('div');
        colorblindPanelHeader.className = 'aguia-submenu-header';
        
        // Botão para voltar ao menu principal
        const colorblindBackButton = document.createElement('button');
        colorblindBackButton.className = 'aguia-back-button';
        colorblindBackButton.innerHTML = '&larr; Voltar';
        colorblindBackButton.setAttribute('aria-label', 'Voltar ao menu principal');
        colorblindBackButton.addEventListener('click', function() {
            toggleColorblindPanel();
        });
        
        colorblindPanelHeader.appendChild(colorblindBackButton);
        
        // Título do painel
        const colorblindPanelTitle = document.createElement('h3');
        colorblindPanelTitle.textContent = 'Opções de Daltonismo';
        colorblindPanelHeader.appendChild(colorblindPanelTitle);
        
        colorblindPanel.appendChild(colorblindPanelHeader);
        
        // Opções para o painel de daltonismo
        const colorblindOptions = [
            // Para 'Nenhum', não renderizamos ícone para evitar duplicação visual
            { value: 'none', text: 'Nenhum' },
            { value: 'protanopia', text: 'Protanopia (sem vermelho)', iconSvg: AguiaIcons.protanopia },
            { value: 'deuteranopia', text: 'Deuteranopia (sem verde)', iconSvg: AguiaIcons.deuteranopia },
            { value: 'tritanopia', text: 'Tritanopia (sem azul)', iconSvg: AguiaIcons.tritanopia },
            // Removido: achromatopsia (Monocromacia)
        ];
        
        // Adiciona as opções como botões
        const colorblindOptionsContainer = document.createElement('div');
        colorblindOptionsContainer.className = 'aguia-submenu-content';
        
        colorblindOptions.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.className = 'aguia-submenu-option';
            optionButton.dataset.value = option.value;
            optionButton.setAttribute('aria-label', option.text);

            const iconSpan = document.createElement('span');
            iconSpan.className = 'aguia-icon';
            if (option.iconSvg) {
                iconSpan.innerHTML = option.iconSvg;
            } else if (option.icon) {
                iconSpan.textContent = option.icon;
            }
            iconSpan.setAttribute('aria-hidden', 'true');
            optionButton.appendChild(iconSpan);

            const textSpan = document.createElement('span');
            textSpan.className = 'aguia-text';
            textSpan.textContent = option.text;
            optionButton.appendChild(textSpan);
            
            // Marca o botão como ativo se for o modo atual
            if (option.value === colorBlindMode) {
                optionButton.classList.add('active');
            }
            
            optionButton.addEventListener('click', function() {
                // Remove a classe ativa de todos os botões
                document.querySelectorAll('.aguia-submenu-option').forEach(btn => {
                    btn.classList.remove('active');
                });
                
                // Adiciona a classe ativa ao botão clicado
                this.classList.add('active');
                
                // Aplica o modo de daltonismo
                setColorBlindMode(this.dataset.value);
                
                // Manter o painel aberto após a seleção (não fechar automaticamente)
                // Garantir que o foco permaneça no botão selecionado
                try { this.focus(); } catch (e) {}
            });
            
            colorblindOptionsContainer.appendChild(optionButton);
        });
        
        colorblindPanel.appendChild(colorblindOptionsContainer);
        
        // Adiciona o painel ao documento
        document.body.appendChild(colorblindPanel);
        
        // Categoria: Orientação
        const navigationCategory = document.createElement('div');
        navigationCategory.className = 'aguia-category';
        
        const navigationTitle = document.createElement('h3');
        navigationTitle.className = 'aguia-category-title';
        navigationTitle.textContent = 'Orientação e Navegação';
        navigationCategory.appendChild(navigationTitle);
        
        // Grid para as opções da categoria Navegação
        const navigationGrid = document.createElement('div');
        navigationGrid.className = 'aguia-options-grid';
        
        // Opções de navegação
        const navigationOptions = [
            { 
                iconSvg: AguiaIcons.textToSpeech, 
                text: 'Texto para Fala', 
                action: toggleTextToSpeech,
                ariaLabel: 'Ativar ou desativar leitura de texto ao clicar',
                id: 'aguiaTextToSpeechBtn'
            },
            { 
                iconSvg: AguiaIcons.readingGuide, 
                text: 'Guia de Leitura', 
                action: toggleReadingHelper,
                ariaLabel: 'Ativar ou desativar guia visual de leitura',
                id: 'aguiaReadingHelperBtn'
            },
            { 
                iconSvg: AguiaIcons.hideImages, 
                text: 'Ocultar Imagens', 
                action: toggleHideImages,
                ariaLabel: 'Ativar ou desativar ocultação de imagens',
                id: 'aguiaHideImagesBtn'
            },
            {
                iconSvg: AguiaIcons.customCursor,
                text: 'Cursor Grande',
                action: toggleCustomCursor,
                ariaLabel: 'Ativar ou desativar cursor personalizado',
                id: 'aguiaCustomCursorBtn'
            },
            {
                iconSvg: AguiaIcons.focusMaskHorizontal,
                text: 'Máscara de Foco Horizontal',
                action: toggleHorizontalMask,
                ariaLabel: 'Ativar ou desativar máscara de foco horizontal',
                id: 'aguiaHorizontalMaskBtn'
            },
            {
                iconSvg: AguiaIcons.focusMaskVertical,
                text: 'Máscara de Foco Vertical',
                action: toggleVerticalMask,
                ariaLabel: 'Ativar ou desativar máscara de foco vertical',
                id: 'aguiaVerticalMaskBtn'
            },
            { 
                iconSvg: AguiaIcons.emphasizeLinks,
                text: 'Destacar Links', 
                action: toggleEmphasizeLinks,
                ariaLabel: 'Ativar ou desativar destaque para links',
                id: 'aguiaEmphasizeLinksBtn'
            },
            {
                iconSvg: AguiaIcons.headerHighlight,
                text: 'Destacar Cabeçalho',
                action: toggleHeaderHighlight,
                ariaLabel: 'Ativar ou desativar destaque para cabeçalhos',
                id: 'aguiaHeaderHighlightBtn'
            },
            {
                iconSvg: AguiaIcons.magnifier,
                text: 'Lupa de Conteúdo',
                action: function() {
                    // Referência para o botão atual
                    const button = document.getElementById('aguiaMagnifierBtn');
                    const menu = document.getElementById('aguiaMenu');
                    
                    // Garantir que AGUIA_SCOPE esteja definido
                    const aguiaScope = window.AGUIA_SCOPE || document.getElementById('aguia-scope-element');
                    
                    // Verificar se a função está disponível no namespace AguiaMagnifier
                    if (window.AguiaMagnifier && typeof window.AguiaMagnifier.toggleMagnifier === 'function') {
                        const wasActive = window.AguiaMagnifier.state && window.AguiaMagnifier.state.enabled;
                        window.AguiaMagnifier.toggleMagnifier();
                        
                        if (!wasActive) {
                            // Esconde o menu quando ativa a lupa
                            if (menu) menu.style.display = 'none';
                            if (button) button.classList.add('active');
                            showStatusMessage('Lupa de conteúdo ativada', 'success');
                        } else {
                            // Mostra o menu quando desativa a lupa
                            if (menu) menu.style.display = 'block';
                            if (button) button.classList.remove('active');
                            showStatusMessage('Lupa de conteúdo desativada', 'success');
                        }
                    } else {
                        // Fallback simples se a função específica não estiver disponível
                        if (aguiaScope && aguiaScope.classList.contains('aguia-magnifier-active')) {
                            aguiaScope.classList.remove('aguia-magnifier-active');
                            if (button) button.classList.remove('active');
                            if (menu) menu.style.display = 'block';
                            showStatusMessage('Lupa de conteúdo desativada', 'success');
                            saveUserPreference('magnifier', false);
                        } else if (aguiaScope) {
                            aguiaScope.classList.add('aguia-magnifier-active');
                            if (button) button.classList.add('active');
                            if (menu) menu.style.display = 'none';
                            showStatusMessage('Lupa de conteúdo ativada', 'success');
                            saveUserPreference('magnifier', true);
                        }
                    }
                },
                ariaLabel: 'Ativar ou desativar lupa de conteúdo',
                id: 'aguiaMagnifierBtn'
            }
        ];
        
        // Adiciona as opções de navegação ao grid
        navigationOptions.forEach(option => {
            const button = createOptionButton(option);
            navigationGrid.appendChild(button);
        });
        
        navigationCategory.appendChild(navigationGrid);
        
        // Adiciona todas as categorias ao conteúdo do menu
        menuContent.appendChild(contentCategory);
        menuContent.appendChild(colorsCategory);
        menuContent.appendChild(navigationCategory);
        menu.appendChild(menuContent);
        
        // Adiciona o rodapé do menu
        const footer = document.createElement('div');
        footer.className = 'aguia-menu-footer';
        
        // Botão de salvar preferências (novo)
        const saveButton = document.createElement('button');
        saveButton.className = 'aguia-save-button';
        saveButton.textContent = 'Salvar preferências';
        saveButton.setAttribute('aria-label', 'Salvar configurações de acessibilidade');
        saveButton.addEventListener('click', function() {
            try {
                // Coleta o estado atual das preferências a partir do localStorage
                if (window.AguiaAPI && typeof window.AguiaAPI.commitLocalToServer === 'function') {
                    // Garante que façamos uma tentativa de sincronizar todas as prefs com o servidor
                    saveButton.disabled = true;
                    saveButton.textContent = 'Salvando...';
                    window.AguiaAPI.commitLocalToServer()
                        .then(result => {
                            if (result && result.allOk) {
                                showStatusMessage('Preferências salvas', 'success');
                            } else {
                                showStatusMessage('Algumas preferências podem não ter sido salvas', 'warning');
                            }
                        })
                        .catch(() => {
                            showStatusMessage('Erro ao salvar preferências', 'error');
                        })
                        .finally(() => {
                            saveButton.disabled = false;
                            saveButton.textContent = 'Salvar preferências';
                        });
                } else {
                    showStatusMessage('API de preferências indisponível', 'error');
                }
            } catch (e) {
                showStatusMessage('Erro ao salvar preferências', 'error');
            }
        });

        // Botão de reset
        const resetButton = document.createElement('button');
        resetButton.className = 'aguia-reset-button';
        resetButton.textContent = 'Redefinir configurações de acessibilidade';
        resetButton.setAttribute('aria-label', 'Redefinir todas as configurações de acessibilidade');
        resetButton.addEventListener('click', resetAll);
        
        // Créditos
        const credits = document.createElement('div');
        credits.className = 'aguia-credits';
        credits.textContent = '';
        
    footer.appendChild(resetButton);
    footer.appendChild(saveButton);
        footer.appendChild(credits);
        menu.appendChild(footer);
        
        // Adiciona o menu completo ao corpo do documento
        document.body.appendChild(menu);
    }
    
    // Função para criar botões de opção com estilo consistente
    function createOptionButton(option) {
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
    
    // Função para criar a mensagem de status
    function createStatusMessage() {
        const message = document.createElement('div');
        message.id = 'aguiaStatusMessage';
        message.className = 'aguia-status-message';
        message.setAttribute('role', 'status');
        message.setAttribute('aria-live', 'polite');
        document.body.appendChild(message);
    }
    
    // Função para exibir mensagem de status
    function showStatusMessage(text, type = '') {
        const message = document.getElementById('aguiaStatusMessage');
        if (!message) return;

        // Define texto e classes
        message.textContent = text;
        message.className = 'aguia-status-message ' + type;

        // Limpa posicionamento inline anterior
        message.style.left = '';
        message.style.top = '';
        message.style.right = '';
        message.style.bottom = '';
        message.style.visibility = 'hidden';
        message.style.display = 'block';

        // Calcula posicionamento com base no menu, se presente e visível
        const menu = document.getElementById('aguiaMenu');
        const msgRect = message.getBoundingClientRect();

        if (menu && menu.style.display !== 'none') {
            const mRect = menu.getBoundingClientRect();

            // Posiciona acima do menu, alinhado à borda direita do menu
            let top = mRect.top - msgRect.height - 8; // 8px de espaçamento
            let left = mRect.left + mRect.width - msgRect.width - 8; // alinhado à direita com 8px de folga

            // Proteções contra sair da tela
            if (top < 8) top = 8;
            if (left < 8) left = 8;

            message.style.left = left + 'px';
            message.style.top = top + 'px';
        } else {
            // Fallback: canto inferior direito (comportamento anterior)
            message.style.right = '30px';
            message.style.bottom = 'calc(100px + 350px + 16px)';
        }

        message.style.visibility = 'visible';

        // Garantir que timeouts/handlers anteriores sejam limpos
        if (message._aguiaTimeout) {
            clearTimeout(message._aguiaTimeout);
        }
        if (message._aguiaHideHandler) {
            message.removeEventListener('animationend', message._aguiaHideHandler);
            message._aguiaHideHandler = null;
        }

        // Forçar reprodução da animação de entrada (reinicia caso já tenha sido reproduzida)
        try {
            if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                message.style.animation = 'none';
                // Força reflow para reiniciar a animação
                // eslint-disable-next-line no-unused-expressions
                message.offsetHeight;
                message.style.animation = 'slideInRight 0.28s cubic-bezier(.2,.9,.2,1) forwards';
            } else {
                // Sem animação para quem prefere reduzir movimento
                message.style.animation = 'none';
            }
        } catch (e) {
            // fallback silencioso
            message.style.animation = '';
        }

        // Oculta a mensagem após 3 segundos, com animação de saída se permitido
        message._aguiaTimeout = setTimeout(function() {
            // Se o usuário preferir reduzir movimento, não anima, apenas oculta
            var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (reduce) {
                message.style.display = 'none';
                return;
            }

            // Reproduz animação de saída e depois remove do DOM visual
            message.style.animation = 'none';
            // Força reflow
            // eslint-disable-next-line no-unused-expressions
            message.offsetHeight;
            message.style.animation = 'slideOutRight 0.18s ease forwards';

            // Handler para esconder após animação
            message._aguiaHideHandler = function() {
                message.style.display = 'none';
                message.style.animation = '';
                message.removeEventListener('animationend', message._aguiaHideHandler);
                message._aguiaHideHandler = null;
            };

            message.addEventListener('animationend', message._aguiaHideHandler);
        }, 3000);
    }
    
    // Função para aumentar o tamanho da fonte
    function increaseFontSize() {
        // Se já estamos no tamanho máximo (150%), resetar para 100%
        if (currentFontSize >= 150) {
            resetFontSize();
            showStatusMessage('Tamanho de texto resetado para o padrão', 'success');
            return;
        }
        
        // Caso contrário, aumentar o tamanho em 10%
        currentFontSize += 10;
        setFontSize(currentFontSize);
        
        // Atualiza o label do tamanho da fonte
        const fontSizeLabel = document.getElementById('aguiaFontSizeLabel');
        if (fontSizeLabel) {
            fontSizeLabel.setAttribute('data-value', currentFontSize + '%');
        }
        
        // Atualiza o slider do tamanho da fonte
        const fontSizeSlider = document.getElementById('aguiaFontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = currentFontSize;
        }
        
        // Adiciona classe ativa ao botão quando o tamanho é maior que o padrão
        const increaseFontBtn = document.getElementById('aguiaIncreaseFontBtn');
        if (increaseFontBtn) {
            if (currentFontSize > 100) {
                increaseFontBtn.classList.add('active');
            } else {
                increaseFontBtn.classList.remove('active');
            }
        }
        
        // Exibe mensagem informando o tamanho atual
        showStatusMessage('Tamanho de texto ajustado para ' + currentFontSize + '%', 'success');
    }
    
    // Função para diminuir o tamanho da fonte
    function decreaseFontSize() {
        if (currentFontSize > 100) {
            currentFontSize -= 10;
            setFontSize(currentFontSize);
            const fontSizeLabel = document.getElementById('aguiaFontSizeLabel');
            if (fontSizeLabel) {
                fontSizeLabel.setAttribute('data-value', currentFontSize + '%');
            }
            const fontSizeSlider = document.getElementById('aguiaFontSizeSlider');
            if (fontSizeSlider) {
                fontSizeSlider.value = currentFontSize;
            }
        }
    }
    
    // Função para definir o tamanho da fonte
    function setFontSize(size, silent = false) {
        // Remove todas as classes anteriores de tamanho de fonte
        AGUIA_SCOPE.classList.remove(
            'aguia-text-size-100',
            'aguia-text-size-110',
            'aguia-text-size-120',
            'aguia-text-size-130',
            'aguia-text-size-140',
            'aguia-text-size-150'
        );
        
        // Aplica a nova classe de tamanho
    AGUIA_SCOPE.classList.add('aguia-text-size-' + size);
        
        // Atualiza a variável atual
        currentFontSize = size;
        
        // Atualiza o estado do botão
        const increaseFontBtn = document.getElementById('aguiaIncreaseFontBtn');
        if (increaseFontBtn) {
            if (size > 100) {
                increaseFontBtn.classList.add('active');
            } else {
                increaseFontBtn.classList.remove('active');
            }
        }
        
        // Exibe mensagem apenas se silent for false
        if (!silent) {
            showStatusMessage('Tamanho do texto ajustado para ' + size + '%', 'success');
        }
        
        // Salva preferência
        saveUserPreference('fontSize', size);
    }
    
    // Função para resetar o tamanho da fonte
    function resetFontSize(silent = false) {
        setFontSize(100, silent);
        
        // Atualiza o controle deslizante
        const fontSizeSlider = document.getElementById('aguiaFontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.value = 100;
        }
        
        // Atualiza o rótulo
        const fontSizeLabel = document.getElementById('aguiaFontSizeLabel');
        if (fontSizeLabel) {
            fontSizeLabel.setAttribute('data-value', '100%');
        }
        
        // Certifica-se de remover a classe ativa do botão
        const increaseFontBtn = document.getElementById('aguiaIncreaseFontBtn');
        if (increaseFontBtn) {
            increaseFontBtn.classList.remove('active');
        }
    }
    
    // Função para alternar alto contraste melhorado
    function toggleHighContrast() {
        highContrastEnabled = !highContrastEnabled;
        
        // Desativa intensidade de cores se estiver ativando alto contraste
        if (highContrastEnabled && colorIntensityMode > 0) {
            // Remove todas as classes de intensidade de cor
            AGUIA_SCOPE.classList.remove(
                'aguia-color-intensity-low',
                'aguia-color-intensity-high',
                'aguia-color-intensity-gray'
            );
            
            colorIntensityMode = 0;
            
            // Atualiza o botão de intensidade
            const intensityBtn = document.getElementById('aguiaColorIntensityBtn');
            if (intensityBtn) {
                intensityBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
                const textSpan = intensityBtn.querySelector('.text');
                const iconSpan = intensityBtn.querySelector('.icon');
                if (textSpan) textSpan.textContent = 'Intensidade de Cores';
                if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
            }
            
            // Salva a preferência
            saveUserPreference('colorIntensityMode', 0);
        }
        
        // Atualiza UI
        const contrastBtn = document.getElementById('aguiaHighContrastBtn');
        if (contrastBtn) {
            if (highContrastEnabled) {
                contrastBtn.classList.add('active');
            } else {
                contrastBtn.classList.remove('active');
            }
        }
        
        // Aplica a classe ao corpo do documento
        if (highContrastEnabled) {
            AGUIA_SCOPE.classList.add('aguia-high-contrast');
            showStatusMessage('Alto contraste melhorado ativado', 'success');
        } else {
            AGUIA_SCOPE.classList.remove('aguia-high-contrast');
            showStatusMessage('Alto contraste melhorado desativado');
        }
        
        // Salva preferência
        saveUserPreference('highContrast', highContrastEnabled);
    }
    
    // Função para alternar entre os níveis de intensidade de cores
    function toggleColorIntensity() {
        // Incrementa o modo (0: normal, 1: baixa, 2: alta, 3: escala de cinza, 0: normal...)
        colorIntensityMode = (colorIntensityMode + 1) % 4;
        
        // Desativa alto contraste se estiver ativando qualquer modo de intensidade de cor
        if (colorIntensityMode > 0 && highContrastEnabled) {
            highContrastEnabled = false;
            AGUIA_SCOPE.classList.remove('aguia-high-contrast');
            
            const contrastBtn = document.getElementById('aguiaHighContrastBtn');
            if (contrastBtn) {
                contrastBtn.classList.remove('active');
            }
        }
        
        // Remove todas as classes de intensidade de cor
        AGUIA_SCOPE.classList.remove(
            'aguia-color-intensity-low',
            'aguia-color-intensity-high',
            'aguia-color-intensity-gray'
        );

        // Evita conflito com filtros de daltonismo: se for usar intensidade de cor, desativa daltonismo
        if (colorIntensityMode > 0) {
            AGUIA_SCOPE.classList.remove(
                'aguia-colorblind-protanopia',
                'aguia-colorblind-deuteranopia',
                'aguia-colorblind-tritanopia'
            );
            colorBlindMode = 'none';
            const colorblindBtn = document.getElementById('aguiaColorblindButton');
            if (colorblindBtn) colorblindBtn.classList.remove('active');
            document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option').forEach(btn => btn.classList.remove('active'));
            const noneOption = document.querySelector('#aguiaColorblindPanel .aguia-submenu-option[data-value="none"]');
            if (noneOption) noneOption.classList.add('active');
            saveUserPreference('colorblind', 'none');
            localStorage.setItem('aguia_colorblind_modes', JSON.stringify([]));
        }
        
        // Atualiza o botão
            const intensityBtn = document.getElementById('aguiaColorIntensityBtn');
        if (intensityBtn) {
            // Remove todas as classes de nível
            intensityBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            
            // Atualiza o texto e o ícone de acordo com o modo
            const textSpan = intensityBtn.querySelector('.text');
            const iconSpan = intensityBtn.querySelector('.icon');
            
            switch (colorIntensityMode) {
                case 0: // Normal
                    if (textSpan) textSpan.textContent = 'Intensidade de Cores';
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
                    showStatusMessage('Intensidade de cores normal');
                    break;
                
                case 1: // Baixa intensidade
                    AGUIA_SCOPE.classList.add('aguia-color-intensity-low');
                    intensityBtn.classList.add('active', 'level-1');
                    if (textSpan) textSpan.textContent = 'Baixa Intensidade';
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
                    showStatusMessage('Modo de baixa intensidade de cores ativado', 'success');
                    break;
                
                case 2: // Alta intensidade
                    AGUIA_SCOPE.classList.add('aguia-color-intensity-high');
                    intensityBtn.classList.add('active', 'level-2');
                    if (textSpan) textSpan.textContent = 'Alta Intensidade';
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
                    showStatusMessage('Modo de alta intensidade de cores ativado', 'success');
                    break;
                
                case 3: // Escala de cinza
                    AGUIA_SCOPE.classList.add('aguia-color-intensity-gray');
                    intensityBtn.classList.add('active', 'level-3');
                    if (textSpan) textSpan.textContent = 'Escala de Cinza';
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
                    showStatusMessage('Modo de escala de cinza ativado', 'success');
                    break;
            }
        }
        
        // Salva preferência
        saveUserPreference('colorIntensityMode', colorIntensityMode);
    }
    
    // Função para resetar configurações de contraste
    function resetContrast(silent = false) {
        // Reset de alto contraste
        if (highContrastEnabled) {
            highContrastEnabled = false;
            AGUIA_SCOPE.classList.remove('aguia-high-contrast');
            
            const contrastBtn = document.getElementById('aguiaHighContrastBtn');
            if (contrastBtn) {
                contrastBtn.classList.remove('active');
            }
            
            // Salva preferência
            saveUserPreference('highContrast', false);
        }
        
        // Reset de intensidade de cores
        if (colorIntensityMode > 0) {
            colorIntensityMode = 0;
            
            // Remove todas as classes de intensidade de cor
            AGUIA_SCOPE.classList.remove(
                'aguia-color-intensity-low',
                'aguia-color-intensity-high',
                'aguia-color-intensity-gray'
            );
            
            // Atualiza o botão de intensidade
            const intensityBtn = document.getElementById('aguiaColorIntensityBtn');
            if (intensityBtn) {
                intensityBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
                const textSpan = intensityBtn.querySelector('.text');
                const iconSpan = intensityBtn.querySelector('.icon');
                if (textSpan) textSpan.textContent = 'Intensidade de Cores';
                if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
            }
            
            // Salva preferência
            saveUserPreference('colorIntensityMode', 0);
        }
        
        // Reset de modo daltonismo
        if (colorBlindMode !== 'none') {
            // Atualiza o botão de daltonismo
            const colorblindBtn = document.getElementById('aguiaColorblindButton');
            if (colorblindBtn) {
                colorblindBtn.classList.remove('active');
            }
            
            // Reseta os botões de opção no painel de daltonismo
            document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option').forEach(btn => {
                btn.classList.remove('active');
            });
            const noneButton = document.querySelector('#aguiaColorblindPanel .aguia-submenu-option[data-value="none"]');
            if (noneButton) {
                noneButton.classList.add('active');
            }
            
            // Remove classes de daltonismo do elemento HTML
            AGUIA_SCOPE.classList.remove(
                'aguia-colorblind-protanopia',
                'aguia-colorblind-deuteranopia',
                'aguia-colorblind-tritanopia',
                'aguia-colorblind-achromatopsia'
            );
            
            colorBlindMode = 'none';
            saveUserPreference('colorblind', 'none');
        }
        
        // Salva preferências
        saveUserPreference('highContrast', false);
        saveUserPreference('invertedColors', false);
    }
    
    // Função para configurar modo de daltonismo (WCAG 1.4.8)
    // Função para lidar com múltiplos modos de daltonismo
    function setColorBlindModes(modes) {
        // Remove classes anteriores
        AGUIA_SCOPE.classList.remove(
            'aguia-colorblind-protanopia',
            'aguia-colorblind-deuteranopia',
            'aguia-colorblind-tritanopia'
        );

        // Evita conflito com os filtros de intensidade de cor (ambos usam 'filter')
        // Remover quaisquer classes de intensidade de cor ativas
        AGUIA_SCOPE.classList.remove(
            'aguia-color-intensity-low',
            'aguia-color-intensity-high',
            'aguia-color-intensity-gray'
        );
        // Zera estado interno e UI do botão de intensidade de cores, se presente
        colorIntensityMode = 0;
        const intensityBtn = document.getElementById('aguiaColorIntensityBtn');
        if (intensityBtn) {
            // Harmoniza com toggleColorIntensity, que usa classes level-1/2/3
            intensityBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            const textSpan = intensityBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Intensidade de Cores';
            }
            const iconSpan = intensityBtn.querySelector('.icon');
            if (iconSpan) {
                iconSpan.innerHTML = AguiaIcons.colorIntensity;
            }
        }
        
        // Atualiza a variável - mantemos compatibilidade com código legado usando o primeiro modo
        colorBlindMode = modes.length > 0 ? modes[0] : 'none';
        
        // Atualiza a UI para mostrar qual opção está ativa
        const colorblindButton = document.getElementById('aguiaColorblindButton');
        
        if (modes.length > 0) {
            // Aplica filtros no escopo
            modes.forEach(mode => {
                AGUIA_SCOPE.classList.add('aguia-colorblind-' + mode);
            });
            
            // Mantém o botão fora do efeito
            const aguiaButton = document.getElementById('aguiaButton');
            if (aguiaButton) {
                aguiaButton.style.filter = 'none';
            }
            
            colorblindButton.classList.add('active');
            
            // Mensagem de status para leitores de tela
            let modeNames = modes.map(mode => {
                switch (mode) {
                    case 'protanopia': return 'Protanopia (sem vermelho)';
                    case 'deuteranopia': return 'Deuteranopia (sem verde)';
                    case 'tritanopia': return 'Tritanopia (sem azul)';
                    default: return mode;
                }
            });
            
            const statusText = 'Modos de daltonismo ativados: ' + modeNames.join(', ');
            showStatusMessage(statusText, 'success');
        } else {
            // Reseta a interface quando não há modos selecionados
            colorblindButton.classList.remove('active');
            showStatusMessage('Modos de daltonismo desativados');
        }
        
        // Salva a preferência do usuário
        localStorage.setItem('aguia_colorblind_modes', JSON.stringify(modes));
        saveUserPreference('colorblind', colorBlindMode); // Mantém a compatibilidade
    }
    
    // Função legada para compatibilidade com código existente
    function setColorBlindMode(mode) {
        if (mode === 'none') {
            setColorBlindModes([]);
        } else {
            setColorBlindModes([mode]);
        }
    }
    
    // Função para alternar fontes legíveis
    function toggleReadableFonts() {
        // Atualizar para ciclar entre os 3 modos: 0 (padrão) -> 1 (fontes legíveis) -> 2 (OpenDyslexic) -> 0 (padrão)
        fontMode = (fontMode + 1) % 3;
        
        // Atualiza UI
        const fontsBtn = document.getElementById('aguiaReadableFontsBtn');
        if (fontsBtn) {
            // Limpar classes antigas
            fontsBtn.classList.remove('active', 'opendyslexic');
            
            // Atualizar texto e classe de acordo com o modo atual
            const textSpan = fontsBtn.querySelector('.text');
            const iconSpan = fontsBtn.querySelector('.icon');
            const renderReadableFontsIcon = function(mode) {
                // Fallbacks inline caso os ícones não estejam carregados ainda
                const fallbackSingleA = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="currentColor">A</text></svg>';
                const fallbackAa = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><text x="6" y="16" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="currentColor">A</text><text x="13" y="16" font-family="Arial, sans-serif" font-weight="normal" font-size="12" fill="currentColor">a</text></svg>';
                const fallbackAaOpen = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><text x="5" y="16" font-family="OpenDyslexic, Arial, sans-serif" font-weight="700" font-size="13" fill="currentColor">A</text><text x="13" y="16" font-family="OpenDyslexic, Arial, sans-serif" font-weight="400" font-size="13" fill="currentColor">a</text></svg>';
                if (mode === 0) {
                    return (typeof AguiaIcons !== 'undefined' && AguiaIcons.fontSingleA) ? AguiaIcons.fontSingleA : fallbackSingleA;
                } else if (mode === 1) {
                    return (typeof AguiaIcons !== 'undefined' && AguiaIcons.fontAaSample) ? AguiaIcons.fontAaSample : fallbackAa;
                } else {
                    return (typeof AguiaIcons !== 'undefined' && AguiaIcons.fontAaOpenDyslexic) ? AguiaIcons.fontAaOpenDyslexic : fallbackAaOpen;
                }
            };
            if (textSpan) {
                switch (fontMode) {
                    case 0: // Padrão
                        textSpan.textContent = 'Fontes Legíveis';
                        if (iconSpan) iconSpan.innerHTML = renderReadableFontsIcon(0);
                        break;
                    case 1: // Fontes Legíveis
                        textSpan.textContent = 'Fontes Legíveis';
                        fontsBtn.classList.add('active');
                        if (iconSpan) iconSpan.innerHTML = renderReadableFontsIcon(1);
                        break;
                    case 2: // OpenDyslexic
                        textSpan.textContent = 'Fontes Amigável (OpenDyslexic)';
                        fontsBtn.classList.add('active', 'opendyslexic');
                        if (iconSpan) iconSpan.innerHTML = renderReadableFontsIcon(2);
                        break;
                }
            }
        }
        
        // Remover todas as classes de fonte
    AGUIA_SCOPE.classList.remove('aguia-readable-fonts', 'aguia-opendyslexic-fonts');
        
        // Aplicar classe correta de acordo com o modo
        switch (fontMode) {
            case 0: // Padrão
                showStatusMessage('Fontes padrão ativadas');
                readableFontsEnabled = false;
                break;
            case 1: // Fontes Legíveis
                AGUIA_SCOPE.classList.add('aguia-readable-fonts');
                showStatusMessage('Fontes legíveis ativadas', 'success');
                readableFontsEnabled = true;
                break;
            case 2: // OpenDyslexic
                AGUIA_SCOPE.classList.add('aguia-opendyslexic-fonts');
                showStatusMessage('Fontes Amigável (OpenDyslexic) ativadas', 'success');
                readableFontsEnabled = true;
                break;
        }
        
        // Salva preferências
        saveUserPreference('readableFonts', readableFontsEnabled);
        saveUserPreference('fontMode', fontMode);
    }
    
    // Função para alternar espaçamento entre linhas com níveis
    function toggleLineSpacing() {
        // Incrementa o nível (0->1->2->3->0)
        lineSpacingLevel = (lineSpacingLevel + 1) % 4;
        
        // Atualiza UI
        const lineSpacingBtn = document.getElementById('aguiaLineSpacingBtn');
        if (lineSpacingBtn) {
            // Remove todas as classes de nível
            lineSpacingBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            
            if (lineSpacingLevel > 0) {
                lineSpacingBtn.classList.add('active');
                lineSpacingBtn.classList.add(`level-${lineSpacingLevel}`);
                
                // Atualiza o texto do botão para indicar o nível atual
                const textSpan = lineSpacingBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Espaçamento entre Linhas', 'Espaçamento entre Linhas 1', 'Espaçamento entre Linhas 2', 'Espaçamento entre Linhas 3'];
                    textSpan.textContent = levels[lineSpacingLevel];
                }
            } else {
                // Restaura o texto original do botão
                const textSpan = lineSpacingBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Espaçamento entre Linhas';
                }
            }
        }
        
        // Remove todas as classes de espaçamento entre linhas existentes
    AGUIA_SCOPE.classList.remove('aguia-line-spacing-level-1', 'aguia-line-spacing-level-2', 'aguia-line-spacing-level-3');
        
        // Para compatibilidade com versões anteriores
        if (AGUIA_SCOPE.classList.contains('aguia-spacing-level-1') || 
            AGUIA_SCOPE.classList.contains('aguia-spacing-level-2') || 
            AGUIA_SCOPE.classList.contains('aguia-spacing-level-3')) {
            AGUIA_SCOPE.classList.remove('aguia-spacing-level-1', 'aguia-spacing-level-2', 'aguia-spacing-level-3', 'aguia-increased-spacing');
        }
        
        // Aplica a classe apropriada baseada no nível
        if (lineSpacingLevel > 0) {
            AGUIA_SCOPE.classList.add(`aguia-line-spacing-level-${lineSpacingLevel}`);
            
            // Mensagens detalhadas por nível
            const levelMessages = [
                '',
                'Espaçamento entre Linhas nível 1: Melhora o espaçamento vertical do texto',
                'Espaçamento entre Linhas nível 2: Espaçamento vertical ampliado para conforto visual',
                'Espaçamento entre Linhas nível 3: Máximo espaçamento vertical entre as linhas'
            ];
            
            showStatusMessage(levelMessages[lineSpacingLevel], 'success');
        } else {
            showStatusMessage('Espaçamento entre Linhas desativado');
        }
        
        // Salva preferência
        saveUserPreference('lineSpacing', lineSpacingLevel);
    }
    
    // Nova função para alternar espaçamento entre letras com níveis
    function toggleLetterSpacing() {
        // Incrementa o nível (0->1->2->3->0)
        letterSpacingLevel = (letterSpacingLevel + 1) % 4;
        
        // Atualiza UI
        const letterSpacingBtn = document.getElementById('aguiaLetterSpacingBtn');
        if (letterSpacingBtn) {
            // Remove todas as classes de nível
            letterSpacingBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            
            if (letterSpacingLevel > 0) {
                letterSpacingBtn.classList.add('active');
                letterSpacingBtn.classList.add(`level-${letterSpacingLevel}`);
                
                // Atualiza o texto do botão para indicar o nível atual
                const textSpan = letterSpacingBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Espaçamento entre Letras', 'Espaçamento entre Letras 1', 'Espaçamento entre Letras 2', 'Espaçamento entre Letras 3'];
                    textSpan.textContent = levels[letterSpacingLevel];
                }
            } else {
                // Restaura o texto original do botão
                const textSpan = letterSpacingBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Espaçamento entre Letras';
                }
            }
        }
        
        // Remove todas as classes de espaçamento entre letras existentes
    AGUIA_SCOPE.classList.remove('aguia-letter-spacing-level-1', 'aguia-letter-spacing-level-2', 'aguia-letter-spacing-level-3');
        
        // Aplica a classe apropriada baseada no nível
        if (letterSpacingLevel > 0) {
            AGUIA_SCOPE.classList.add(`aguia-letter-spacing-level-${letterSpacingLevel}`);
            
            // Mensagens detalhadas por nível
            const levelMessages = [
                '',
                'Espaçamento entre Letras nível 1: Melhora a legibilidade do texto',
                'Espaçamento entre Letras nível 2: Espaçamento médio entre letras e palavras',
                'Espaçamento entre Letras nível 3: Máximo espaçamento entre letras para leitura facilitada'
            ];
            
            showStatusMessage(levelMessages[letterSpacingLevel], 'success');
        } else {
            showStatusMessage('Espaçamento entre Letras desativado');
        }
        
        // Salva preferência
        saveUserPreference('letterSpacing', letterSpacingLevel);
    }
    
    // Texto para fala (WCAG 1.4.1)
    function toggleTextToSpeech(silent = false) {
        textToSpeechEnabled = !textToSpeechEnabled;
        
        // Atualiza UI
        const ttsBtn = document.getElementById('aguiaTextToSpeechBtn');
        if (ttsBtn) {
            if (textToSpeechEnabled) {
                ttsBtn.classList.add('active');
            } else {
                ttsBtn.classList.remove('active');
            }
        }
        
        if (textToSpeechEnabled) {
            // Adiciona listeners para elementos que podem ser lidos
            addTextToSpeechListeners();
            if (!silent) {
                showStatusMessage('Texto para fala ativado', 'success');
            }
        } else {
            // Remove listeners
            removeTextToSpeechListeners();
            if (!silent) {
                showStatusMessage('Texto para fala desativado');
            }
            
            // Para qualquer leitura em andamento
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
        
        // Salva preferência
        saveUserPreference('textToSpeech', textToSpeechEnabled);
    }
    
    // Função para adicionar listeners de texto para fala
    function addTextToSpeechListeners() {
    const elements = (AGUIA_SCOPE || document).querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, a, button, label');
        
        elements.forEach(function(element) {
            element.setAttribute('data-aguia-tts', 'true');
            element.addEventListener('click', speakText);
            
            // Adiciona efeito de hover para indicar que é clicável
            element.addEventListener('mouseenter', function() {
                if (textToSpeechEnabled) {
                    this.classList.add('aguia-tts-hoverable');
                }
            });
            
            element.addEventListener('mouseleave', function() {
                this.classList.remove('aguia-tts-hoverable');
            });
        });
    }
    
    // Função para remover listeners de texto para fala
    function removeTextToSpeechListeners() {
    const elements = (AGUIA_SCOPE || document).querySelectorAll('[data-aguia-tts="true"]');
        
        elements.forEach(function(element) {
            element.removeEventListener('click', speakText);
            element.removeAttribute('data-aguia-tts');
            element.classList.remove('aguia-tts-hoverable');
            element.classList.remove('aguia-text-highlight');
        });
    }
    
    // Função para ler texto em voz alta
    function speakText(event) {
        // Só executa se TTS estiver ativado
        if (!textToSpeechEnabled) return;
        
        // Previne a navegação para links
        if (this.tagName.toLowerCase() === 'a') {
            event.preventDefault();
        }
        
        // Remove destaque de texto anterior
        const highlighted = document.querySelectorAll('.aguia-text-highlight');
        highlighted.forEach(function(el) {
            el.classList.remove('aguia-text-highlight');
        });
        
        // Adiciona destaque ao elemento atual
        this.classList.add('aguia-text-highlight');
        
        const text = this.textContent.trim();
        
        if (text && 'speechSynthesis' in window) {
            // Para qualquer leitura em andamento
            window.speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = document.documentElement.lang || 'pt-BR';
            
            // Quando terminar a leitura, remove o destaque
            utterance.onend = function() {
                document.querySelectorAll('.aguia-text-highlight').forEach(function(el) {
                    el.classList.remove('aguia-text-highlight');
                });
            };
            
            window.speechSynthesis.speak(utterance);
        }
    }
    
    // Auxiliar de leitura (WCAG 2.4.8)
    function toggleReadingHelper(silent = false) {
        readingHelperEnabled = !readingHelperEnabled;
        
        // Atualiza UI
        const helperBtn = document.getElementById('aguiaReadingHelperBtn');
        if (helperBtn) {
            if (readingHelperEnabled) {
                helperBtn.classList.add('active');
            } else {
                helperBtn.classList.remove('active');
            }
        }
        
        if (readingHelperEnabled) {
            createReadingHelper();
            if (!silent) {
                showStatusMessage('Guia de leitura ativado', 'success');
            }
        } else {
            const helper = document.getElementById('aguiaReadingHelper');
            if (helper) {
                helper.remove();
            }
            if (!silent) {
                showStatusMessage('Guia de leitura desativado');
            }
            // Remove o event listener
            if (typeof window.aguia_cleanupElementEventListeners === 'function') {
                window.aguia_cleanupElementEventListeners(document);
            } else {
                document.removeEventListener('mousemove', updateReadingHelper);
            }
            showStatusMessage('Guia de leitura desativado');
        }
        
        // Salva preferência
        saveUserPreference('readingHelper', readingHelperEnabled);
    }
    
    // Função para criar o auxiliar de leitura
    function createReadingHelper() {
        const helper = document.createElement('div');
        helper.id = 'aguiaReadingHelper';
        helper.className = 'aguia-reading-helper';
        document.body.appendChild(helper);
        
        // Adiciona evento para seguir o cursor usando gerenciamento de memória
        if (typeof window.aguia_registerEventListener === 'function') {
            window.aguia_registerEventListener(document, 'mousemove', updateReadingHelper);
        } else {
            document.addEventListener('mousemove', updateReadingHelper);
        }
    }
    
    // Função para atualizar a posição do auxiliar de leitura
    function updateReadingHelper(e) {
        const helper = document.getElementById('aguiaReadingHelper');
        if (!helper || !readingHelperEnabled) return;
        
        // Encontra o elemento sob o cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        
        if (element && element !== helper) {
            // Obtém a linha de texto mais próxima do cursor
            const lineInfo = getTextLineAtPoint(e.clientX, e.clientY, element);
            
            if (lineInfo) {
                // Animação suave para melhorar a experiência visual
                if (helper.style.display === 'none') {
                    helper.style.width = lineInfo.width + 'px';
                    helper.style.top = (lineInfo.top) + 'px';
                    helper.style.left = lineInfo.left + 'px';
                    helper.style.height = lineInfo.height + 'px';
                    helper.style.display = 'block';
                    helper.style.opacity = '0';
                    
                    // Adiciona transição suave
                    setTimeout(() => {
                        helper.style.opacity = '1';
                    }, 10);
                } else {
                    // Movimento suave com requestAnimationFrame para performance
                    requestAnimationFrame(() => {
                        helper.style.width = lineInfo.width + 'px';
                        helper.style.top = (lineInfo.top) + 'px';
                        helper.style.left = lineInfo.left + 'px';
                        helper.style.height = lineInfo.height + 'px';
                        helper.style.display = 'block';
                        helper.style.opacity = '1';
                    });
                }
            } else {
                // Quando não está sobre texto, esconde o guia
                requestAnimationFrame(() => {
                    helper.style.display = 'none';
                    helper.style.opacity = '0';
                });
            }
        } else {
            // Quando não está sobre nenhum elemento válido, esconde o guia
            requestAnimationFrame(() => {
                helper.style.display = 'none';
                helper.style.opacity = '0';
            });
        }
    }
    
    // Função para obter informações da linha de texto sob o cursor
    function getTextLineAtPoint(x, y, element) {
        // Verifica se é um elemento ou filho de elemento que deve ser ignorado
        const ignoreElements = ['IMG', 'CANVAS', 'SVG', 'VIDEO', 'IFRAME', 'INPUT', 'TEXTAREA', 'SELECT', 'TABLE'];
        
        // Se o elemento atual é um dos elementos ignorados, retorne null
        if (ignoreElements.includes(element.tagName)) {
            return null;
        }
        
        // Lista de elementos que normalmente contêm texto a ser destacado
        const textElements = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'SPAN', 'DIV', 'A', 'BUTTON', 'LABEL', 'STRONG', 'EM', 'SMALL', 'CODE', 'PRE', 'BLOCKQUOTE'];
        
        // Verifica se o elemento ou algum ancestral próximo é um elemento de texto com conteúdo significativo
        let textContainer = null;
        let currentElement = element;
        let depth = 0;
        const maxDepth = 4; // Limite de profundidade para procurar ancestrais
        
        while (currentElement && depth < maxDepth) {
            // Verifica se é um elemento de texto válido com conteúdo real
            if (
                textElements.includes(currentElement.tagName) && 
                currentElement.textContent && 
                currentElement.textContent.trim().length > 1 && // Pelo menos alguns caracteres
                !ignoreElements.includes(currentElement.tagName)
            ) {
                // Verifica se o elemento não contém apenas elementos ignorados
                const hasVisibleText = Array.from(currentElement.childNodes).some(node => {
                    return node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0;
                });
                
                if (hasVisibleText) {
                    textContainer = currentElement;
                    break;
                }
            }
            
            currentElement = currentElement.parentElement;
            depth++;
        }
        
        // Se não encontrou um container de texto válido, retorna null
        if (!textContainer) {
            return null;
        }
        
        // Obtém informações do retângulo do elemento
        const rect = textContainer.getBoundingClientRect();
        
        // Se o elemento de texto for muito pequeno ou estreito, talvez não seja texto legível
        if (rect.width < 50 || rect.height < 12) {
            return null;
        }
        
        // Obtém o estilo computado para informações de linha
        const style = window.getComputedStyle(textContainer);
        let lineHeight = parseInt(style.lineHeight);
        
        // Se não conseguir obter lineHeight, calcular com base no fontSize
        if (isNaN(lineHeight) || lineHeight === 0) {
            const fontSize = parseInt(style.fontSize) || 16;
            lineHeight = Math.round(fontSize * 1.4); // Estimativa razoável
        }
        
        // Calcula a posição relativa do cursor dentro do elemento
        const relativeY = y - rect.top;
        
        // Calcula qual linha foi clicada
        const lineIndex = Math.floor(relativeY / lineHeight);
        const lineTop = rect.top + (lineIndex * lineHeight);
        
        return {
            left: rect.left,
            top: window.scrollY + lineTop,
            width: rect.width,
            height: Math.max(lineHeight, 20) // Altura mínima para visibilidade
        };
    }
    
    // Função auxiliar para encontrar o container de texto mais apropriado
    function findTextContainer(element) {
        // Começar pelo elemento atual e subir na árvore DOM
        let current = element;
        let maxLevels = 3; // Limite de níveis para evitar subir demais
        
        while (current && maxLevels > 0) {
            // Verificar se o elemento atual contém texto significativo
            if (current.textContent && current.textContent.trim().length > 10) {
                // Verificar se é um container comum de texto
                if (['P', 'DIV', 'ARTICLE', 'SECTION', 'LI', 'TD', 'BLOCKQUOTE'].includes(current.tagName)) {
                    return current;
                }
            }
            
            current = current.parentElement;
            maxLevels--;
        }
        
        return element; // Retorna o elemento original se não encontrou nada melhor
    }
    
    // Destacar links (WCAG 1.4.1)
    function toggleEmphasizeLinks(silent = false) {
        emphasizeLinksEnabled = !emphasizeLinksEnabled;
        
        // Atualiza UI
        const linksBtn = document.getElementById('aguiaEmphasizeLinksBtn');
        if (linksBtn) {
            if (emphasizeLinksEnabled) {
                linksBtn.classList.add('active');
            } else {
                linksBtn.classList.remove('active');
            }
        }
        
        if (emphasizeLinksEnabled) {
            AGUIA_SCOPE.classList.add('aguia-emphasize-links');
            if (!silent) {
                showStatusMessage('Links destacados ativados', 'success');
            }
        } else {
            AGUIA_SCOPE.classList.remove('aguia-emphasize-links');
            if (!silent) {
                showStatusMessage('Links destacados desativados');
            }
        }
        
        // Salva preferência
        saveUserPreference('emphasizeLinks', emphasizeLinksEnabled);
    }
    
    // Destacar cabeçalhos (WCAG 2.4.6)
    function toggleHeaderHighlight(silent = false) {
        headerHighlightEnabled = !headerHighlightEnabled;
        
        // Atualiza UI
        const headerBtn = document.getElementById('aguiaHeaderHighlightBtn');
        if (headerBtn) {
            if (headerHighlightEnabled) {
                headerBtn.classList.add('active');
            } else {
                headerBtn.classList.remove('active');
            }
        }
        
        if (headerHighlightEnabled) {
            // Adiciona uma classe ao body para facilitar aplicação de estilos CSS
            AGUIA_SCOPE.classList.add('aguia-highlight-headers');
            if (!silent) {
                showStatusMessage('Cabeçalhos destacados ativados', 'success');
            }
        } else {
            // Remove a classe do body
            AGUIA_SCOPE.classList.remove('aguia-highlight-headers');
            if (!silent) {
                showStatusMessage('Cabeçalhos destacados desativados');
            }
        }
        
        // Salva preferência
        saveUserPreference('headerHighlight', headerHighlightEnabled);
    }
    
    // Função para ocultar todas as imagens (WCAG 1.1.1)
    function toggleHideImages(silent = false) {
        hideImagesEnabled = !hideImagesEnabled;
        
        // Atualiza UI
        const hideImagesBtn = document.getElementById('aguiaHideImagesBtn');
        if (hideImagesBtn) {
            if (hideImagesEnabled) {
                hideImagesBtn.classList.add('active');
            } else {
                hideImagesBtn.classList.remove('active');
            }
        }
        
        if (hideImagesEnabled) {
            AGUIA_SCOPE.classList.add('aguia-hide-images');
            if (!silent) {
                showStatusMessage('Ocultação de imagens ativada', 'success');
            }
        } else {
            AGUIA_SCOPE.classList.remove('aguia-hide-images');
            if (!silent) {
                showStatusMessage('Ocultação de imagens desativada');
            }
        }
        
        // Salva preferência
        saveUserPreference('hideImages', hideImagesEnabled);
    }
    
    // Função para resetar todas as configurações
    function resetAll() {
        // Reset de tamanho de fonte
        resetFontSize(true);
        
        // Reset de contraste - forçado mesmo se não estiver ativo
        resetContrast(true);
        
        // Reset de ocultação de imagens - forçado
        if (hideImagesEnabled) {
            toggleHideImages(true);
        } else {
            // Garante que as classes sejam removidas e as preferências atualizadas
            AGUIA_SCOPE.classList.remove('aguia-hide-images');
            saveUserPreference('hideImages', false);
        }
        
        // Reset da lupa de conteúdo
    AGUIA_SCOPE.classList.remove('aguia-magnifier-active');
        // Remover a classe active do botão da lupa
        const menuMagnifierBtn = document.getElementById('aguiaMagnifierBtn');
        if (menuMagnifierBtn) {
            menuMagnifierBtn.classList.remove('active');
        }
        // Remover a classe active do botão da lupa standalone
        const standaloneButton = document.getElementById('aguia-magnifier-button');
        if (standaloneButton) {
            standaloneButton.classList.remove('active');
        }
        // Salvar o estado desativado da lupa
        localStorage.setItem('aguia_magnifier_enabled', 'false');
        saveUserPreference('magnifier', false);
        
        // Reset completo de máscaras e cursor
        resetReadingMaskAndCursor(true);
        
        // Força desativação dos novos tipos de máscara
        horizontalMaskLevel = 0;
        verticalMaskLevel = 0;
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-1');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-2');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-3');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-1');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-2');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-3');
    AGUIA_SCOPE.classList.remove('aguia-custom-cursor');
        saveUserPreference('horizontalMaskLevel', 0);
        saveUserPreference('verticalMaskLevel', 0);
        saveUserPreference('customCursor', false);
        
        // Reset dos botões de máscara
        const horizontalMaskBtn = document.getElementById('aguiaHorizontalMaskBtn');
        if (horizontalMaskBtn) {
            horizontalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            const textSpan = horizontalMaskBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Máscara de Foco Horizontal';
            }
        }
        
        const verticalMaskBtn = document.getElementById('aguiaVerticalMaskBtn');
        if (verticalMaskBtn) {
            verticalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            const textSpan = verticalMaskBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Máscara de Foco Vertical';
            }
        }
        
        const customCursorBtn = document.getElementById('aguiaCustomCursorBtn');
        if (customCursorBtn) {
            customCursorBtn.classList.remove('active');
        }
        
        // Esconde as máscaras
        const maskH = document.getElementById('aguiaReadingMaskH');
        if (maskH) maskH.style.display = 'none';
        const maskV = document.getElementById('aguiaReadingMaskV');
        if (maskV) maskV.style.display = 'none';
        
        // Reset de fontes legíveis e OpenDyslexic - forçado
        // Remover todas as classes de fonte
    AGUIA_SCOPE.classList.remove('aguia-readable-fonts', 'aguia-opendyslexic-fonts');
        
        // Resetar o botão
        const fontsBtn = document.getElementById('aguiaReadableFontsBtn');
        if (fontsBtn) {
            fontsBtn.classList.remove('active', 'opendyslexic');
            const textSpan = fontsBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Fontes Legíveis';
            }
        }
        
        // Resetar variáveis
        fontMode = 0;
        readableFontsEnabled = false;
        
        // Salvar preferências
        saveUserPreference('readableFonts', false);
        saveUserPreference('fontMode', 0);
        
        // Reset de espaçamento entre linhas - forçado
        // Reseta para zero
    AGUIA_SCOPE.classList.remove('aguia-line-spacing-level-1', 'aguia-line-spacing-level-2', 'aguia-line-spacing-level-3');
    AGUIA_SCOPE.classList.remove('aguia-spacing-level-1', 'aguia-spacing-level-2', 'aguia-spacing-level-3'); // Para compatibilidade
    AGUIA_SCOPE.classList.remove('aguia-increased-spacing'); // Para compatibilidade
        
        // Reset do botão
        const lineSpacingBtn = document.getElementById('aguiaLineSpacingBtn');
        if (lineSpacingBtn) {
            lineSpacingBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            
            // Restaura o texto original
            const textSpan = lineSpacingBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Espaçamento entre Linhas';
            }
        }
        
        // Reset da variável
        lineSpacingLevel = 0;
        
        // Salva a preferência
        saveUserPreference('lineSpacing', 0);
        
        // Reset de espaçamento entre letras - forçado
        // Reseta para zero
    AGUIA_SCOPE.classList.remove('aguia-letter-spacing-level-1', 'aguia-letter-spacing-level-2', 'aguia-letter-spacing-level-3');
        
        // Reset do botão
        const letterSpacingBtn = document.getElementById('aguiaLetterSpacingBtn');
        if (letterSpacingBtn) {
            letterSpacingBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            
            // Restaura o texto original
            const textSpan = letterSpacingBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Espaçamento entre Letras';
            }
        }
        
        // Reset da variável
        letterSpacingLevel = 0;
        
        // Salva a preferência
        saveUserPreference('letterSpacing', 0);
        
        // Reset de texto para fala - forçado
        if (textToSpeechEnabled) {
            toggleTextToSpeech(true);
        } else {
            // Garante que esteja desativado
            // Para qualquer leitura em andamento
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
            
            // Remove listeners
            removeTextToSpeechListeners();
            
            // Reset do botão
            const ttsBtn = document.getElementById('aguiaTextToSpeechBtn');
            if (ttsBtn) {
                ttsBtn.classList.remove('active');
            }
            
            saveUserPreference('textToSpeech', false);
        }
        
        // Reset de auxiliar de leitura - forçado
        if (readingHelperEnabled) {
            toggleReadingHelper(true);
        } else {
            // Garante que esteja desativado
            const helper = document.getElementById('aguiaReadingHelper');
            if (helper) {
                helper.remove();
            }
            
            // Reset do botão
            const helperBtn = document.getElementById('aguiaReadingHelperBtn');
            if (helperBtn) {
                helperBtn.classList.remove('active');
            }
            
            saveUserPreference('readingHelper', false);
        }
        
        // Reset de destaque de links - forçado
        if (emphasizeLinksEnabled) {
            toggleEmphasizeLinks(true);
        } else {
            // Garante que esteja desativado
            AGUIA_SCOPE.classList.remove('aguia-emphasize-links');
            
            // Reset do botão
            const linksBtn = document.getElementById('aguiaEmphasizeLinksBtn');
            if (linksBtn) {
                linksBtn.classList.remove('active');
            }
            
            saveUserPreference('emphasizeLinks', false);
        }
        
        // Reset de destaque de cabeçalhos - forçado
        if (headerHighlightEnabled) {
            toggleHeaderHighlight(true);
        } else {
            // Garante que esteja desativado
            AGUIA_SCOPE.classList.remove('aguia-highlight-headers');
            
            // Reset do botão
            const headerBtn = document.getElementById('aguiaHeaderHighlightBtn');
            if (headerBtn) {
                headerBtn.classList.remove('active');
            }
            
            saveUserPreference('headerHighlight', false);
        }
        
        // Reset de letras destacadas - forçado
        if (highlightedLettersLevel > 0) {
            toggleHighlightedLetters(true);
        } else {
            // Garante que esteja desativado
            AGUIA_SCOPE.classList.remove('aguia-highlighted-letters', 'level-1', 'level-2', 'level-3');
            
            // Reset do botão
            const highlightedLettersBtn = document.getElementById('aguiaHighlightedLettersBtn');
            if (highlightedLettersBtn) {
                highlightedLettersBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
                
                // Restaura o texto original
                const textSpan = highlightedLettersBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Letras Destacadas';
                }
            }
            
            // Reset da variável
            highlightedLettersLevel = 0;
            
            saveUserPreference('highlightedLetters', 0);
        }
        
        // Reset de modo daltonismo - forçado
        // Reseta para nenhum filtro de daltonismo
        setColorBlindModes([]);
        
        // Remove classes de daltonismo do elemento HTML
        AGUIA_SCOPE.classList.remove(
            'aguia-colorblind-protanopia',
            'aguia-colorblind-deuteranopia',
            'aguia-colorblind-tritanopia'
        );
        
        // Atualiza a UI no painel de daltonismo
        document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.value === 'none') {
                btn.classList.add('active');
            }
        });
        
        // Reset do botão de daltonismo
        const colorblindBtn = document.getElementById('aguiaColorblindButton');
        if (colorblindBtn) {
            colorblindBtn.classList.remove('active');
        }
        
        colorBlindMode = 'none';
        saveUserPreference('colorblind', 'none');
        
    // Reset da Lupa de Conteúdo
    AGUIA_SCOPE.classList.remove('aguia-magnifier-active');
        
        // Reset do botão da lupa no menu
        const menuLupaBtn = document.getElementById('aguiaMagnifierBtn');
        if (menuLupaBtn) {
            menuLupaBtn.classList.remove('active');
        }
        
        // Reset do botão standalone da lupa
        const standaloneMagnifierBtn = document.getElementById('aguia-magnifier-standalone-button');
        if (standaloneMagnifierBtn) {
            standaloneMagnifierBtn.classList.remove('active');
        }
        
        // Esconde o elemento da lupa
        const magnifier = document.getElementById('aguia-magnifier');
        if (magnifier) {
            magnifier.style.display = 'none';
        }
        
        // Se a API AguiaMagnifier estiver disponível, atualiza o estado interno
        if (window.AguiaMagnifier && typeof window.AguiaMagnifier.saveState === 'function') {
            window.AguiaMagnifier.saveState(false);
        } else {
            // Fallback para localStorage
            localStorage.setItem('aguia_magnifier_enabled', JSON.stringify(false));
        }
        
        saveUserPreference('magnifier', false);
        
        // Garantir que todas as variáveis de controle estão com valores padrão
        highContrastEnabled = false;
        invertedColorsEnabled = false;
        hideImagesEnabled = false;
        readingMaskMode = 0;
        customCursorEnabled = false;
        horizontalMaskLevel = 0;
        verticalMaskLevel = 0;
        readableFontsEnabled = false;
        fontMode = 0;
        lineSpacingLevel = 0;
        letterSpacingLevel = 0;
        textToSpeechEnabled = false;
        readingHelperEnabled = false;
        emphasizeLinksEnabled = false;
        headerHighlightEnabled = false;
        highlightedLettersLevel = 0;
        colorBlindMode = 'none';
        
        showStatusMessage('AGUIA Resetado', 'success');
    }
    
    // Função para salvar preferências do usuário
    function saveUserPreference(preference, value) {
        // Usa a API AGUIA para salvar a preferência localmente e, se autosync desligado, só no servidor quando clicar em salvar
        if (window.AguiaAPI && typeof window.AguiaAPI.savePreference === 'function') {
            window.AguiaAPI.savePreference(preference, value)
                .then(() => {
                    // Sucesso silencioso
                })
                .catch(error => {
                    console.error('Erro ao salvar preferência:', error);
                    // Sempre salvar no localStorage como backup
                    localStorage.setItem('aguia_' + preference, JSON.stringify(value));
                });
        } else {
            // Fallback para o caso da API não estar disponível
            if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
                // Usando o webservice para salvar preferências
                const data = {
                    preference: preference,
                    value: value
                };
                
                fetch(M.cfg.wwwroot + '/local/aguiaplugin/preferences/salvar.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Moodle-Sesskey': M.cfg.sesskey
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    // Verificar se a resposta é JSON
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    } else {
                        // Se não for JSON, salvar no localStorage e registrar o erro
                        console.error('Resposta não-JSON do servidor ao salvar preferência');
                        localStorage.setItem('aguia_' + preference, JSON.stringify(value));
                        throw new Error('Resposta não-JSON do servidor');
                    }
                })
                .then(data => {
                    if (!data.success) {
                        // Se não foi bem sucedido, salvar no localStorage
                        console.warn('Servidor retornou erro ao salvar preferência:', data.message);
                        localStorage.setItem('aguia_' + preference, JSON.stringify(value));
                    }
                })
                .catch(function(error) {
                    console.error('Erro ao salvar preferência:', error);
                    // Sempre salvar no localStorage como backup em caso de erro
                    localStorage.setItem('aguia_' + preference, JSON.stringify(value));
                });
            } else {
                // Fallback para localStorage quando não estiver logado
                localStorage.setItem('aguia_' + preference, JSON.stringify(value));
            }
        }
    }
    
    // Função para carregar preferências do usuário
    function loadUserPreferences() {
        // Usa a API AGUIA para carregar as preferências
        if (window.AguiaAPI && typeof window.AguiaAPI.loadPreferences === 'function') {
            window.AguiaAPI.loadPreferences()
                .then(preferences => {
                    applyUserPreferences(preferences);
                })
                .catch(() => {
                    // Em caso de erro, carrega do localStorage usando a função compatível
                    loadFromLocalStorage();
                });
        } else {
            // Fallback para o caso da API não estar disponível
            if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
                const url = M.cfg.wwwroot + '/local/aguiaplugin/preferences/obter.php?sesskey=' + encodeURIComponent(M.cfg.sesskey);
                fetch(url, {
                    method: 'GET',
                    headers: {
                        'X-Moodle-Sesskey': M.cfg.sesskey
                    },
                    credentials: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {
                    if (data && data.preferences) {
                        applyUserPreferences(data.preferences);
                    } else {
                        // Se não houver preferências no Moodle, tenta carregar do localStorage
                        loadFromLocalStorage();
                    }
                })
                .catch(function() {
                    // Em caso de erro, tenta carregar do localStorage
                    loadFromLocalStorage();
                });
            } else {
                // Para usuários não logados, carrega do localStorage
                loadFromLocalStorage();
            }
        }
    }
    
    // Função para carregar preferências do localStorage
    function loadFromLocalStorage() {
        // Usa a API AGUIA para carregar preferências do localStorage
        if (window.AguiaAPI && typeof window.AguiaAPI.loadFromLocalStorage === 'function') {
            const preferences = window.AguiaAPI.loadFromLocalStorage();
            applyUserPreferences(preferences);
        } else {
            // Fallback para implementação local
            const getFromLocalStorage = function(key, defaultValue) {
                const item = localStorage.getItem('aguia_' + key);
                if (item === null) return defaultValue;
                try {
                    return JSON.parse(item);
                } catch (e) {
                    return defaultValue;
                }
            };
            
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
            
            // Limpa chave legada de VLibras, se existir
            try { localStorage.removeItem('aguia_vlibras'); } catch (e) {}
            applyUserPreferences(preferences);
        }
    }
    
    // Função auxiliar para obter valores do localStorage
    function getFromLocalStorage(key, defaultValue) {
        if (window.AguiaAPI && typeof window.AguiaAPI.getFromLocalStorage === 'function') {
            return window.AguiaAPI.getFromLocalStorage(key, defaultValue);
        } else {
            const stored = localStorage.getItem('aguia_' + key);
            return stored ? JSON.parse(stored) : defaultValue;
        }
    }
    
    // Função para aplicar preferências carregadas
    function applyUserPreferences(preferences) {
        // Aplicar tamanho de fonte
        if (preferences.fontSize && preferences.fontSize !== 100) {
            currentFontSize = preferences.fontSize;
            setFontSize(currentFontSize);
            
            // Atualiza o slider se existir
            const fontSizeSlider = document.getElementById('aguiaFontSizeSlider');
            if (fontSizeSlider) {
                fontSizeSlider.value = currentFontSize;
            }
            
            // Atualiza o label se existir
            const fontSizeLabel = document.getElementById('aguiaFontSizeLabel');
            if (fontSizeLabel) {
                fontSizeLabel.setAttribute('data-value', currentFontSize + '%');
            }
        }
        
        // Aplicar alto contraste
        if (preferences.highContrast) {
            highContrastEnabled = true;
            AGUIA_SCOPE.classList.add('aguia-high-contrast');
            
            // Atualiza botão se existir
            const contrastBtn = document.getElementById('aguiaHighContrastBtn');
            if (contrastBtn) {
                contrastBtn.classList.add('active');
            }
        }
        
        // Aplicar modo de intensidade de cor
        colorIntensityMode = parseInt(preferences.colorIntensityMode) || 0;
        if (colorIntensityMode > 0) {
            // Atualiza botão se existir
            const intensityBtn = document.getElementById('aguiaColorIntensityBtn');
            
            // Aplica a classe adequada ao body
            switch (colorIntensityMode) {
                case 1: // Baixa intensidade
                    AGUIA_SCOPE.classList.add('aguia-color-intensity-low');
                    if (intensityBtn) {
                        intensityBtn.classList.add('active', 'level-1');
                        const textSpan = intensityBtn.querySelector('.text');
                        const iconSpan = intensityBtn.querySelector('.icon');
                        if (textSpan) textSpan.textContent = 'Baixa Intensidade';
                        if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
                    }
                    break;
                
                case 2: // Alta intensidade
                    AGUIA_SCOPE.classList.add('aguia-color-intensity-high');
                    if (intensityBtn) {
                        intensityBtn.classList.add('active', 'level-2');
                        const textSpan = intensityBtn.querySelector('.text');
                        const iconSpan = intensityBtn.querySelector('.icon');
                        if (textSpan) textSpan.textContent = 'Alta Intensidade';
                        if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
                    }
                    break;
                
                case 3: // Escala de cinza
                    AGUIA_SCOPE.classList.add('aguia-color-intensity-gray');
                    if (intensityBtn) {
                        intensityBtn.classList.add('active', 'level-3');
                        const textSpan = intensityBtn.querySelector('.text');
                        const iconSpan = intensityBtn.querySelector('.icon');
                        if (textSpan) textSpan.textContent = 'Escala de Cinza';
                        if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensity;
                    }
                    break;
            }
        }
        
        // Aplicar fontes legíveis ou OpenDyslexic
        // Se o servidor retornou somente readableFonts=true (legado), mapeia para fontMode=1
        let incomingFontMode = parseInt(preferences.fontMode) || 0;
        if (!incomingFontMode && preferences.readableFonts) {
            incomingFontMode = 1;
        }
        fontMode = incomingFontMode;
        if (fontMode > 0) {
            readableFontsEnabled = true;
            
            // Atualiza botão se existir
            const fontsBtn = document.getElementById('aguiaReadableFontsBtn');
            if (fontsBtn) {
                fontsBtn.classList.add('active');
                
                // Atualiza texto, ícone e classe de acordo com o modo
                const textSpan = fontsBtn.querySelector('.text');
                const iconSpan = fontsBtn.querySelector('.icon');
                const renderReadableFontsIcon = function(mode) {
                    const fallbackSingleA = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="currentColor">A</text></svg>';
                    const fallbackAa = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><text x="6" y="16" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="currentColor">A</text><text x="13" y="16" font-family="Arial, sans-serif" font-weight="normal" font-size="12" fill="currentColor">a</text></svg>';
                    const fallbackAaOpen = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><text x="5" y="16" font-family="OpenDyslexic, Arial, sans-serif" font-weight="700" font-size="13" fill="currentColor">A</text><text x="13" y="16" font-family="OpenDyslexic, Arial, sans-serif" font-weight="400" font-size="13" fill="currentColor">a</text></svg>';
                    if (mode === 1) {
                        return (typeof AguiaIcons !== 'undefined' && AguiaIcons.fontAaSample) ? AguiaIcons.fontAaSample : fallbackAa;
                    } else if (mode === 2) {
                        return (typeof AguiaIcons !== 'undefined' && AguiaIcons.fontAaOpenDyslexic) ? AguiaIcons.fontAaOpenDyslexic : fallbackAaOpen;
                    }
                    return (typeof AguiaIcons !== 'undefined' && AguiaIcons.fontSingleA) ? AguiaIcons.fontSingleA : fallbackSingleA;
                };
                if (textSpan) {
                    switch (fontMode) {
                        case 1: // Fontes Legíveis
                            AGUIA_SCOPE.classList.add('aguia-readable-fonts');
                            textSpan.textContent = 'Fontes Legíveis';
                            if (iconSpan) iconSpan.innerHTML = renderReadableFontsIcon(1);
                            break;
                        case 2: // OpenDyslexic
                            AGUIA_SCOPE.classList.add('aguia-opendyslexic-fonts');
                            textSpan.textContent = 'Fontes Amigável (OpenDyslexic)';
                            fontsBtn.classList.add('opendyslexic');
                            if (iconSpan) iconSpan.innerHTML = renderReadableFontsIcon(2);
                            break;
                    }
                }
            } else {
                // Se o botão não existe, aplicamos apenas as classes ao corpo
                if (fontMode === 1) {
                    AGUIA_SCOPE.classList.add('aguia-readable-fonts');
                } else if (fontMode === 2) {
                    AGUIA_SCOPE.classList.add('aguia-opendyslexic-fonts');
                }
            }
        }
        
        // Aplicar espaçamento com níveis
        const spacingLevel = parseInt(preferences.lineSpacing) || 0;
        if (spacingLevel > 0 && spacingLevel <= 3) {
            lineSpacingLevel = spacingLevel;
            AGUIA_SCOPE.classList.add(`aguia-spacing-level-${lineSpacingLevel}`);
            
            // Atualiza botão se existir
            const spacingBtn = document.getElementById('aguiaLineSpacingBtn');
            if (spacingBtn) {
                spacingBtn.classList.add('active');
                spacingBtn.classList.add(`level-${lineSpacingLevel}`);
                
                // Atualiza o texto do botão para indicar o nível atual
                const textSpan = spacingBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Espaçamento', 'Espaçamento 1', 'Espaçamento 2', 'Espaçamento 3'];
                    textSpan.textContent = levels[lineSpacingLevel];
                }
            }
        } else if (preferences.lineSpacing === true) {
            // Compatibilidade com versões anteriores que usavam booleano
            lineSpacingLevel = 2; // Nível médio
            AGUIA_SCOPE.classList.add('aguia-spacing-level-2');
            AGUIA_SCOPE.classList.add('aguia-increased-spacing'); // Para compatibilidade
            
            // Atualiza botão se existir
            const spacingBtn = document.getElementById('aguiaLineSpacingBtn');
            if (spacingBtn) {
                spacingBtn.classList.add('active');
                spacingBtn.classList.add('level-2');
                
                // Atualiza o texto do botão
                const textSpan = spacingBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Espaçamento entre Linhas 2';
                }
            }
        }
        
        // Aplicar espaçamento entre letras com níveis
        const lsLevel = parseInt(preferences.letterSpacing) || 0;
        if (lsLevel > 0 && lsLevel <= 3) {
            letterSpacingLevel = lsLevel; // atualiza variável global
            AGUIA_SCOPE.classList.add(`aguia-letter-spacing-level-${letterSpacingLevel}`);
            
            // Atualiza botão se existir
            const letterSpacingBtn = document.getElementById('aguiaLetterSpacingBtn');
            if (letterSpacingBtn) {
                letterSpacingBtn.classList.add('active');
                letterSpacingBtn.classList.add(`level-${letterSpacingLevel}`);
                
                // Atualiza o texto do botão para indicar o nível atual
                const textSpan = letterSpacingBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Espaçamento entre Letras', 'Espaçamento entre Letras 1', 'Espaçamento entre Letras 2', 'Espaçamento entre Letras 3'];
                    textSpan.textContent = levels[letterSpacingLevel];
                }
            }
        }
        
        // Aplicar texto para fala
        if (preferences.textToSpeech) {
            textToSpeechEnabled = true;
            addTextToSpeechListeners();
            
            // Atualiza botão se existir
            const ttsBtn = document.getElementById('aguiaTextToSpeechBtn');
            if (ttsBtn) {
                ttsBtn.classList.add('active');
            }
        }
        
        // Aplicar auxiliar de leitura
        if (preferences.readingHelper) {
            readingHelperEnabled = true;
            createReadingHelper();
            
            // Atualiza botão se existir
            const helperBtn = document.getElementById('aguiaReadingHelperBtn');
            if (helperBtn) {
                helperBtn.classList.add('active');
            }
        }
        
        // Aplicar destaque de links
        if (preferences.emphasizeLinks) {
            emphasizeLinksEnabled = true;
            AGUIA_SCOPE.classList.add('aguia-emphasize-links');
            
            // Atualiza botão se existir
            const linksBtn = document.getElementById('aguiaEmphasizeLinksBtn');
            if (linksBtn) {
                linksBtn.classList.add('active');
            }
        }
        
        // Aplicar destaque de cabeçalho
        if (preferences.headerHighlight) {
            headerHighlightEnabled = true;
            AGUIA_SCOPE.classList.add('aguia-highlight-headers');
            
            // Atualiza botão se existir
            const headerBtn = document.getElementById('aguiaHeaderHighlightBtn');
            if (headerBtn) {
                headerBtn.classList.add('active');
            }
        }
        
        // Aplicar ocultação de imagens
        if (preferences.hideImages) {
            hideImagesEnabled = true;
            AGUIA_SCOPE.classList.add('aguia-hide-images');
            
            // Atualiza botão se existir
            const hideImagesBtn = document.getElementById('aguiaHideImagesBtn');
            if (hideImagesBtn) {
                hideImagesBtn.classList.add('active');
            }
        }
        
        

        // Aplicar máscara de leitura (compatibilidade com versões anteriores)
        if (preferences.readingMaskMode && preferences.readingMaskMode > 0) {
            readingMaskMode = preferences.readingMaskMode;
            
            if (readingMaskMode === 1) {
                // Se não houver nível específico definido, use o nível 1
                horizontalMaskLevel = preferences.horizontalMaskLevel || 1;
                verticalMaskLevel = 0;
                
                AGUIA_SCOPE.classList.add('aguia-reading-mask-horizontal');
                AGUIA_SCOPE.classList.add(`aguia-reading-mask-horizontal-level-${horizontalMaskLevel}`);
                AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical');
                
                // Atualiza botão horizontal se existir
                const horizontalMaskBtn = document.getElementById('aguiaHorizontalMaskBtn');
                if (horizontalMaskBtn) {
                    horizontalMaskBtn.classList.add('active');
                    horizontalMaskBtn.classList.add(`level-${horizontalMaskLevel}`);
                    
                    // Atualiza o texto do botão
                    const textSpan = horizontalMaskBtn.querySelector('.text');
                    if (textSpan) {
                        const levels = ['Máscara de Foco Horizontal', 'Máscara H. Pequena', 'Máscara H. Média', 'Máscara H. Grande'];
                        textSpan.textContent = levels[horizontalMaskLevel];
                    }
                }
            } else if (readingMaskMode === 2) {
                // Se não houver nível específico definido, use o nível 1
                verticalMaskLevel = preferences.verticalMaskLevel || 1;
                horizontalMaskLevel = 0;
                
                AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal');
                AGUIA_SCOPE.classList.add('aguia-reading-mask-vertical');
                AGUIA_SCOPE.classList.add(`aguia-reading-mask-vertical-level-${verticalMaskLevel}`);
                
                // Atualiza botão vertical se existir
                const verticalMaskBtn = document.getElementById('aguiaVerticalMaskBtn');
                if (verticalMaskBtn) {
                    verticalMaskBtn.classList.add('active');
                    verticalMaskBtn.classList.add(`level-${verticalMaskLevel}`);
                    
                    // Atualiza o texto do botão
                    const textSpan = verticalMaskBtn.querySelector('.text');
                    if (textSpan) {
                        const levels = ['Máscara de Foco Vertical', 'Máscara V. Pequena', 'Máscara V. Média', 'Máscara V. Grande'];
                        textSpan.textContent = levels[verticalMaskLevel];
                    }
                }
            }
        }
        
        // Aplicar máscara horizontal (nova implementação)
        if (preferences.horizontalMaskLevel && preferences.horizontalMaskLevel > 0) {
            horizontalMaskLevel = preferences.horizontalMaskLevel;
            verticalMaskLevel = 0; // Garante que apenas uma máscara esteja ativa
            readingMaskMode = 1; // Para compatibilidade
            
            AGUIA_SCOPE.classList.add('aguia-reading-mask-horizontal');
            AGUIA_SCOPE.classList.add(`aguia-reading-mask-horizontal-level-${horizontalMaskLevel}`);
            
            // Atualiza botão se existir
            const horizontalMaskBtn = document.getElementById('aguiaHorizontalMaskBtn');
            if (horizontalMaskBtn) {
                horizontalMaskBtn.classList.add('active');
                horizontalMaskBtn.classList.add(`level-${horizontalMaskLevel}`);
                
                // Atualiza o texto do botão
                const textSpan = horizontalMaskBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Máscara de Foco Horizontal', 'Máscara H. Pequena', 'Máscara H. Média', 'Máscara H. Grande'];
                    textSpan.textContent = levels[horizontalMaskLevel];
                }
            }
        }
        
        // Aplicar máscara vertical (nova implementação)
        if (preferences.verticalMaskLevel && preferences.verticalMaskLevel > 0) {
            verticalMaskLevel = preferences.verticalMaskLevel;
            horizontalMaskLevel = 0; // Garante que apenas uma máscara esteja ativa
            readingMaskMode = 2; // Para compatibilidade
            
            AGUIA_SCOPE.classList.add('aguia-reading-mask-vertical');
            AGUIA_SCOPE.classList.add(`aguia-reading-mask-vertical-level-${verticalMaskLevel}`);
            
            // Atualiza botão se existir
            const verticalMaskBtn = document.getElementById('aguiaVerticalMaskBtn');
            if (verticalMaskBtn) {
                verticalMaskBtn.classList.add('active');
                verticalMaskBtn.classList.add(`level-${verticalMaskLevel}`);
                
                // Atualiza o texto do botão
                const textSpan = verticalMaskBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Máscara de Foco Vertical', 'Máscara V. Pequena', 'Máscara V. Média', 'Máscara V. Grande'];
                    textSpan.textContent = levels[verticalMaskLevel];
                }
            }
        }
        
        // Aplicar cursor personalizado (separado da máscara)
        if (preferences.customCursor) {
            customCursorEnabled = true;
            AGUIA_SCOPE.classList.add('aguia-custom-cursor');
            
            // Atualiza botão se existir
            const cursorBtn = document.getElementById('aguiaCustomCursorBtn');
            if (cursorBtn) {
                cursorBtn.classList.add('active');
            }
        }
        
        // Aplicar letras destacadas
        const lettersLevel = parseInt(preferences.highlightedLetters) || 0;
        if (lettersLevel > 0) {
            highlightedLettersLevel = 1; // Sempre usa nível 1
            AGUIA_SCOPE.classList.add('aguia-highlighted-letters');
            AGUIA_SCOPE.classList.add('level-1');
            
            // Atualiza botão se existir
            const lettersBtn = document.getElementById('aguiaHighlightedLettersBtn');
            if (lettersBtn) {
                lettersBtn.classList.add('active');
                
                // Mantém o texto padrão do botão
                const textSpan = lettersBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Letras Destacadas';
                }
            }
            
            // Carrega o CSS necessário
            const linkExists = document.querySelector('link[href*="letras_destaque.css"]');
            if (!linkExists) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = M.cfg.wwwroot + '/local/aguiaplugin/styles/letras_destaque.css';
                document.head.appendChild(link);
            }
        }
        
        // Aplicar modos de daltonismo (suporte a múltiplos modos)
        try {
            const savedModesStr = localStorage.getItem('aguia_colorblind_modes');
            let modes = [];
            if (savedModesStr) {
                modes = JSON.parse(savedModesStr) || [];
            } else if (preferences.colorblind && preferences.colorblind !== 'none') {
                // Compatibilidade legada: usar preferências.colorblind (único)
                modes = [preferences.colorblind];
            }

            // Filtra valores válidos e remove modo removido (achromatopsia)
            const allowed = ['protanopia', 'deuteranopia', 'tritanopia'];
            modes = modes.filter(m => allowed.includes(m));

            if (modes.length > 0) {
                setColorBlindModes(modes);
            } else {
                // Garante UI consistente ("Nenhum")
                const colorblindButton = document.getElementById('aguiaColorblindButton');
                if (colorblindButton) colorblindButton.classList.remove('active');
                document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option').forEach(btn => btn.classList.remove('active'));
                const noneButton = document.querySelector('#aguiaColorblindPanel .aguia-submenu-option[data-value="none"]');
                if (noneButton) noneButton.classList.add('active');
            }
        } catch (e) {
            // Fallback silencioso
        }
    }
    
    // Função para alternar o painel de daltonismo (implementação robusta consolidada)
    function toggleColorblindPanel() {
        const menu = document.getElementById('aguiaMenu');
        const colorblindPanel = document.getElementById('aguiaColorblindPanel');
        if (!colorblindPanel) return;

        // Handler robusto usando document (capturing) para garantir que capturamos Tab/Esc independentemente
        const installHandler = function() {
            if (colorblindPanel._aguiaKeyHandler) return;
            colorblindPanel._aguiaKeyHandler = function(e) {
                // Apenas agir se o painel estiver visível
                if (colorblindPanel.style.display === 'none') return;

                if (e.key === 'Escape' || e.key === 'Esc') {
                    e.preventDefault();
                    toggleColorblindPanel();
                    return;
                }

                if (e.key === 'Tab') {
                    const focusable = colorblindPanel.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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

            // Usar capture para interceptar antes de outros listeners e evitar fuga de foco
            document.addEventListener('keydown', colorblindPanel._aguiaKeyHandler, true);
        };

        const removeHandler = function() {
            if (colorblindPanel._aguiaKeyHandler) {
                document.removeEventListener('keydown', colorblindPanel._aguiaKeyHandler, true);
                colorblindPanel._aguiaKeyHandler = null;
            }
        };

        if (colorblindPanel.style.display === 'none') {
            // Abrir painel
            if (menu) menu.style.display = 'none';
            colorblindPanel.style.display = 'block';

            // Guardar foco anterior e expor como modal para AT
            try { colorblindPanel._aguiaPreviousFocus = document.activeElement; } catch (e) { colorblindPanel._aguiaPreviousFocus = null; }
            try { colorblindPanel.setAttribute('aria-modal', 'true'); } catch (e) {}

            // Foca no primeiro elemento do painel
            const firstOption = colorblindPanel.querySelector('button');
            if (firstOption) {
                firstOption.focus();
            }

            // Instalar handler global para ESC/Tab
            installHandler();
        } else {
            // Fechar painel
            colorblindPanel.style.display = 'none';
            if (menu) menu.style.display = 'block';

            // Foca no botão de daltonismo
            const colorblindButton = document.getElementById('aguiaColorblindButton');
            if (colorblindButton) {
                colorblindButton.focus();
            }

            // Remover aria-modal e handler
            try { colorblindPanel.removeAttribute('aria-modal'); } catch (e) {}
            removeHandler();

            // Restaurar foco anterior se possível
            try {
                if (colorblindPanel._aguiaPreviousFocus && typeof colorblindPanel._aguiaPreviousFocus.focus === 'function') {
                    colorblindPanel._aguiaPreviousFocus.focus();
                }
            } catch (e) {}
        }
    }

    // Função para alternar a máscara de leitura e o cursor personalizado
    // Função antiga mantida por compatibilidade
    function toggleReadingMaskAndCursor(silent = false) {
        // Esta função agora redireciona para a função horizontal por padrão
        toggleHorizontalMask(silent);
    }
    
    // Nova função para alternar níveis da máscara de foco horizontal
    function toggleHorizontalMask(silent = false) {
        // Se a máscara vertical estiver ativa, desativamos ela primeiro
        if (verticalMaskLevel > 0) {
            verticalMaskLevel = 0;
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical');
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-1');
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-2');
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-3');
            const verticalMaskBtn = document.getElementById('aguiaVerticalMaskBtn');
            if (verticalMaskBtn) {
                verticalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
                const textSpan = verticalMaskBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Máscara de Foco Vertical';
                }
            }
        }
        
        // Alterna entre níveis: 0 -> 1 -> 2 -> 3 -> 0
        horizontalMaskLevel = (horizontalMaskLevel + 1) % 4;
        
        // Atualiza o modo de máscara para compatibilidade
        readingMaskMode = horizontalMaskLevel > 0 ? 1 : 0;
        
        const horizontalMaskBtn = document.getElementById('aguiaHorizontalMaskBtn');
        
        // Remove todas as classes de nível
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-1');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-2');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-3');
        
        if (horizontalMaskBtn) {
            horizontalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
        }
        
        // Aplica o nível selecionado
        if (horizontalMaskLevel > 0) {
            AGUIA_SCOPE.classList.add('aguia-reading-mask-horizontal');
            AGUIA_SCOPE.classList.add(`aguia-reading-mask-horizontal-level-${horizontalMaskLevel}`);
            
            const sizes = ['', 'pequena', 'média', 'grande'];
            if (!silent) {
                showStatusMessage(`Máscara horizontal ${sizes[horizontalMaskLevel]} ativada`, 'success');
            }
            
            if (horizontalMaskBtn) {
                horizontalMaskBtn.classList.add('active');
                horizontalMaskBtn.classList.add(`level-${horizontalMaskLevel}`);
                
                // Atualiza o texto do botão
                const textSpan = horizontalMaskBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Máscara de Foco Horizontal', 'Máscara H. Pequena', 'Máscara H. Média', 'Máscara H. Grande'];
                    textSpan.textContent = levels[horizontalMaskLevel];
                }
            }
        } else {
            if (!silent) {
                showStatusMessage('Máscara de foco horizontal desativada');
            }
            if (horizontalMaskBtn) {
                const textSpan = horizontalMaskBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Máscara de Foco Horizontal';
                }
            }
        }
        
        // Salva preferências
        saveUserPreference('horizontalMaskLevel', horizontalMaskLevel);
        saveUserPreference('readingMaskMode', readingMaskMode); // Para compatibilidade
    }
    
    // Nova função para alternar níveis da máscara de foco vertical
    function toggleVerticalMask(silent = false) {
        // Se a máscara horizontal estiver ativa, desativamos ela primeiro
        if (horizontalMaskLevel > 0) {
            horizontalMaskLevel = 0;
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal');
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-1');
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-2');
            AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-3');
            const horizontalMaskBtn = document.getElementById('aguiaHorizontalMaskBtn');
            if (horizontalMaskBtn) {
                horizontalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
                const textSpan = horizontalMaskBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Máscara de Foco Horizontal';
                }
            }
        }
        
        // Alterna entre níveis: 0 -> 1 -> 2 -> 3 -> 0
        verticalMaskLevel = (verticalMaskLevel + 1) % 4;
        
        // Atualiza o modo de máscara para compatibilidade
        readingMaskMode = verticalMaskLevel > 0 ? 2 : 0;
        
        const verticalMaskBtn = document.getElementById('aguiaVerticalMaskBtn');
        
        // Remove todas as classes de nível
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-1');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-2');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-3');
        
        if (verticalMaskBtn) {
            verticalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
        }
        
        // Aplica o nível selecionado
        if (verticalMaskLevel > 0) {
            AGUIA_SCOPE.classList.add('aguia-reading-mask-vertical');
            AGUIA_SCOPE.classList.add(`aguia-reading-mask-vertical-level-${verticalMaskLevel}`);
            
            const sizes = ['', 'pequena', 'média', 'grande'];
            if (!silent) {
                showStatusMessage(`Máscara vertical ${sizes[verticalMaskLevel]} ativada`, 'success');
            }
            
            if (verticalMaskBtn) {
                verticalMaskBtn.classList.add('active');
                verticalMaskBtn.classList.add(`level-${verticalMaskLevel}`);
                
                // Atualiza o texto do botão
                const textSpan = verticalMaskBtn.querySelector('.text');
                if (textSpan) {
                    const levels = ['Máscara de Foco Vertical', 'Máscara V. Pequena', 'Máscara V. Média', 'Máscara V. Grande'];
                    textSpan.textContent = levels[verticalMaskLevel];
                }
            }
        } else {
            if (!silent) {
                showStatusMessage('Máscara de foco vertical desativada');
            }
            if (verticalMaskBtn) {
                const textSpan = verticalMaskBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Máscara de Foco Vertical';
                }
            }
        }
        
        // Salva preferências
        saveUserPreference('verticalMaskLevel', verticalMaskLevel);
        saveUserPreference('readingMaskMode', readingMaskMode); // Para compatibilidade
    }
    
    // Função para criar e configurar a máscara de leitura
    function createReadingMask() {
        // Cria ou obtém o elemento da máscara horizontal
        let maskH = document.getElementById('aguiaReadingMaskH');
        if (!maskH) {
            maskH = document.createElement('div');
            maskH.id = 'aguiaReadingMaskH';
            maskH.className = 'aguia-reading-mask-horizontal-element';
            AGUIA_SCOPE.appendChild(maskH);
        }
        // Cria ou obtém o elemento da máscara vertical
        let maskV = document.getElementById('aguiaReadingMaskV');
        if (!maskV) {
            maskV = document.createElement('div');
            maskV.id = 'aguiaReadingMaskV';
            maskV.className = 'aguia-reading-mask-vertical-element';
            AGUIA_SCOPE.appendChild(maskV);
        }

        document.addEventListener('mousemove', function(e) {
            if (horizontalMaskLevel > 0) {
                // Horizontal - tamanho baseado no nível
                let maskHeight;
                
                switch(horizontalMaskLevel) {
                    case 1: // Pequeno
                        maskHeight = 125;
                        break;
                    case 2: // Médio
                        maskHeight = 175;
                        break;
                    case 3: // Grande
                        maskHeight = 225;
                        break;
                    default:
                        maskHeight = 125;
                }
                
                const y = e.clientY;
                maskH.style.top = (y - maskHeight / 2) + 'px';
                maskH.style.height = maskHeight + 'px';
                maskH.style.display = 'block';
                maskV.style.display = 'none';
            } else if (verticalMaskLevel > 0) {
                // Vertical - tamanho baseado no nível
                let maskWidth;
                
                switch(verticalMaskLevel) {
                    case 1: // Pequeno
                        maskWidth = 125;
                        break;
                    case 2: // Médio
                        maskWidth = 175;
                        break;
                    case 3: // Grande
                        maskWidth = 225;
                        break;
                    default:
                        maskWidth = 125;
                }
                
                const x = e.clientX;
                maskV.style.left = (x - maskWidth / 2) + 'px';
                maskV.style.width = maskWidth + 'px';
                maskV.style.display = 'block';
                maskH.style.display = 'none';
            } else {
                maskH.style.display = 'none';
                maskV.style.display = 'none';
            }
        });
    }
    
    // Função para alternar o cursor personalizado
    function toggleCustomCursor(silent = false) {
        customCursorEnabled = !customCursorEnabled;
        
        if (customCursorEnabled) {
            AGUIA_SCOPE.classList.add('aguia-custom-cursor');
            if (!silent) {
                showStatusMessage('Cursor personalizado ativado', 'success');
            }
        } else {
            AGUIA_SCOPE.classList.remove('aguia-custom-cursor');
            if (!silent) {
                showStatusMessage('Cursor personalizado desativado');
            }
        }
        
        // Atualiza UI
        const customCursorBtn = document.getElementById('aguiaCustomCursorBtn');
        if (customCursorBtn) {
            if (customCursorEnabled) {
                customCursorBtn.classList.add('active');
            } else {
                customCursorBtn.classList.remove('active');
            }
        }
        
        // Salva preferência
        saveUserPreference('customCursor', customCursorEnabled);
    }
    
    // Função para resetar as novas configurações
    function resetReadingMaskAndCursor(silent = false) {
        // Reset dos modos
        readingMaskMode = 0;
        horizontalMaskLevel = 0;
        verticalMaskLevel = 0;
        customCursorEnabled = false;
        
        // Remove todas as classes
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-1');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-2');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-horizontal-level-3');
        
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-1');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-2');
    AGUIA_SCOPE.classList.remove('aguia-reading-mask-vertical-level-3');
        
    AGUIA_SCOPE.classList.remove('aguia-custom-cursor');
        
        // Esconde as máscaras
        const maskH = document.getElementById('aguiaReadingMaskH');
        if (maskH) maskH.style.display = 'none';
        const maskV = document.getElementById('aguiaReadingMaskV');
        if (maskV) maskV.style.display = 'none';
        
        // Atualiza botões
        const horizontalMaskBtn = document.getElementById('aguiaHorizontalMaskBtn');
        if (horizontalMaskBtn) {
            horizontalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            const textSpan = horizontalMaskBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Máscara de Foco Horizontal';
            }
        }
        
        const verticalMaskBtn = document.getElementById('aguiaVerticalMaskBtn');
        if (verticalMaskBtn) {
            verticalMaskBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
            const textSpan = verticalMaskBtn.querySelector('.text');
            if (textSpan) {
                textSpan.textContent = 'Máscara de Foco Vertical';
            }
        }
        
        const cursorBtn = document.getElementById('aguiaCustomCursorBtn');
        if (cursorBtn) cursorBtn.classList.remove('active');
        
        // Salva preferências
        saveUserPreference('readingMaskMode', 0);
        saveUserPreference('horizontalMaskLevel', 0);
        saveUserPreference('verticalMaskLevel', 0);
        saveUserPreference('customCursor', false);
    }    // Cria a máscara de leitura após o carregamento da página
    createReadingMask();
    
    
    
    // Função para alternar letras destacadas
    function toggleHighlightedLetters(silent = false) {
        try {
            // Alterna entre ativado (1) e desativado (0)
            highlightedLettersLevel = highlightedLettersLevel === 0 ? 1 : 0;
            
            // Expõe a variável globalmente para outros arquivos
            window.highlightedLettersLevel = highlightedLettersLevel;
            
            // Remove todas as classes anteriores
            if (AGUIA_SCOPE) {
                AGUIA_SCOPE.classList.remove('aguia-highlighted-letters', 'level-1', 'level-2', 'level-3');
            }
        
            // Atualiza UI
            const highlightedLettersBtn = document.getElementById('aguiaHighlightedLettersBtn');
            if (highlightedLettersBtn) {
                // Remove o estado ativo do botão
                highlightedLettersBtn.classList.remove('active');
                
                // Atualiza o texto do botão
                const textSpan = highlightedLettersBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Letras Destacadas';
                    
                    if (highlightedLettersLevel === 0) {
                        if (!silent) {
                            showStatusMessage('Letras destacadas desativado');
                        }
                    } else {
                        highlightedLettersBtn.classList.add('active');
                        if (!silent) {
                            showStatusMessage('Letras destacadas ativado', 'success');
                        }
                        
                        // Aplica a classe correspondente
                        AGUIA_SCOPE.classList.add('aguia-highlighted-letters');
                        AGUIA_SCOPE.classList.add('level-1');
                    }
                }
            }
            
            // Carrega o CSS necessário
            if (highlightedLettersLevel > 0) {
                const linkExists = document.querySelector('link[href*="letras_destaque.css"]');
                if (!linkExists) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = M.cfg.wwwroot + '/local/aguiaplugin/styles/letras_destaque.css';
                    document.head.appendChild(link);
                }
            }
            
            // Salva a preferência do usuário
            saveUserPreference('highlightedLetters', highlightedLettersLevel);
        } catch (error) {
            console.error('Erro ao alternar letras destacadas:', error);
        }
    }
});
