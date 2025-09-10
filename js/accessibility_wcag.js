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
 * @module     local_aguiaplugin/accessibility_wcag
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

document.addEventListener('DOMContentLoaded', function() {
    // Os estilos CSS agora são carregados pelo PHP
    
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
    let hideImagesEnabled = false; // Nova variável para controlar a ocultação de imagens
    let colorBlindMode = 'none'; // Valores possíveis: none, protanopia, deuteranopia, tritanopia, achromatopsia
    let readingMaskMode = 0; // 0: desativado, 1: horizontal, 2: vertical
    let customCursorEnabled = false; // Nova variável para controlar o cursor personalizado
    let highlightedLettersLevel = 0; // 0: desativado, 1: pequeno, 2: médio, 3: grande
    
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
        img.style.width = '34px';
        img.style.height = '34px';
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
        } else {
            menu.style.display = 'block';
            button.setAttribute('aria-expanded', 'true');
            // Foco no primeiro elemento do menu (WCAG 2.4.3)
            const firstFocusable = menu.querySelector('button, [tabindex="0"]');
            if (firstFocusable) {
                firstFocusable.focus();
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
        
        // Categoria: Conteúdo
        const contentCategory = document.createElement('div');
        contentCategory.className = 'aguia-category';
        
        const contentTitle = document.createElement('h3');
        contentTitle.className = 'aguia-category-title';
        contentTitle.textContent = 'Conteúdo';
        contentCategory.appendChild(contentTitle);
        
        // Grid para as opções da categoria Conteúdo
        const contentGrid = document.createElement('div');
        contentGrid.className = 'aguia-options-grid';
        
        // Opções de conteúdo
        const contentOptions = [
            {
                iconSvg: AguiaIcons.increaseText,
                text: 'Aumentar Texto', 
                action: increaseFontSize,
                ariaLabel: 'Aumentar tamanho do texto',
                id: 'aguiaIncreaseFontBtn'
            },
            { 
                iconSvg: AguiaIcons.readableFont,
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
                iconSvg: AguiaIcons.emphasizeLinks,
                text: 'Destacar Links', 
                action: toggleEmphasizeLinks,
                ariaLabel: 'Ativar ou desativar destaque para links',
                id: 'aguiaEmphasizeLinksBtn'
            },
            { 
                iconSvg: AguiaIcons.highlightedLetters,
                text: 'Letras Destacadas', 
                action: toggleHighlightedLetters,
                ariaLabel: 'Ativar ou desativar destaque para letras',
                id: 'aguiaHighlightedLettersBtn'
            }
        ];
        
        // Adiciona as opções de conteúdo ao grid
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
                iconSvg: AguiaIcons.invertColors, 
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
        colorblindButton.innerHTML = '<span class="icon">🎨</span><span class="text">Daltonismo</span>';
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
            { value: 'none', text: 'Nenhum', icon: '❌' },
            { value: 'protanopia', text: 'Protanopia (sem vermelho)', icon: '🔴' },
            { value: 'deuteranopia', text: 'Deuteranopia (sem verde)', icon: '🟢' },
            { value: 'tritanopia', text: 'Tritanopia (sem azul)', icon: '🔵' },
            { value: 'achromatopsia', text: 'Monocromacia (sem cores)', icon: '⚫' }
        ];
        
        // Adiciona as opções como botões
        const colorblindOptionsContainer = document.createElement('div');
        colorblindOptionsContainer.className = 'aguia-submenu-content';
        
        colorblindOptions.forEach(option => {
            const optionButton = document.createElement('button');
            optionButton.className = 'aguia-submenu-option';
            optionButton.dataset.value = option.value;
            optionButton.innerHTML = `<span class="aguia-icon">${option.icon}</span> ${option.text}`;
            
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
                
                // Fecha o painel após a seleção
                setTimeout(() => {
                    toggleColorblindPanel();
                }, 500);
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
                icon: '�',
                text: 'Máscara de Foco',
                action: toggleReadingMaskAndCursor,
                ariaLabel: 'Alternar entre modos de máscara de leitura',
                id: 'aguiaReadingMaskCursorBtn'
            },
            {
                icon: '🖱️',
                text: 'Cursor Grande',
                action: toggleCustomCursor,
                ariaLabel: 'Ativar ou desativar cursor personalizado',
                id: 'aguiaCustomCursorBtn'
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
        
        // Botão de reset
        const resetButton = document.createElement('button');
        resetButton.className = 'aguia-reset-button';
        resetButton.textContent = 'Resetar Tudo';
        resetButton.setAttribute('aria-label', 'Resetar todas as configurações de acessibilidade');
        resetButton.addEventListener('click', resetAll);
        
        // Créditos
        const credits = document.createElement('div');
        credits.className = 'aguia-credits';
        credits.textContent = 'AGUIA';
        
        footer.appendChild(resetButton);
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
        message.textContent = text;
        message.className = 'aguia-status-message ' + type;
        message.style.display = 'block';
        
        // Oculta a mensagem após 3 segundos
        setTimeout(function() {
            message.style.display = 'none';
        }, 3000);
    }
    
    // Função para aumentar o tamanho da fonte
    function increaseFontSize() {
        if (currentFontSize < 150) {
            currentFontSize += 10;
            setFontSize(currentFontSize);
            const fontSizeLabel = document.getElementById('aguiaFontSizeLabel');
            if (fontSizeLabel) {
                fontSizeLabel.setAttribute('data-value', currentFontSize + '%');
            }
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
        }
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
    function setFontSize(size) {
        // Remove todas as classes anteriores de tamanho de fonte
        document.body.classList.remove(
            'aguia-text-size-100',
            'aguia-text-size-110',
            'aguia-text-size-120',
            'aguia-text-size-130',
            'aguia-text-size-140',
            'aguia-text-size-150'
        );
        
        // Aplica a nova classe de tamanho
        document.body.classList.add('aguia-text-size-' + size);
        
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
        
        // Exibe mensagem
        showStatusMessage('Tamanho do texto ajustado para ' + size + '%', 'success');
        
        // Salva preferência
        saveUserPreference('fontSize', size);
    }
    
    // Função para resetar o tamanho da fonte
    function resetFontSize() {
        setFontSize(100);
        
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
            document.body.classList.remove(
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
                if (iconSpan) iconSpan.innerHTML = AguiaIcons.invertColors;
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
            document.body.classList.add('aguia-high-contrast');
            showStatusMessage('Alto contraste melhorado ativado', 'success');
        } else {
            document.body.classList.remove('aguia-high-contrast');
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
            document.body.classList.remove('aguia-high-contrast');
            
            const contrastBtn = document.getElementById('aguiaHighContrastBtn');
            if (contrastBtn) {
                contrastBtn.classList.remove('active');
            }
        }
        
        // Remove todas as classes de intensidade de cor
        document.body.classList.remove(
            'aguia-color-intensity-low',
            'aguia-color-intensity-high',
            'aguia-color-intensity-gray'
        );
        
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
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.invertColors;
                    showStatusMessage('Intensidade de cores normal');
                    break;
                
                case 1: // Baixa intensidade
                    document.body.classList.add('aguia-color-intensity-low');
                    intensityBtn.classList.add('active', 'level-1');
                    if (textSpan) textSpan.textContent = 'Baixa Intensidade';
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensityLow;
                    showStatusMessage('Modo de baixa intensidade de cores ativado', 'success');
                    break;
                
                case 2: // Alta intensidade
                    document.body.classList.add('aguia-color-intensity-high');
                    intensityBtn.classList.add('active', 'level-2');
                    if (textSpan) textSpan.textContent = 'Alta Intensidade';
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensityHigh;
                    showStatusMessage('Modo de alta intensidade de cores ativado', 'success');
                    break;
                
                case 3: // Escala de cinza
                    document.body.classList.add('aguia-color-intensity-gray');
                    intensityBtn.classList.add('active', 'level-3');
                    if (textSpan) textSpan.textContent = 'Escala de Cinza';
                    if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensityGray;
                    showStatusMessage('Modo de escala de cinza ativado', 'success');
                    break;
            }
        }
        
        // Salva preferência
        saveUserPreference('colorIntensityMode', colorIntensityMode);
    }
    
    // Função para resetar configurações de contraste
    function resetContrast() {
        // Reset de alto contraste
        if (highContrastEnabled) {
            highContrastEnabled = false;
            document.body.classList.remove('aguia-high-contrast');
            
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
            document.body.classList.remove(
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
                if (iconSpan) iconSpan.innerHTML = AguiaIcons.invertColors;
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
            document.documentElement.classList.remove(
                'aguia-colorblind-protanopia',
                'aguia-colorblind-deuteranopia',
                'aguia-colorblind-tritanopia',
                'aguia-colorblind-achromatopsia'
            );
            
            colorBlindMode = 'none';
            saveUserPreference('colorblind', 'none');
        }
        
        showStatusMessage('Configurações de contraste resetadas');
        
        // Salva preferências
        saveUserPreference('highContrast', false);
        saveUserPreference('invertedColors', false);
    }
    
    // Função para configurar modo de daltonismo (WCAG 1.4.8)
    // Função para lidar com múltiplos modos de daltonismo
    function setColorBlindModes(modes) {
        // Remove classes anteriores
        document.documentElement.classList.remove(
            'aguia-colorblind-protanopia',
            'aguia-colorblind-deuteranopia',
            'aguia-colorblind-tritanopia',
            'aguia-colorblind-achromatopsia'
        );
        
        // Atualiza a variável - mantemos compatibilidade com código legado usando o primeiro modo
        colorBlindMode = modes.length > 0 ? modes[0] : 'none';
        
        // Atualiza a UI para mostrar qual opção está ativa
        const colorblindButton = document.getElementById('aguiaColorblindButton');
        
        if (modes.length > 0) {
            // Aplicar os filtros ao elemento html em vez de body
            // para evitar problemas com o botão de acessibilidade
            const htmlElement = document.documentElement;
            
            // Aplica todos os modos selecionados
            modes.forEach(mode => {
                htmlElement.classList.add('aguia-colorblind-' + mode);
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
                    case 'achromatopsia': return 'Monocromacia (sem cores)';
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
            if (textSpan) {
                switch (fontMode) {
                    case 0: // Padrão
                        textSpan.textContent = 'Fontes Legíveis';
                        break;
                    case 1: // Fontes Legíveis
                        textSpan.textContent = 'Fontes Legíveis';
                        fontsBtn.classList.add('active');
                        break;
                    case 2: // OpenDyslexic
                        textSpan.textContent = 'Fontes Amigável (OpenDyslexic)';
                        fontsBtn.classList.add('active', 'opendyslexic');
                        break;
                }
            }
        }
        
        // Remover todas as classes de fonte
        document.body.classList.remove('aguia-readable-fonts', 'aguia-opendyslexic-fonts');
        
        // Aplicar classe correta de acordo com o modo
        switch (fontMode) {
            case 0: // Padrão
                showStatusMessage('Fontes padrão ativadas');
                readableFontsEnabled = false;
                break;
            case 1: // Fontes Legíveis
                document.body.classList.add('aguia-readable-fonts');
                showStatusMessage('Fontes legíveis ativadas', 'success');
                readableFontsEnabled = true;
                break;
            case 2: // OpenDyslexic
                document.body.classList.add('aguia-opendyslexic-fonts');
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
        document.body.classList.remove('aguia-line-spacing-level-1', 'aguia-line-spacing-level-2', 'aguia-line-spacing-level-3');
        
        // Para compatibilidade com versões anteriores
        if (document.body.classList.contains('aguia-spacing-level-1') || 
            document.body.classList.contains('aguia-spacing-level-2') || 
            document.body.classList.contains('aguia-spacing-level-3')) {
            document.body.classList.remove('aguia-spacing-level-1', 'aguia-spacing-level-2', 'aguia-spacing-level-3', 'aguia-increased-spacing');
        }
        
        // Aplica a classe apropriada baseada no nível
        if (lineSpacingLevel > 0) {
            document.body.classList.add(`aguia-line-spacing-level-${lineSpacingLevel}`);
            
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
        document.body.classList.remove('aguia-letter-spacing-level-1', 'aguia-letter-spacing-level-2', 'aguia-letter-spacing-level-3');
        
        // Aplica a classe apropriada baseada no nível
        if (letterSpacingLevel > 0) {
            document.body.classList.add(`aguia-letter-spacing-level-${letterSpacingLevel}`);
            
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
    function toggleTextToSpeech() {
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
            showStatusMessage('Texto para fala ativado', 'success');
        } else {
            // Remove listeners
            removeTextToSpeechListeners();
            showStatusMessage('Texto para fala desativado');
            
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
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th, a, button, label');
        
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
        const elements = document.querySelectorAll('[data-aguia-tts="true"]');
        
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
    function toggleReadingHelper() {
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
            showStatusMessage('Guia de leitura ativado', 'success');
        } else {
            const helper = document.getElementById('aguiaReadingHelper');
            if (helper) {
                helper.remove();
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
        
        if (element && element.textContent && element !== helper) {
            const rect = element.getBoundingClientRect();
            helper.style.width = rect.width + 'px';
            helper.style.top = (window.scrollY + rect.top) + 'px';
            helper.style.left = rect.left + 'px';
            helper.style.display = 'block';
        } else {
            helper.style.display = 'none';
        }
    }
    
    // Destacar links (WCAG 1.4.1)
    function toggleEmphasizeLinks() {
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
            document.body.classList.add('aguia-emphasize-links');
            showStatusMessage('Links destacados ativados', 'success');
        } else {
            document.body.classList.remove('aguia-emphasize-links');
            showStatusMessage('Links destacados desativados');
        }
        
        // Salva preferência
        saveUserPreference('emphasizeLinks', emphasizeLinksEnabled);
    }
    
    // Função para ocultar todas as imagens (WCAG 1.1.1)
    function toggleHideImages() {
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
            document.body.classList.add('aguia-hide-images');
            showStatusMessage('Ocultação de imagens ativada', 'success');
        } else {
            document.body.classList.remove('aguia-hide-images');
            showStatusMessage('Ocultação de imagens desativada');
        }
        
        // Salva preferência
        saveUserPreference('hideImages', hideImagesEnabled);
    }
    
    // Função para resetar todas as configurações
    function resetAll() {
        // Reset de tamanho de fonte
        resetFontSize();
        
        // Reset de contraste
        if (highContrastEnabled || invertedColorsEnabled) {
            resetContrast();
        }
        
        // Reset de ocultação de imagens
        if (hideImagesEnabled) {
            hideImagesEnabled = false;
            document.body.classList.remove('aguia-hide-images');
            
            const hideImagesBtn = document.getElementById('aguiaHideImagesBtn');
            if (hideImagesBtn) {
                hideImagesBtn.classList.remove('active');
            }
            
            // Salva preferência
            saveUserPreference('hideImages', false);
        }
        
        // Reset da máscara de leitura e do cursor personalizado
        if (readingMaskMode > 0 || customCursorEnabled) {
            resetReadingMaskAndCursor();
        }
        
        // Reset de fontes legíveis e OpenDyslexic
        if (fontMode !== 0) {
            // Remover todas as classes de fonte
            document.body.classList.remove('aguia-readable-fonts', 'aguia-opendyslexic-fonts');
            
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
        }
        
        // Reset de espaçamento entre linhas
        if (lineSpacingLevel > 0) {
            // Reseta para zero
            document.body.classList.remove('aguia-line-spacing-level-1', 'aguia-line-spacing-level-2', 'aguia-line-spacing-level-3');
            document.body.classList.remove('aguia-spacing-level-1', 'aguia-spacing-level-2', 'aguia-spacing-level-3'); // Para compatibilidade
            document.body.classList.remove('aguia-increased-spacing'); // Para compatibilidade
            
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
        }
        
        // Reset de espaçamento entre letras
        if (letterSpacingLevel > 0) {
            // Reseta para zero
            document.body.classList.remove('aguia-letter-spacing-level-1', 'aguia-letter-spacing-level-2', 'aguia-letter-spacing-level-3');
            
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
        }
        
        // Reset de texto para fala
        if (textToSpeechEnabled) {
            toggleTextToSpeech();
        }
        
        // Reset de auxiliar de leitura
        if (readingHelperEnabled) {
            toggleReadingHelper();
        }
        
        // Reset de destaque de links
        if (emphasizeLinksEnabled) {
            toggleEmphasizeLinks();
        }
        
        // Reset de letras destacadas
        if (highlightedLettersLevel > 0) {
            // Remove todas as classes
            document.body.classList.remove('aguia-highlighted-letters', 'level-1', 'level-2', 'level-3');
            
            // Reset do botão
            const lettersBtn = document.getElementById('aguiaHighlightedLettersBtn');
            if (lettersBtn) {
                lettersBtn.classList.remove('active', 'level-1', 'level-2', 'level-3');
                
                // Restaura o texto original
                const textSpan = lettersBtn.querySelector('.text');
                if (textSpan) {
                    textSpan.textContent = 'Letras Destacadas';
                }
            }
            
            // Reset da variável
            highlightedLettersLevel = 0;
            
            // Salva a preferência
            saveUserPreference('highlightedLetters', 0);
        }
        
        // Reset de modo daltonismo - agora com suporte a múltiplos modos
        // Verifica se há algum modo ativo verificando classes no HTML ou o valor da variável
        const htmlElement = document.documentElement;
        const hasColorblindClass = 
            htmlElement.classList.contains('aguia-colorblind-protanopia') ||
            htmlElement.classList.contains('aguia-colorblind-deuteranopia') ||
            htmlElement.classList.contains('aguia-colorblind-tritanopia') ||
            htmlElement.classList.contains('aguia-colorblind-achromatopsia');
            
        if (colorBlindMode !== 'none' || hasColorblindClass) {
            // Reseta para nenhum filtro de daltonismo
            setColorBlindModes([]);
            
            // Atualiza a UI no painel de daltonismo
            document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.value === 'none') {
                    btn.classList.add('active');
                }
            });
        }
        
        // Reset do VLibras se estiver ativo
        if (typeof vLibrasEnabled !== 'undefined' && vLibrasEnabled) {
            if (typeof disableVLibras === 'function') {
                disableVLibras();
            }
            
            // Atualiza o botão se existir
            const vLibrasBtn = document.getElementById('aguia-vlibras-button');
            if (vLibrasBtn) {
                vLibrasBtn.classList.remove('active');
            }
        }
        
        showStatusMessage('Todas as configurações foram resetadas', 'success');
    }
    
    // Função para salvar preferências do usuário
    function saveUserPreference(preference, value) {
        // Se o usuário estiver logado no Moodle, salva via AJAX
        if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
            // Usando o webservice para salvar preferências
            const data = {
                preference: preference,
                value: value
            };
            
            fetch(M.cfg.wwwroot + '/local/aguiaplugin/save_preference.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Moodle-Sesskey': M.cfg.sesskey
                },
                body: JSON.stringify(data)
            })
            .catch(function(error) {
                console.error('Erro ao salvar preferência:', error);
            });
        } else {
            // Fallback para localStorage quando não estiver logado
            localStorage.setItem('aguia_' + preference, JSON.stringify(value));
        }
    }
    
    // Função para carregar preferências do usuário
    function loadUserPreferences() {
        // Primeiro tenta carregar do Moodle para usuários logados
        if (typeof M !== 'undefined' && M.cfg && M.cfg.sesskey) {
            fetch(M.cfg.wwwroot + '/local/aguiaplugin/get_preferences.php', {
                method: 'GET',
                headers: {
                    'X-Moodle-Sesskey': M.cfg.sesskey
                }
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
    
    // Função para carregar preferências do localStorage
    function loadFromLocalStorage() {
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
            colorblind: getFromLocalStorage('colorblind', 'none'),
            readingMaskMode: getFromLocalStorage('readingMaskMode', 0),
            customCursor: getFromLocalStorage('customCursor', false)
        };
        
        // Compatibilidade com versões anteriores
        if (getFromLocalStorage('invertedColors', false) === true) {
            preferences.colorIntensityMode = 3; // Escala de cinza é o mais próximo das cores invertidas
        }
        
        applyUserPreferences(preferences);
    }
    
    // Função auxiliar para obter valores do localStorage
    function getFromLocalStorage(key, defaultValue) {
        const stored = localStorage.getItem('aguia_' + key);
        return stored ? JSON.parse(stored) : defaultValue;
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
            document.body.classList.add('aguia-high-contrast');
            
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
                    document.body.classList.add('aguia-color-intensity-low');
                    if (intensityBtn) {
                        intensityBtn.classList.add('active', 'level-1');
                        const textSpan = intensityBtn.querySelector('.text');
                        const iconSpan = intensityBtn.querySelector('.icon');
                        if (textSpan) textSpan.textContent = 'Baixa Intensidade';
                        if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensityLow;
                    }
                    break;
                
                case 2: // Alta intensidade
                    document.body.classList.add('aguia-color-intensity-high');
                    if (intensityBtn) {
                        intensityBtn.classList.add('active', 'level-2');
                        const textSpan = intensityBtn.querySelector('.text');
                        const iconSpan = intensityBtn.querySelector('.icon');
                        if (textSpan) textSpan.textContent = 'Alta Intensidade';
                        if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensityHigh;
                    }
                    break;
                
                case 3: // Escala de cinza
                    document.body.classList.add('aguia-color-intensity-gray');
                    if (intensityBtn) {
                        intensityBtn.classList.add('active', 'level-3');
                        const textSpan = intensityBtn.querySelector('.text');
                        const iconSpan = intensityBtn.querySelector('.icon');
                        if (textSpan) textSpan.textContent = 'Escala de Cinza';
                        if (iconSpan) iconSpan.innerHTML = AguiaIcons.colorIntensityGray;
                    }
                    break;
            }
        }
        
        // Aplicar fontes legíveis ou OpenDyslexic
        fontMode = parseInt(preferences.fontMode) || 0;
        if (fontMode > 0) {
            readableFontsEnabled = true;
            
            // Atualiza botão se existir
            const fontsBtn = document.getElementById('aguiaReadableFontsBtn');
            if (fontsBtn) {
                fontsBtn.classList.add('active');
                
                // Atualiza texto e classe de acordo com o modo
                const textSpan = fontsBtn.querySelector('.text');
                if (textSpan) {
                    switch (fontMode) {
                        case 1: // Fontes Legíveis
                            document.body.classList.add('aguia-readable-fonts');
                            textSpan.textContent = 'Fontes Legíveis';
                            break;
                        case 2: // OpenDyslexic
                            document.body.classList.add('aguia-opendyslexic-fonts');
                            textSpan.textContent = 'Fontes Amigável (OpenDyslexic)';
                            fontsBtn.classList.add('opendyslexic');
                            break;
                    }
                }
            } else {
                // Se o botão não existe, aplicamos apenas as classes ao corpo
                if (fontMode === 1) {
                    document.body.classList.add('aguia-readable-fonts');
                } else if (fontMode === 2) {
                    document.body.classList.add('aguia-opendyslexic-fonts');
                }
            }
        }
        
        // Aplicar espaçamento com níveis
        const spacingLevel = parseInt(preferences.lineSpacing) || 0;
        if (spacingLevel > 0 && spacingLevel <= 3) {
            lineSpacingLevel = spacingLevel;
            document.body.classList.add(`aguia-spacing-level-${lineSpacingLevel}`);
            
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
            document.body.classList.add('aguia-spacing-level-2');
            document.body.classList.add('aguia-increased-spacing'); // Para compatibilidade
            
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
        const letterSpacingLevel = parseInt(preferences.letterSpacing) || 0;
        if (letterSpacingLevel > 0 && letterSpacingLevel <= 3) {
            letterSpacingLevel = letterSpacingLevel;
            document.body.classList.add(`aguia-letter-spacing-level-${letterSpacingLevel}`);
            
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
            document.body.classList.add('aguia-emphasize-links');
            
            // Atualiza botão se existir
            const linksBtn = document.getElementById('aguiaEmphasizeLinksBtn');
            if (linksBtn) {
                linksBtn.classList.add('active');
            }
        }
        
        // Aplicar ocultação de imagens
        if (preferences.hideImages) {
            hideImagesEnabled = true;
            document.body.classList.add('aguia-hide-images');
            
            // Atualiza botão se existir
            const hideImagesBtn = document.getElementById('aguiaHideImagesBtn');
            if (hideImagesBtn) {
                hideImagesBtn.classList.add('active');
            }
        }
        
        // Aplicar VLibras se estiver habilitado nas preferências
        if (preferences.vlibras) {
            // Inicializa o VLibras se estiver disponível
            if (typeof initializeVLibras === 'function') {
                initializeVLibras();
            }
        }

        // Aplicar máscara de leitura
        if (preferences.readingMaskMode && preferences.readingMaskMode > 0) {
            readingMaskMode = preferences.readingMaskMode;
            
            if (readingMaskMode === 1) {
                document.body.classList.add('aguia-reading-mask-horizontal');
                document.body.classList.remove('aguia-reading-mask-vertical');
            } else if (readingMaskMode === 2) {
                document.body.classList.remove('aguia-reading-mask-horizontal');
                document.body.classList.add('aguia-reading-mask-vertical');
            }
            
            // Atualiza botão se existir
            const maskBtn = document.getElementById('aguiaReadingMaskCursorBtn');
            if (maskBtn) {
                maskBtn.classList.add('active');
            }
        }
        
        // Aplicar cursor personalizado (separado da máscara)
        if (preferences.customCursor) {
            customCursorEnabled = true;
            document.body.classList.add('aguia-custom-cursor');
            
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
            document.body.classList.add('aguia-highlighted-letters');
            document.body.classList.add('level-1');
            
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
            const linkExists = document.querySelector('link[href*="highlighted_letters.css"]');
            if (!linkExists) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = M.cfg.wwwroot + '/local/aguiaplugin/styles/highlighted_letters.css';
                document.head.appendChild(link);
            }
        }
        
        // Aplicar modo de daltonismo
        if (preferences.colorblind && preferences.colorblind !== 'none') {
            colorBlindMode = preferences.colorblind;
            document.documentElement.classList.add('aguia-colorblind-' + colorBlindMode);
            
            // Atualiza o botão de daltonismo
            const colorblindButton = document.getElementById('aguiaColorblindButton');
            if (colorblindButton) {
                colorblindButton.classList.add('active');
            }
            
            // Atualiza os botões do painel de daltonismo
            document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option').forEach(btn => {
                if (btn.dataset.value === colorBlindMode) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }
    
    // Função para alternar o painel de daltonismo
    function toggleColorblindPanel() {
        const menu = document.getElementById('aguiaMenu');
        const colorblindPanel = document.getElementById('aguiaColorblindPanel');
        
        if (colorblindPanel.style.display === 'none') {
            // Anima a transição do menu principal para o painel de daltonismo
            menu.style.display = 'none';
            colorblindPanel.style.display = 'block';
            
            // Foca no primeiro elemento do painel
            const firstOption = colorblindPanel.querySelector('button');
            if (firstOption) {
                firstOption.focus();
            }
        } else {
            // Anima a transição do painel de daltonismo para o menu principal
            colorblindPanel.style.display = 'none';
            menu.style.display = 'block';
            
            // Foca no botão de daltonismo
            const colorblindButton = document.getElementById('aguiaColorblindButton');
            if (colorblindButton) {
                colorblindButton.focus();
            }
        }
    }

    // Função para alternar a máscara de leitura e o cursor personalizado
    function toggleReadingMaskAndCursor() {
        // Alterna entre os modos: 0 (desativado), 1 (horizontal), 2 (vertical)
        readingMaskMode = (readingMaskMode + 1) % 3;
        
        // Cursor personalizado é mantido independente (não se altera ao mudar a máscara)
        // A linha abaixo foi removida: customCursorEnabled = readingMaskMode !== 0;

        const maskCursorBtn = document.getElementById('aguiaReadingMaskCursorBtn');
        if (readingMaskMode === 0) {
            document.body.classList.remove('aguia-reading-mask-horizontal');
            document.body.classList.remove('aguia-reading-mask-vertical');
            showStatusMessage('Máscara de leitura desativada');
            if (maskCursorBtn) maskCursorBtn.classList.remove('active');
        } else if (readingMaskMode === 1) {
            document.body.classList.add('aguia-reading-mask-horizontal');
            document.body.classList.remove('aguia-reading-mask-vertical');
            showStatusMessage('Modo de máscara: Foco horizontal', 'success');
            if (maskCursorBtn) maskCursorBtn.classList.add('active');
        } else if (readingMaskMode === 2) {
            document.body.classList.remove('aguia-reading-mask-horizontal');
            document.body.classList.add('aguia-reading-mask-vertical');
            showStatusMessage('Modo de máscara: Foco vertical', 'success');
            if (maskCursorBtn) maskCursorBtn.classList.add('active');
        }

        // Salva preferências
        saveUserPreference('readingMaskMode', readingMaskMode);
        saveUserPreference('customCursor', customCursorEnabled);
    }
    
    // Função para criar e configurar a máscara de leitura
    function createReadingMask() {
        // Cria ou obtém o elemento da máscara horizontal
        let maskH = document.getElementById('aguiaReadingMaskH');
        if (!maskH) {
            maskH = document.createElement('div');
            maskH.id = 'aguiaReadingMaskH';
            maskH.className = 'aguia-reading-mask-horizontal-element';
            document.body.appendChild(maskH);
        }
        // Cria ou obtém o elemento da máscara vertical
        let maskV = document.getElementById('aguiaReadingMaskV');
        if (!maskV) {
            maskV = document.createElement('div');
            maskV.id = 'aguiaReadingMaskV';
            maskV.className = 'aguia-reading-mask-vertical-element';
            document.body.appendChild(maskV);
        }

        document.addEventListener('mousemove', function(e) {
            if (readingMaskMode === 1) {
                // Horizontal
                const maskHeight = 100;
                const y = e.clientY;
                maskH.style.top = (y - maskHeight / 2) + 'px';
                maskH.style.height = maskHeight + 'px';
                maskH.style.display = 'block';
                maskV.style.display = 'none';
            } else if (readingMaskMode === 2) {
                // Vertical
                const maskWidth = 100;
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
    function toggleCustomCursor() {
        customCursorEnabled = !customCursorEnabled;
        
        if (customCursorEnabled) {
            document.body.classList.add('aguia-custom-cursor');
            showStatusMessage('Cursor personalizado ativado', 'success');
        } else {
            document.body.classList.remove('aguia-custom-cursor');
            showStatusMessage('Cursor personalizado desativado');
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
    function resetReadingMaskAndCursor() {
        // Reset dos modos
        readingMaskMode = 0;
        customCursorEnabled = false;
        document.body.classList.remove('aguia-reading-mask-horizontal');
        document.body.classList.remove('aguia-reading-mask-vertical');
        document.body.classList.remove('aguia-custom-cursor');
        // Esconde as máscaras
        const maskH = document.getElementById('aguiaReadingMaskH');
        if (maskH) maskH.style.display = 'none';
        const maskV = document.getElementById('aguiaReadingMaskV');
        if (maskV) maskV.style.display = 'none';
        // Atualiza botões
        const maskBtn = document.getElementById('aguiaReadingMaskCursorBtn');
        if (maskBtn) maskBtn.classList.remove('active');
        const cursorBtn = document.getElementById('aguiaCustomCursorBtn');
        if (cursorBtn) cursorBtn.classList.remove('active');
        // Salva preferências
        saveUserPreference('readingMaskMode', 0);
        saveUserPreference('customCursor', false);
    }    // Cria a máscara de leitura após o carregamento da página
    createReadingMask();
    
    // Função para o botão VLibras (mantido apenas o botão, sem funcionalidade)
    function toggleVLibras() {
        const button = document.getElementById('aguia-vlibras-button');
        if (button) {
            // Alterna apenas o estado visual do botão
            button.classList.toggle('active');
            
            // Mostra mensagem indicando que a funcionalidade foi removida
            showStatusMessage('Funcionalidade VLibras não está disponível', 'info');
            
            // Após 3 segundos, remove o estado ativo do botão
            setTimeout(function() {
                button.classList.remove('active');
            }, 3000);
        }
    }
    
    // Função para alternar letras destacadas
    function toggleHighlightedLetters() {
        try {
            // Alterna entre ativado (1) e desativado (0)
            highlightedLettersLevel = highlightedLettersLevel === 0 ? 1 : 0;
            
            // Expõe a variável globalmente para outros arquivos
            window.highlightedLettersLevel = highlightedLettersLevel;
            
            // Remove todas as classes anteriores
            if (document && document.body) {
                document.body.classList.remove('aguia-highlighted-letters', 'level-1', 'level-2', 'level-3');
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
                        showStatusMessage('Letras destacadas desativado');
                    } else {
                        highlightedLettersBtn.classList.add('active');
                        showStatusMessage('Letras destacadas ativado', 'success');
                        
                        // Aplica a classe correspondente
                        document.body.classList.add('aguia-highlighted-letters');
                        document.body.classList.add('level-1');
                    }
                }
            }
            
            // Carrega o CSS necessário
            if (highlightedLettersLevel > 0) {
                const linkExists = document.querySelector('link[href*="highlighted_letters.css"]');
                if (!linkExists) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = M.cfg.wwwroot + '/local/aguiaplugin/styles/highlighted_letters.css';
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
