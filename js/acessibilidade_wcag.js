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

// Tentativa antecipada: registrar um atalho imediatamente quando o script for carregado.
// Isso ajuda quando o código principal (dentro de DOMContentLoaded) não chega a ser executado
(function registerAguiaShortcutEarly() {
    try {
        if (window.__aguia_shortcut_installed) return;
        // Handler reutilizável para múltiplos targets
        const __aguia_shortcut_handler = function(e) {
            try {
                const key = (e.key || '').toLowerCase();
                if (!key) return;
                const isA = key === 'a';
                const isM = key === 'm';
                if (!isA && !isM) return;
                // Apenas Alt+Shift+A
                const combos = (isA && e.altKey && e.shiftKey);
                if (!combos) return;

                // Evitar quando em campos editáveis
                const active = document.activeElement;
                if (active) {
                    const tag = (active.tagName || '').toLowerCase();
                    const role = (active.getAttribute && active.getAttribute('role')) || '';
                    if (tag === 'input' || tag === 'textarea' || tag === 'select' || role.toLowerCase() === 'textbox') return;
                    let node = active;
                    while (node) { try { if (node.isContentEditable) return; } catch (e) {} node = node.parentElement; }
                }

                // Tenta abrir o menu clicando no botão AGUIA quando disponível
                try {
                    const b = document.getElementById('aguiaButton');
                    if (b && typeof b.click === 'function') {
                        e.preventDefault(); e.stopPropagation();
                        b.click();
                        return;
                    }
                } catch (ex) {}
            } catch (ex) {}
        };

        // Registrar em diversos alvos para maximizar cobertura
        try { document.addEventListener('keydown', __aguia_shortcut_handler, true); } catch (e) {}
        try { window.addEventListener('keydown', __aguia_shortcut_handler, true); } catch (e) {}
        try { if (document && document.body) document.body.addEventListener('keydown', __aguia_shortcut_handler, true); } catch (e) {}
        try {
            if (window.top && window.top !== window && window.top.document) {
                try { window.top.document.addEventListener('keydown', __aguia_shortcut_handler, true); } catch (e) {}
            }
        } catch (e) {}

        window.__aguia_shortcut_installed = true;
    } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', function() {
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
    let reduceAnimationsEnabled = false; // Nova preferência: reduzir animações do plugin e do site
    let imageInterpreterEnabled = false; // Nova funcionalidade: interpretar imagens via Gemini
    // Estado de leitura do menu: controla toggle/cancelamento e timeouts/utter atual
    let menuReadingActive = false;
    let menuSpeechTimeout = null;
    let menuSpeechUtter = null;
    let menuHighlightedEl = null;
    // Identificador para a execução atual de leitura — usado para invalidar callbacks antigos
    let menuSpeechRunId = 0;
    // Mapa de descrições para cada funcionalidade do menu.
    // Chaves preferenciais: id do botão quando disponível, caso contrário o texto exibido.
    const AGUIA_FEATURE_DESCRIPTIONS = {
        'aguiaIncreaseFontBtn': 'Aumenta o tamanho do texto na página para facilitar a leitura.',
        'Aumentar Texto': 'Aumenta o tamanho do texto na página para facilitar a leitura.',
        'aguiaReadableFontsBtn': 'Alterna para fontes mais legíveis, incluindo opção OpenDyslexic.',
        'Fontes Legíveis': 'Alterna para fontes mais legíveis, incluindo opção OpenDyslexic.',
        'Espaçamento entre Linhas': 'Ajusta o espaçamento entre as linhas para melhorar a legibilidade.',
        'Espaçamento entre Letras': 'Altera o espaçamento entre letras para facilitar a leitura de palavras.',
        'Daltonismo': 'Abre um painel com filtros para pessoas com diferentes tipos de daltonismo.',
        'Nenhum': 'Desativa filtros de daltonismo, exibindo as cores originais.',
        'Protanopia (sem vermelho)': 'Aplicará um filtro que reduz tons vermelhos para simular protanopia.',
        'Deuteranopia (sem verde)': 'Aplicará um filtro que reduz tons verdes para simular deuteranopia.',
        'Tritanopia (sem azul)': 'Aplicará um filtro que reduz tons azuis para simular tritanopia.',
        'Intensidade de Cores': 'Altera a intensidade das cores em três níveis para contraste.',
        'Inverter cores': 'Inverte as cores da página para melhorar contraste quando necessário.',
        'Lupa de conteúdo': 'Ativa uma lupa que amplia a área sob o cursor para leitura localizada.',
        'Leitura de texto': 'Lê o texto selecionado ou o elemento focalizado em voz alta.',
        'Auxiliar de leitura': 'Realça a linha de leitura para ajudar a seguir o texto com o cursor.',
        'Destaque para links': 'Realça visualmente os links para facilitar a identificação.',
        'Foco visível': 'Destaca elementos com foco para navegação por teclado.',
        'Ocultar imagens': 'Oculta imagens para reduzir distrações visuais.',
        'Máscara de foco': 'Aplica uma máscara que enfatiza a área de leitura atual.',
        'Cursor personalizado': 'Substitui o cursor por uma versão maior e mais visível.',
        'Resetar configurações': 'Restaura as configurações do AGUIA para os valores padrão.',
        'Interpretação de imagens': 'Gera uma descrição textual da imagem para auxiliar usuários com deficiência visual.'
    };

    // Função que recolhe o texto e descrições das funcionalidades do menu
    function gatherMenuDescriptions(menuElement) {
        const items = [];
        if (!menuElement) return items;
        // Título
        const titleEl = menuElement.querySelector('#aguiaMenuTitle');
        if (titleEl && titleEl.textContent) {
            items.push({ text: 'Menu de Acessibilidade.', el: titleEl });
        }

        // Categorias e opções principais
        const categoryTitles = menuElement.querySelectorAll('.aguia-category-title');
        categoryTitles.forEach(cat => {
            if (cat.textContent) items.push({ text: cat.textContent + '.', el: cat });
            // dentro da categoria, procure por botões .aguia-option
            const parent = cat.parentElement || menuElement;
            const optionButtons = parent.querySelectorAll('.aguia-option');
            optionButtons.forEach(btn => {
                // extrair texto visível (span.text) quando presente
                const textSpan = btn.querySelector('.text');
                const btnText = (textSpan && textSpan.textContent) ? textSpan.textContent.trim() : (btn.textContent || '').trim();
                const id = btn.id || (btn.dataset && btn.dataset.value) || btnText;
                const desc = AGUIA_FEATURE_DESCRIPTIONS[id] || AGUIA_FEATURE_DESCRIPTIONS[btnText] || '';
                if (btnText) {
                    const full = desc ? (btnText + ': ' + desc) : (btnText + '.');
                    items.push({ text: full, el: btn });
                }
                // se o botão abrir submenu (ex.: daltonismo), inclua itens do submenu
                if (btn.id === 'aguiaColorblindButton' || btnText.toLowerCase().indexOf('dalton') !== -1) {
                    const sub = menuElement.querySelector('#aguiaColorblindPanel');
                    if (sub) {
                        const subTitle = sub.querySelector('.aguia-submenu-header h3');
                        if (subTitle && subTitle.textContent) items.push({ text: subTitle.textContent + '.', el: subTitle });
                        const subOptions = sub.querySelectorAll('.aguia-submenu-option');
                        subOptions.forEach(sop => {
                            const st = (sop.textContent || '').trim();
                            const sd = AGUIA_FEATURE_DESCRIPTIONS[sop.dataset.value] || AGUIA_FEATURE_DESCRIPTIONS[st] || '';
                            if (st) {
                                const fulls = sd ? (st + ': ' + sd) : (st + '.');
                                items.push({ text: fulls, el: sop });
                            }
                        });
                    }
                }
            });
        });

        // Captura outras opções soltas que estejam na raiz do menu
        const rootOptions = menuElement.querySelectorAll('.aguia-options-grid .aguia-option, .aguia-menu-content > .aguia-option');
        rootOptions.forEach(btn => {
            const textSpan = btn.querySelector('.text');
            const btnText = (textSpan && textSpan.textContent) ? textSpan.textContent.trim() : (btn.textContent || '').trim();
            const id = btn.id || (btn.dataset && btn.dataset.value) || btnText;
            const desc = AGUIA_FEATURE_DESCRIPTIONS[id] || AGUIA_FEATURE_DESCRIPTIONS[btnText] || '';
            if (btnText) {
                const full = desc ? (btnText + ': ' + desc) : (btnText + '.');
                items.push({ text: full, el: btn });
            }
        });

        // Captura botões do rodapé (Salvar preferências / Redefinir) quando existirem
        try {
            const footer = menuElement.querySelector('.aguia-menu-footer');
            if (footer) {
                const footerButtons = footer.querySelectorAll('button, .aguia-save-button, .aguia-reset-button');
                footerButtons.forEach(btn => {
                    const text = (btn.textContent || '').trim();
                    if (!text) return;
                    const id = btn.id || (btn.dataset && btn.dataset.value) || text;
                    const desc = AGUIA_FEATURE_DESCRIPTIONS[id] || AGUIA_FEATURE_DESCRIPTIONS[text] || '';
                    const full = desc ? (text + ': ' + desc) : (text + '.');
                    items.push({ text: full, el: btn });
                });
            }
        } catch (e) {
        }

        // Remover duplicatas por texto/elemento (mantendo a primeira ocorrência)
        const seenTexts = new Set();
        const seenEls = new Set();
        const unique = [];
        items.forEach(it => {
            const txt = it && it.text ? String(it.text).trim() : '';
            const el = it && it.el ? it.el : null;
            // pular se já vimos o mesmo texto ou o mesmo elemento
            if (txt && seenTexts.has(txt)) return;
            if (el && seenEls.has(el)) return;
            if (txt) seenTexts.add(txt);
            if (el) seenEls.add(el);
            unique.push(it);
        });

        // Ordenar os itens por posição no DOM (garante ordem visual)
        try {
            unique.sort((a, b) => {
                const ae = a && a.el ? a.el : null;
                const be = b && b.el ? b.el : null;
                if (ae && be) {
                    if (ae === be) return 0;
                    // se ae precede be no DOM, retorna -1
                    if (ae.compareDocumentPosition(be) & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
                    return 1;
                }
                // itens com elemento vêm antes de itens sem elemento
                if (ae && !be) return -1;
                if (!ae && be) return 1;
                return 0; // mantém ordem original se nenhum tem elemento
            });
        } catch (e) {
            // se algo falhar, mantemos a ordem original
        }

        return unique;
    }

    // Função que lê em voz alta os itens passados (sequencial, pausada)
    function speakLinesSequentially(items, onEnd) {
        try { if (!window.speechSynthesis) { if (typeof onEnd === 'function') onEnd(); return; } } catch (e) { if (typeof onEnd === 'function') onEnd(); return; }

        // Se já houver leitura em andamento pelo nosso controle, cancelamos antes de iniciar
        try {
            if (menuReadingActive) {
                try { window.speechSynthesis.cancel(); } catch (e) {}
            }
        } catch (e) {}

        // inicia uma nova execução e captura seu id local para evitar reentrância
        menuSpeechRunId++;
        const localRunId = menuSpeechRunId;

        menuReadingActive = true;
        menuSpeechTimeout && clearTimeout(menuSpeechTimeout);
        menuSpeechTimeout = null;
        menuSpeechUtter = null;

        let index = 0;

        const clearHighlight = () => {
            if (menuHighlightedEl) {
                try { menuHighlightedEl.classList.remove('aguia-menu-item--highlighted'); } catch (e) {}
                menuHighlightedEl = null;
            }
        };

        function speakNext() {
            // se esta execução foi invalidada externamente, aborta e faz limpeza
            if (localRunId !== menuSpeechRunId) {
                try { if (menuSpeechTimeout) { clearTimeout(menuSpeechTimeout); menuSpeechTimeout = null; } } catch (e) {}
                menuSpeechUtter = null;
                clearHighlight();
                if (typeof onEnd === 'function') onEnd();
                return;
            }
            if (!menuReadingActive) {
                // leitura foi cancelada externamente
                menuSpeechTimeout && clearTimeout(menuSpeechTimeout);
                menuSpeechTimeout = null;
                menuSpeechUtter = null;
                clearHighlight();
                // invalidar execução para evitar callbacks remanescentes
                menuSpeechRunId++;
                if (typeof onEnd === 'function') onEnd();
                return;
            }
            if (index >= items.length) {
                // Final da lista: garantir limpeza completa do pipeline de TTS
                try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
                menuReadingActive = false;
                // limpar qualquer utter pendente/timeout
                try { if (menuSpeechTimeout) { clearTimeout(menuSpeechTimeout); menuSpeechTimeout = null; } } catch (e) {}
                menuSpeechUtter = null;
                clearHighlight();
                // invalidar execução para evitar callbacks remanescentes
                menuSpeechRunId++;
                if (typeof onEnd === 'function') onEnd();
                return;
            }

            const entry = items[index++];
            const text = entry && entry.text ? entry.text : (entry || '');

            // aplicar destaque ao elemento correspondente (se houver)
            clearHighlight();
            try {
                if (entry && entry.el && entry.el.classList) {
                    entry.el.classList.add('aguia-menu-item--highlighted');
                    menuHighlightedEl = entry.el;
                }
            } catch (e) {}

            const utter = new SpeechSynthesisUtterance(text);
            menuSpeechUtter = utter;
            utter.lang = 'pt-BR';
            utter.rate = 0.95;
            utter.pitch = 1.0;
            // escolher voz pt-BR se disponível
            try {
                const voices = window.speechSynthesis.getVoices();
                if (voices && voices.length) {
                    const v = voices.find(vv => /pt(-|_)br/i.test(vv.lang) || /pt-BR/i.test(vv.lang) || /portuguese/i.test(vv.name));
                    if (v) utter.voice = v;
                }
            } catch (e) {}
            utter.onend = function() {
                // ignorar se execução foi invalidada
                if (localRunId !== menuSpeechRunId) return;
                menuSpeechUtter = null;
                // remover destaque do item narrado
                clearHighlight();
                // breve pausa entre linhas
                menuSpeechTimeout = setTimeout(function() {
                    // cheque novamente antes de seguir
                    if (localRunId !== menuSpeechRunId) { menuSpeechTimeout = null; return; }
                    menuSpeechTimeout = null;
                    speakNext();
                }, 300);
            };
            utter.onerror = function() {
                if (localRunId !== menuSpeechRunId) return;
                menuSpeechUtter = null;
                clearHighlight();
                // tentar continuar
                menuSpeechTimeout = setTimeout(function() {
                    if (localRunId !== menuSpeechRunId) { menuSpeechTimeout = null; return; }
                    menuSpeechTimeout = null;
                    speakNext();
                }, 300);
            };
            try { window.speechSynthesis.speak(utter); } catch (e) { utter.onerror && utter.onerror(); }
        }
        // Inicia leitura
        speakNext();
    }
    
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

    // Atalho de teclado para abrir/fechar o menu de acessibilidade
    // Combinação escolhida: Alt + Shift + A
    // Respeita campos de entrada e contextos editáveis para não interferir na digitação
    (function registerMenuKeyboardShortcut() {
        function isTypingField(el) {
            if (!el) return false;
            const tag = (el.tagName || '').toLowerCase();
            if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
            // Detecta campos que atuam como textbox via ARIA
            const role = (el.getAttribute && el.getAttribute('role')) || '';
            if (role && role.toLowerCase() === 'textbox') return true;
            // verifica ancestors contentEditable
            let node = el;
            while (node) {
                try { if (node.isContentEditable) return true; } catch (e) {}
                node = node.parentElement;
            }
            return false;
        }

    document.addEventListener('keydown', function(e) {
            try {
                const isAKey = (e.key === 'A' || e.key === 'a' || e.code === 'KeyA');
                // Apenas Alt+Shift+A
                const isShortcut = isAKey && (e.altKey && e.shiftKey);
                if (!isShortcut) return;

                // Não ativar quando o usuário estiver digitando em um campo
                if (isTypingField(document.activeElement)) return;

                // Se houver um diálogo modal aberto que não seja o menu AGUIA, evitamos interceptar
                const activeDialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
                for (let i = 0; i < activeDialogs.length; i++) {
                    const dlg = activeDialogs[i];
                    if (dlg && dlg.id !== 'aguiaMenu') {
                        // só bloqueia se o diálogo realmente estiver visível (não apenas presente no DOM)
                        try {
                            const style = window.getComputedStyle ? window.getComputedStyle(dlg) : null;
                            const visible = (style && style.display !== 'none' && style.visibility !== 'hidden') || (dlg.offsetParent !== null);
                            if (visible) return;
                        } catch (e) {
                            return;
                        }
                    }
                }

                e.preventDefault();
                e.stopPropagation();

                // handler alcançado (sem logs)

                // Alterna o menu: preferimos simular clique no botão principal quando possível
                try {
                    const menuButton = document.getElementById('aguiaButton');
                    if (menuButton && typeof menuButton.click === 'function') {
                        menuButton.click();
                    } else {
                        toggleMenu();
                    }
                } catch (err) { /* noop */ }
            } catch (ex) { /* noop */ }
    }, true);

    // Marca globalmente que o listener foi registrado (útil para diagnóstico via DevTools)
    try { window.__aguia_shortcut_installed = true; } catch (e) {}
    })();
    
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

    /**
     * Alterna o modo de interpretação de imagens (Image Interpreter).
     * Quando ativado, o usuário pode clicar em imagens para obter uma descrição.
     * @returns {void}
     */
    // Alterna o modo de interpretação de imagens
    function toggleImageInterpreter() {
        imageInterpreterEnabled = !imageInterpreterEnabled;
        // Atualiza preferência visual do botão
        try {
            const btn = document.getElementById('aguiaImageInterpreterBtn');
            if (btn) {
                if (imageInterpreterEnabled) btn.classList.add('active'); else btn.classList.remove('active');
            }
        } catch (e) {}

        // Mostrar mensagem de status e salvar preferência como as demais funcionalidades
        try {
                if (imageInterpreterEnabled) {
                attachImageListeners();
                // Informa ao usuário que é necessário clicar em uma imagem para obter a descrição
                showStatusMessage('Interpretação de imagens ativada — clique em qualquer imagem para obter a descrição', 'success');
            } else {
                detachImageListeners();
                closeImageInterpreterModal();
                showStatusMessage('Interpretação de imagens desativada');
            }
            // Salvar preferência (será persistida via API ou localStorage)
            try { saveUserPreference('imageInterpreter', imageInterpreterEnabled); } catch (e) {}
        } catch (e) {}
    }
    // Handlers e utilitários para interpretação de imagens
    let _aguiaImageHandler = null;

    /**
     * Anexa listeners de clique em imagens dentro do escopo AGUIA para permitir a interpretação ao clique.
     * @returns {void}
     */
    function attachImageListeners() {
        try {
            const scope = window.AGUIA_SCOPE || document.body;
            detachImageListeners();
            _aguiaImageHandler = function(e) {
                const target = e.target;
                if (!target) return;
                if (target.tagName && target.tagName.toLowerCase() === 'img') {
                    // impedir navegação normal quando estiver no modo de interpretação
                    e.preventDefault();
                    e.stopPropagation();
                    handleImageClick(target, e);
                }
            };
            scope.addEventListener('pointerdown', _aguiaImageHandler);
            // Indicar visualmente que o modo está ativo (aplicável via CSS se desejado)
        } catch (e) {}
    }

    function detachImageListeners() {
        try {
            const scope = window.AGUIA_SCOPE || document.body;
            if (_aguiaImageHandler) {
                scope.removeEventListener('pointerdown', _aguiaImageHandler);
                _aguiaImageHandler = null;
            }
        } catch (e) {}
    }

    function handleImageClick(img, event) {
        try {
            // Se a imagem tiver atributo alt preenchido, mostramos isso
            // diretamente e não chamamos o interpretador Gemini (fallback não necessário).
            try {
                const altAttr = img && (img.getAttribute && img.getAttribute('alt')) ? String(img.getAttribute('alt')) : (img && img.alt ? String(img.alt) : '');
                if (altAttr && altAttr.trim() !== '') {
                    showImageInterpreterModal(altAttr.trim(), img && img.src ? img.src : null, '<small>Descrição fornecida pelo atributo alt</small>');
                    return;
                }
            } catch (e) { /* ignore e continua para o fallback do Gemini */ }

            showImageInterpreterModal('Carregando descrição...', img && img.src ? img.src : null);
            interpretImage(img).then(description => {
                try { showStatusMessage('Descrição recebida', 'success'); } catch (e) {}
                showImageInterpreterModal(description || 'Nenhuma descrição retornada.', img && img.src ? img.src : null);
            }).catch(err => {
                try { showStatusMessage('Erro ao obter descrição', 'error'); } catch (e) {}
                showImageInterpreterModal('Erro: ' + (err && err.message ? err.message : String(err)), img && img.src ? img.src : null);
            });
        } catch (e) {
        }
    }

    function interpretImage(img) {
        return new Promise(async (resolve, reject) => {
            try {
                const imageUrl = img.src || img.getAttribute('data-src') || '';
                const form = new FormData();

                // Tentativa de buscar o blob da imagem
                let sentBlob = false;
                if (imageUrl) {
                    try {
                        const res = await fetch(imageUrl, {mode: 'cors'});
                        if (res && res.ok) {
                            const blob = await res.blob();
                            // inferir extensão a partir do tipo
                            const ext = (blob.type && blob.type.split('/')[1]) ? ('.' + blob.type.split('/')[1]) : '.jpg';
                            form.append('image', blob, 'image' + ext);
                            sentBlob = true;
                        }
                    } catch (e) {
                        // falha ao buscar blob, enviaremos a URL para o servidor
                        sentBlob = false;
                    }
                }

                if (!sentBlob) {
                    form.append('imageUrl', imageUrl);
                }

                const endpoint = (typeof M !== 'undefined' && M.cfg && M.cfg.wwwroot) ? (M.cfg.wwwroot + '/local/aguiaplugin/preferences/interpretar_imagens.php') : '/local/aguiaplugin/preferences/interpretar_imagens.php';
                const resp = await fetch(endpoint, { method: 'POST', body: form, credentials: 'same-origin' });
                if (!resp.ok) {
                    const txt = await resp.text();
                    return reject(new Error('Erro no servidor: ' + resp.status + (txt ? ' - ' + txt : '')));
                }
                const json = await resp.json();
                if (json.success && json.description) {
                    return resolve(json.description);
                }
                if (json.error) {
                    return reject(new Error(json.error));
                }
                if (json.api_response) {
                    return resolve(JSON.stringify(json.api_response));
                }
                return reject(new Error('Resposta inesperada do servidor'));
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * Abre um visualizador de imagem em tela cheia acessível para uma src fornecida.
     * Cria um overlay com a imagem, um botão de fechar, tratadores de teclado
     * e restaura o foco ao fechar.
     */
    function openImageViewer(src, alt) {
        try {
            if (!src) return;
            // Evita criar múltiplos visualizadores
            let existing = document.getElementById('aguiaImageViewerOverlay');
            if (existing) { try { existing.parentNode.removeChild(existing); } catch (e) {} }

            const overlay = document.createElement('div');
            overlay.id = 'aguiaImageViewerOverlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.background = 'rgba(0,0,0,0.92)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = 11000;
            overlay.style.padding = '1rem';

            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';
            wrapper.style.maxWidth = '98%';
            wrapper.style.maxHeight = '98%';
            wrapper.style.display = 'flex';
            wrapper.style.alignItems = 'center';
            wrapper.style.justifyContent = 'center';

            const image = document.createElement('img');
            image.src = src;
            image.alt = alt || '';
            image.style.maxWidth = '100%';
            image.style.maxHeight = '95vh';
            image.style.objectFit = 'contain';
            image.style.borderRadius = '6px';
            image.tabIndex = 0;

            const closeBtn = document.createElement('button');
            closeBtn.setAttribute('aria-label', 'Fechar visualizador de imagem');
            closeBtn.innerHTML = '\u00D7';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '-12px';
            closeBtn.style.right = '-12px';
            closeBtn.style.width = '48px';
            closeBtn.style.height = '48px';
            closeBtn.style.borderRadius = '8px';
            closeBtn.style.border = 'none';
            closeBtn.style.background = '#ffd166';
            closeBtn.style.color = '#000';
            closeBtn.style.fontSize = '1.4rem';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';

            wrapper.appendChild(image);
            wrapper.appendChild(closeBtn);
            overlay.appendChild(wrapper);
            document.body.appendChild(overlay);

            // Salva o foco anterior
            try { overlay._previousFocus = document.activeElement; } catch (e) { overlay._previousFocus = null; }

            const cleanup = function() {
                try {
                    if (overlay._keyHandler) document.removeEventListener('keydown', overlay._keyHandler);
                    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    if (overlay._previousFocus && typeof overlay._previousFocus.focus === 'function') overlay._previousFocus.focus();
                } catch (e) {}
            };

            closeBtn.addEventListener('click', cleanup);
            overlay.addEventListener('click', function(e) { if (e.target === overlay) cleanup(); });

            overlay._keyHandler = function(e) {
                if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); cleanup(); }
                // permite que o teclado interaja/focalize a imagem
                if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === image) { e.preventDefault(); }
            };
            document.addEventListener('keydown', overlay._keyHandler);

            // Foca a imagem para leitores de tela
            setTimeout(function() { try { image.focus(); } catch (e) {} }, 50);
        } catch (e) {}
    }

    function showImageInterpreterModal(text, imageSrc, footerText) {
        let overlay = document.getElementById('aguiaImageInterpreterModal');
        const contentHtml = function(bodyContent, thumbImg, footerText) {
            return '<div class="aguia-card">'
                + (thumbImg ? ('<div class="aguia-card-thumb"><img src="' + thumbImg + '" alt="Imagem selecionada"/></div>') : '')
                + '<div class="aguia-card-body">'
                + '<div class="aguia-card-header">'
                + '<div style="display:flex;align-items:center;gap:0.75rem;">'
                + '<strong class="aguia-card-title">Descrição da imagem</strong>'
                + '</div>'
                + '<div class="aguia-card-controls" aria-hidden="false">'
                + '<button type="button" class="aguia-font-decrease" aria-label="Diminuir tamanho da fonte">A-</button>'
                + '<button type="button" class="aguia-font-increase" aria-label="Aumentar tamanho da fonte">A+</button>'
                + '</div>'
                + '<button class="aguia-card-close" aria-label="Fechar">&times;</button>'
                + '</div>'
                + '<div class="aguia-card-content">' + bodyContent + '</div>'
                + '<div class="aguia-card-footer">' + (footerText || '') + '</div>'
                + '</div>'
                + '</div>';
        };

        const stripFormatting = function(s) {
            if (!s) return '';
            let t = String(s);
            t = t.replace(/<[^>]*>/g, '');
            t = t.replace(/```[\s\S]*?```/g, '');
            t = t.replace(/`([^`]*)`/g, '$1');
            t = t.replace(/\*\*(.*?)\*\*/g, '$1');
            t = t.replace(/\*(.*?)\*/g, '$1');
            t = t.replace(/__(.*?)__/g, '$1');
            t = t.replace(/_(.*?)_/g, '$1');
            t = t.replace(/~~(.*?)~~/g, '$1');
            t = t.replace(/^[\s]*[-*·•]\s+/gm, '');
            t = t.replace(/^[\s]*\d+\.?\s+/gm, '');
            t = t.replace(/\r\n/g, '\n');
            t = t.replace(/\n{3,}/g, '\n\n');
            t = t.replace(/[ \t]{2,}/g, ' ');
            return t.trim();
        };

        const escapeHtml = function(unsafe) {
            return String(unsafe)
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
        };

        const renderFormatted = function(textToRender) {
            const plain = stripFormatting(textToRender);
            if (!plain) return '<p class="aguia-empty">Nenhuma descrição.</p>';
            return '<pre class="aguia-plain-text" style="white-space:pre-wrap;margin:0;">' + escapeHtml(plain) + '</pre>';
        };

            const plainText = (function(){ try { return stripFormatting(String(text || '')); } catch(e){ return String(text || ''); } })();
            const bodyContent = renderFormatted(String(text || ''))
            + '<div class="aguia-card-actions">'
            + '<button type="button" class="aguia-copy-btn">Copiar descrição</button>'
            + '<button type="button" class="aguia-read-btn">Ler descrição</button>'
            + '<button type="button" class="aguia-close-btn">Fechar</button>'
            + '</div>';

            if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'aguiaImageInterpreterModal';
            overlay.className = 'aguia-image-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.innerHTML = contentHtml(bodyContent, imageSrc, (typeof footerText !== 'undefined' ? footerText : '<small>Gerado por Gemini</small>'));
            document.body.appendChild(overlay);

            overlay.style.position = 'fixed';
            overlay.style.inset = '0';
            overlay.style.background = 'rgba(0,0,0,0.48)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = '10000';
            overlay.style.padding = '1.5rem';

            const card = overlay.querySelector('.aguia-card');
            card.style.maxWidth = '720px';
            card.style.width = '100%';
            try { card.style.background = ''; } catch(e) {}
            card.style.borderRadius = '10px';
            try { card.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)'; } catch(e) {}
            card.style.display = 'flex';
            card.style.gap = '1rem';
            card.style.overflow = 'hidden';

            const thumb = card.querySelector('.aguia-card-thumb');
            if (thumb) {
                try { thumb.style.flex = ''; thumb.style.background = ''; thumb.style.display = ''; thumb.style.alignItems = ''; thumb.style.justifyContent = ''; } catch(e) {}
            }
            const thumbImg = card.querySelector('.aguia-card-thumb img');
            if (thumbImg) {
                try { thumbImg.style.maxWidth = ''; thumbImg.style.maxHeight = ''; thumbImg.style.objectFit = ''; thumbImg.style.borderRadius = ''; } catch(e) {}
                try { thumbImg.style.cursor = 'zoom-in'; } catch(e) {}
                try { thumbImg.setAttribute('role', 'button'); thumbImg.setAttribute('tabindex', '0'); } catch(e) {}
                try {
                    thumbImg.addEventListener('click', function() { openImageViewer(thumbImg.src, thumbImg.alt || 'Imagem'); });
                    thumbImg.addEventListener('keydown', function(ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openImageViewer(thumbImg.src, thumbImg.alt || 'Imagem'); } });
                } catch(e) {}
            }

            const body = card.querySelector('.aguia-card-body');
            body.style.flex = '1 1 auto';
            body.style.display = 'flex';
            body.style.flexDirection = 'column';

            const header = card.querySelector('.aguia-card-header');
            header.style.display = 'flex';
            header.style.alignItems = 'center';
            header.style.justifyContent = 'space-between';
            header.style.padding = '0.75rem 1rem';
            header.style.borderBottom = '1px solid rgba(0,0,0,0.06)';

            const title = card.querySelector('.aguia-card-title');
            title.style.fontSize = '1.05rem';
            title.style.fontWeight = '700';

            const closeBtn = card.querySelector('.aguia-card-close');
            closeBtn.style.fontSize = '1.4rem';
            closeBtn.style.lineHeight = '1';
            closeBtn.style.background = 'transparent';
            closeBtn.style.border = 'none';
            closeBtn.style.cursor = 'pointer';

            const content = card.querySelector('.aguia-card-content');
            content.style.padding = '1rem';
            content.style.maxHeight = '60vh';
            content.style.overflow = 'auto';

            const footer = card.querySelector('.aguia-card-footer');
            footer.style.padding = '0.5rem 1rem';
            footer.style.borderTop = '1px solid rgba(0,0,0,0.04)';
            footer.style.fontSize = '0.85rem';
            footer.style.color = '#666';

            const actionsContainer = card.querySelector('.aguia-card-actions');
            if (actionsContainer) {
                actionsContainer.style.display = 'flex';
                actionsContainer.style.gap = '0.6rem';
                actionsContainer.style.justifyContent = 'flex-end';
                actionsContainer.style.alignItems = 'center';
            }
            const actions = card.querySelectorAll('.aguia-card-actions button');
            actions.forEach(btn => {
                btn.style.padding = '0.5rem 0.75rem';
                btn.style.borderRadius = '6px';
                btn.style.border = '1px solid rgba(0,0,0,0.08)';
                btn.style.background = '#fff';
                btn.style.cursor = 'pointer';
            });
            const copyBtn = card.querySelector('.aguia-copy-btn');
            if (copyBtn) {
                copyBtn.style.background = '#2271ff';
                copyBtn.style.color = '#fff';
                copyBtn.style.border = 'none';
            }
            const closeActionBtn = card.querySelector('.aguia-close-btn');
            if (closeActionBtn) {
                closeActionBtn.style.marginLeft = '0.5rem';
            }

            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) closeImageInterpreterModal();
            });
            closeBtn.addEventListener('click', closeImageInterpreterModal);
            const closeAction = card.querySelector('.aguia-close-btn');
            if (closeAction) closeAction.addEventListener('click', closeImageInterpreterModal);
            const copyAction = card.querySelector('.aguia-copy-btn');
            if (copyAction) copyAction.addEventListener('click', function() {
                try { navigator.clipboard.writeText(String(plainText || '')); copyAction.textContent = 'Copiado!'; setTimeout(()=>{copyAction.textContent='Copiar descrição';}, 2000); }
                catch (e) { /* noop */ }
            });
            const readActionInit = card.querySelector('.aguia-read-btn');
            if (readActionInit) {
                readActionInit.addEventListener('click', function() {
                    try {
                        if (window.speechSynthesis && window.speechSynthesis.speaking) {
                            window.speechSynthesis.cancel();
                            readActionInit.textContent = 'Ler descrição';
                            return;
                        }
                        if (!window.speechSynthesis) return;
                        const utter = new SpeechSynthesisUtterance(plainText || '');
                        utter.lang = 'pt-BR';
                        utter.rate = 1.0;
                        const voices = window.speechSynthesis.getVoices();
                        if (voices && voices.length) {
                            const v = voices.find(vv => /pt(-|_)br/i.test(vv.lang) || /pt-BR/i.test(vv.lang) || /portuguese/i.test(vv.name));
                            if (v) utter.voice = v;
                        }
                        utter.onend = function() { readActionInit.textContent = 'Ler descrição'; };
                        readActionInit.textContent = 'Parar leitura';
                        window.speechSynthesis.speak(utter);
                    } catch (e) { /* noop */ }
                });
            }

            overlay._keyHandler = function(e) { if (e.key === 'Escape' || e.key === 'Esc') closeImageInterpreterModal(); };
            document.addEventListener('keydown', overlay._keyHandler);
        } else {
            overlay.innerHTML = contentHtml(bodyContent, imageSrc, (typeof footerText !== 'undefined' ? footerText : '<small>Gerado por Gemini</small>'));

            const cardForStyles = overlay.querySelector('.aguia-card');
            if (cardForStyles) {
                cardForStyles.style.maxWidth = '720px';
                cardForStyles.style.width = '100%';
                cardForStyles.style.background = '#fff';
                cardForStyles.style.borderRadius = '10px';
                cardForStyles.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                cardForStyles.style.display = 'flex';
                cardForStyles.style.gap = '1rem';
                cardForStyles.style.overflow = 'hidden';

                const thumbEl = cardForStyles.querySelector('.aguia-card-thumb');
                if (thumbEl) {
                    try { thumbEl.style.flex = ''; thumbEl.style.background = ''; thumbEl.style.display = ''; thumbEl.style.alignItems = ''; thumbEl.style.justifyContent = ''; } catch(e) {}
                }
                const thumbImgEl = cardForStyles.querySelector('.aguia-card-thumb img');
                if (thumbImgEl) {
                    try { thumbImgEl.style.maxWidth = ''; thumbImgEl.style.maxHeight = ''; thumbImgEl.style.objectFit = ''; thumbImgEl.style.borderRadius = ''; } catch(e) {}
                    try { thumbImgEl.style.cursor = 'zoom-in'; } catch(e) {}
                    try { thumbImgEl.setAttribute('role', 'button'); thumbImgEl.setAttribute('tabindex', '0'); } catch(e) {}
                    try {
                        thumbImgEl.addEventListener('click', function() { openImageViewer(thumbImgEl.src, thumbImgEl.alt || 'Imagem'); });
                        thumbImgEl.addEventListener('keydown', function(ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openImageViewer(thumbImgEl.src, thumbImgEl.alt || 'Imagem'); } });
                    } catch(e) {}
                }

                const bodyEl = cardForStyles.querySelector('.aguia-card-body');
                if (bodyEl) {
                    bodyEl.style.flex = '1 1 auto';
                    bodyEl.style.display = 'flex';
                    bodyEl.style.flexDirection = 'column';
                }

                const headerEl = cardForStyles.querySelector('.aguia-card-header');
                if (headerEl) {
                    headerEl.style.display = 'flex';
                    headerEl.style.alignItems = 'center';
                    headerEl.style.justifyContent = 'space-between';
                    headerEl.style.padding = '0.75rem 1rem';
                    headerEl.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
                }

                const titleEl = cardForStyles.querySelector('.aguia-card-title');
                if (titleEl) { titleEl.style.fontSize = '1.05rem'; titleEl.style.fontWeight = '700'; }
                const closeBtnEl = cardForStyles.querySelector('.aguia-card-close');
                if (closeBtnEl) { closeBtnEl.style.fontSize = '1.4rem'; closeBtnEl.style.lineHeight = '1'; closeBtnEl.style.background = 'transparent'; closeBtnEl.style.border = 'none'; closeBtnEl.style.cursor = 'pointer'; }

                const contentEl = cardForStyles.querySelector('.aguia-card-content');
                if (contentEl) { contentEl.style.padding = '1rem'; contentEl.style.maxHeight = '60vh'; contentEl.style.overflow = 'auto'; }

                const footerEl = cardForStyles.querySelector('.aguia-card-footer');
                if (footerEl) { footerEl.style.padding = '0.5rem 1rem'; footerEl.style.borderTop = '1px solid rgba(255,255,255,0.04)'; footerEl.style.fontSize = '0.85rem'; try { footerEl.style.color = ''; } catch(e){} }

                const actionsContainerForStyles = cardForStyles.querySelector('.aguia-card-actions');
                if (actionsContainerForStyles) {
                    actionsContainerForStyles.style.display = 'flex';
                    actionsContainerForStyles.style.gap = '0.6rem';
                    actionsContainerForStyles.style.justifyContent = 'flex-end';
                    actionsContainerForStyles.style.alignItems = 'center';
                }
                const actionsEls = cardForStyles.querySelectorAll('.aguia-card-actions button');
                actionsEls.forEach(btn => { btn.style.padding = '0.5rem 0.75rem'; btn.style.borderRadius = '6px'; btn.style.border = '1px solid rgba(255,255,255,0.12)'; try { btn.style.background = 'transparent'; } catch(e) {} btn.style.cursor = 'pointer'; try { btn.style.color = 'var(--aguia-modal-fg)'; } catch(e) {} });
                const copyBtnEl = cardForStyles.querySelector('.aguia-copy-btn');
                if (copyBtnEl) { copyBtnEl.style.background = '#2271ff'; copyBtnEl.style.color = '#fff'; copyBtnEl.style.border = 'none'; }
                const closeActionEl = cardForStyles.querySelector('.aguia-close-btn');
                if (closeActionEl) { closeActionEl.style.marginLeft = '0.5rem'; }
            }

            if (overlay._overlayClickHandler) {
                overlay.removeEventListener('click', overlay._overlayClickHandler);
            }
            overlay._overlayClickHandler = function(e) { if (e.target === overlay) closeImageInterpreterModal(); };
            overlay.addEventListener('click', overlay._overlayClickHandler);

            if (!overlay._keyHandler) {
                overlay._keyHandler = function(e) { if (e.key === 'Escape' || e.key === 'Esc') closeImageInterpreterModal(); };
                document.addEventListener('keydown', overlay._keyHandler);
            }

            const card = overlay.querySelector('.aguia-card');
            if (card) {
                const closeBtn = card.querySelector('.aguia-card-close');
                if (closeBtn) {
                    closeBtn.addEventListener('click', closeImageInterpreterModal);
                }
                const closeAction = card.querySelector('.aguia-close-btn');
                if (closeAction) closeAction.addEventListener('click', closeImageInterpreterModal);

                    const copyAction = card.querySelector('.aguia-copy-btn');
                    if (copyAction) {
                        copyAction.addEventListener('click', function() {
                            try { navigator.clipboard.writeText(String(plainText || '')); copyAction.textContent = 'Copiado!'; setTimeout(()=>{copyAction.textContent='Copiar descrição';}, 2000); }
                            catch (e) { /* noop */ }
                        });
                    }
                    const readAction = card.querySelector('.aguia-read-btn');
                    if (readAction) {
                        readAction.addEventListener('click', function() {
                            try {
                                if (window.speechSynthesis && window.speechSynthesis.speaking) {
                                    window.speechSynthesis.cancel();
                                    readAction.textContent = 'Ler descrição';
                                    return;
                                }
                                if (!window.speechSynthesis) return;
                                const utter = new SpeechSynthesisUtterance(plainText || '');
                                utter.lang = 'pt-BR';
                                utter.rate = 1.0;
                                const voices = window.speechSynthesis.getVoices();
                                if (voices && voices.length) {
                                    const v = voices.find(vv => /pt(-|_)br/i.test(vv.lang) || /pt-BR/i.test(vv.lang) || /portuguese/i.test(vv.name));
                                    if (v) utter.voice = v;
                                }
                                utter.onend = function() { readAction.textContent = 'Ler descrição'; };
                                readAction.textContent = 'Parar leitura';
                                window.speechSynthesis.speak(utter);
                            } catch (e) { /* noop */ }
                        });
                    }
            }
        }

        try {
            try { overlay.style.setProperty('--aguia-modal-font-size', overlay._aguiaFontSize || '20px'); } catch (e) {}

            const contentEl = overlay.querySelector('.aguia-card-content');
            if (contentEl) {
                try { contentEl.setAttribute('tabindex', '0'); } catch (e) {}
            }

            const inc = overlay.querySelector('.aguia-font-increase');
            const dec = overlay.querySelector('.aguia-font-decrease');
            const applyFontSize = function(sizePx) {
                let s = String(sizePx || '').trim();
                if (!/px$/.test(s)) s = (parseInt(s,10) || 20) + 'px';
                try { overlay.style.setProperty('--aguia-modal-font-size', s); overlay._aguiaFontSize = s; } catch (e) {}
            };
            if (inc) {
                inc.addEventListener('click', function() {
                    try {
                        const cur = window.getComputedStyle(overlay).getPropertyValue('--aguia-modal-font-size') || overlay._aguiaFontSize || '20px';
                        const n = Math.min(48, (parseInt(cur,10) || 20) + 2);
                        applyFontSize(n + 'px');
                        const c = overlay.querySelector('.aguia-card-content'); if (c && typeof c.focus === 'function') c.focus();
                    } catch (e) {}
                });
            }
            if (dec) {
                dec.addEventListener('click', function() {
                    try {
                        const cur = window.getComputedStyle(overlay).getPropertyValue('--aguia-modal-font-size') || overlay._aguiaFontSize || '20px';
                        const n = Math.max(12, (parseInt(cur,10) || 20) - 2);
                        applyFontSize(n + 'px');
                        const c = overlay.querySelector('.aguia-card-content'); if (c && typeof c.focus === 'function') c.focus();
                    } catch (e) {}
                });
            }

            const closeBtn = overlay.querySelector('.aguia-card-close');
            if (closeBtn) {
                try { closeBtn.setAttribute('aria-label', closeBtn.getAttribute('aria-label') || 'Fechar'); } catch (e) {}
            }

            setTimeout(function() {
                const toFocus = overlay.querySelector('.aguia-card-content') || overlay.querySelector('.aguia-copy-btn') || overlay.querySelector('.aguia-card-close');
                if (toFocus && typeof toFocus.focus === 'function') toFocus.focus();
            }, 50);
        } catch (e) {}
    }

    function closeImageInterpreterModal() {
        const overlay = document.getElementById('aguiaImageInterpreterModal');
        if (!overlay) return;
        try { if (window.speechSynthesis && window.speechSynthesis.speaking) window.speechSynthesis.cancel(); } catch (e) {}
        if (overlay._keyHandler) document.removeEventListener('keydown', overlay._keyHandler);
        overlay.parentNode && overlay.parentNode.removeChild(overlay);
    }
    
    // Função para alternar o menu
    function toggleMenu() {
        const menu = document.getElementById('aguiaMenu');
        const button = document.getElementById('aguiaButton');
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            menu.style.display = 'none';
            // Ao fechar, garantimos que qualquer estilo de cursor aplicado ao menu seja removido
                try { menu.style.cursor = ''; try { menu.style.removeProperty('--aguia-custom-cursor'); } catch(ee){} } catch (e) {}
            try { menu.classList.remove('aguia-custom-cursor-active'); } catch (e) {}
            button.setAttribute('aria-expanded', 'false');
            // Remove aria-modal ao fechar
            try {
                menu.removeAttribute('aria-modal');
            } catch (e) {}
            if (menu._aguiaKeyHandler) {
                menu.removeEventListener('keydown', menu._aguiaKeyHandler);
                menu._aguiaKeyHandler = null;
            }
            // Remove outside-click handler if presente
            if (menu._aguiaOutsideClickHandler) {
                document.removeEventListener('pointerdown', menu._aguiaOutsideClickHandler);
                menu._aguiaOutsideClickHandler = null;
            }
            // Restaurar foco para o elemento que abriu o menu
            try {
                if (menu._aguiaPreviousFocus && typeof menu._aguiaPreviousFocus.focus === 'function') {
                    menu._aguiaPreviousFocus.focus();
                }
            } catch (e) {}
            // Se o modo de interpretação de imagens estava ativo, removemos listeners para evitar efeitos colaterais
            try {
                if (!imageInterpreterEnabled) {
                    // garantimos que não há listeners pendentes
                    detachImageListeners();
                }
            } catch (e) {}
        } else {
            menu.style.display = 'block';
            // Aplicar cursor customizado dentro do menu se a funcionalidade Cursor Grande estiver ativa
            try {
                if (typeof customCursorEnabled !== 'undefined' && customCursorEnabled) {
                    const scope = window.AGUIA_SCOPE || document.getElementById('aguia-scope-element') || document.body;
                    const computedCursor = (window.getComputedStyle && scope) ? (window.getComputedStyle(scope).cursor || '') : '';
                    if (computedCursor) {
                        try { menu.style.cursor = computedCursor; try { menu.style.setProperty('--aguia-custom-cursor', computedCursor); } catch(ee){} } catch (e) {}
                    } else {
                        try { menu.classList.add('aguia-custom-cursor-active'); } catch (e) {}
                    }
                } else {
                    try { menu.style.cursor = ''; try { menu.style.removeProperty('--aguia-custom-cursor'); } catch(ee){} } catch (e) {}
                    try { menu.classList.remove('aguia-custom-cursor-active'); } catch (e) {}
                }
            } catch (e) {}
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
            // Instala um handler para fechar o menu ao clicar fora dele
            if (!menu._aguiaOutsideClickHandler) {
                menu._aguiaOutsideClickHandler = function(e) {
                    try {
                        const btn = document.getElementById('aguiaButton');
                        // Se o clique aconteceu dentro do menu ou no botão que abre o menu, ignora
                        if (!menu || menu.style.display === 'none') return;
                        if (menu.contains(e.target) || (btn && btn.contains(e.target))) return;
                        // Caso contrário, fecha o menu
                        toggleMenu();
                    } catch (err) {
                    }
                };
                // Usamos pointerdown para cobrir mouse e touch de forma consistente
                document.addEventListener('pointerdown', menu._aguiaOutsideClickHandler);
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
        // Botão para leitura do menu (ícone de volume)
        const readMenuBtn = document.createElement('button');
        readMenuBtn.className = 'aguia-menu-read';
        readMenuBtn.setAttribute('aria-label', 'Ler funcionalidades do menu');
        readMenuBtn.setAttribute('title', 'Ler funcionalidades do menu');
    readMenuBtn.style.marginLeft = '0.5rem';
    readMenuBtn.style.background = 'transparent';
    readMenuBtn.style.border = 'none';
    readMenuBtn.style.cursor = 'pointer';
        readMenuBtn.innerHTML = AguiaIcons.volume;
        readMenuBtn.addEventListener('click', function() {
            try {
                const menuEl = document.getElementById('aguiaMenu');
                const lines = gatherMenuDescriptions(menuEl);
                if (!lines || !lines.length) return;
                // Se já estiver falando, interrompe imediatamente e restaura o ícone
                if (menuReadingActive || (window.speechSynthesis && window.speechSynthesis.speaking)) {
                    // marca como cancelado
                    menuReadingActive = false;
                    // invalidar execução atual para evitar callbacks remanescentes
                    try { menuSpeechRunId++; } catch (e) {}
                    try { window.speechSynthesis.cancel(); } catch (e) {}
                    // limpa timeouts/utter pendentes
                    try { if (menuSpeechTimeout) { clearTimeout(menuSpeechTimeout); menuSpeechTimeout = null; } } catch (e) {}
                    menuSpeechUtter = null;
                    // restaura visual
                    readMenuBtn.innerHTML = AguiaIcons.volume;
                    readMenuBtn.setAttribute('aria-pressed', 'false');
                    readMenuBtn.classList.remove('aguia-menu-read--active');
                    readMenuBtn.style.filter = '';
                    return;
                }

                // Marca como ativo (visual) e inicia leitura
                readMenuBtn.innerHTML = AguiaIcons.volumeOff;
                readMenuBtn.setAttribute('aria-pressed', 'true');
                readMenuBtn.classList.add('aguia-menu-read--active');

                speakLinesSequentially(lines, function() {
                    // leitura finalizada: restaurar visual
                    readMenuBtn.innerHTML = AguiaIcons.volume;
                    readMenuBtn.setAttribute('aria-pressed', 'false');
                    readMenuBtn.classList.remove('aguia-menu-read--active');
                });
            } catch (e) { /* noop */ }
        });

        const closeBtn = document.createElement('button');
        closeBtn.className = 'aguia-menu-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', 'Fechar menu de acessibilidade');
        closeBtn.addEventListener('click', toggleMenu);
        
    header.appendChild(title);
    // adiciona botão de leitura ao lado direito do título (antes do fechar)
    header.appendChild(readMenuBtn);
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
            ,{
                iconSvg: AguiaIcons.imageInterpreter,
                text: 'Interpretar Imagens',
                action: toggleImageInterpreter,
                ariaLabel: 'Ativar interpretação de imagens',
                id: 'aguiaImageInterpreterBtn'
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
            { value: 'none', text: 'Nenhum' },
            { value: 'protanopia', text: 'Protanopia (sem vermelho)', iconSvg: AguiaIcons.protanopia },
            { value: 'deuteranopia', text: 'Deuteranopia (sem verde)', iconSvg: AguiaIcons.deuteranopia },
            { value: 'tritanopia', text: 'Tritanopia (sem azul)', iconSvg: AguiaIcons.tritanopia },
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
                iconSvg: AguiaIcons.reduceAnimations,
                text: 'Reduzir Animações',
                action: function() {
                    toggleReduceAnimations();
                },
                ariaLabel: 'Ativar ou desativar redução de animações',
                id: 'aguiaReduceAnimationsBtn'
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
                            // Esconde o menu quando ativa a lupa. Use toggleMenu() para manter estado ARIA consistente
                            try {
                                const menuButton = document.getElementById('aguiaButton');
                                const expanded = menuButton && menuButton.getAttribute('aria-expanded') === 'true';
                                if (expanded) {
                                    toggleMenu();
                                } else if (menu) {
                                    menu.style.display = 'none';
                                }
                            } catch (e) {}
                            if (button) button.classList.add('active');
                            showStatusMessage('Lupa de conteúdo ativada', 'success');
                        } else {
                            // Mostra o menu quando desativa a lupa.
                            try {
                                const menuButton = document.getElementById('aguiaButton');
                                const expanded = menuButton && menuButton.getAttribute('aria-expanded') === 'true';
                                if (!expanded) {
                                    toggleMenu();
                                } else if (menu) {
                                    menu.style.display = 'block';
                                }
                            } catch (e) {}
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
                            try {
                                const menuButton = document.getElementById('aguiaButton');
                                const expanded = menuButton && menuButton.getAttribute('aria-expanded') === 'true';
                                if (expanded) toggleMenu();
                                else if (menu) menu.style.display = 'none';
                            } catch (e) {}
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
        // Se o Cursor Grande já estiver ativo, aplicamos a classe ao menu para que o cursor
        // dentro do próprio menu também seja alterado.
        try {
            if (typeof customCursorEnabled !== 'undefined' && customCursorEnabled) {
                const m = document.getElementById('aguiaMenu');
                if (m) {
                    try {
                        const scope = window.AGUIA_SCOPE || document.getElementById('aguia-scope-element') || document.body;
                        const computedCursor = (window.getComputedStyle && scope) ? (window.getComputedStyle(scope).cursor || '') : '';
                        if (computedCursor) {
                            m.style.cursor = computedCursor;
                            try { m.style.setProperty('--aguia-custom-cursor', computedCursor); } catch (ee) {}
                        } else {
                            m.classList.add('aguia-custom-cursor-active');
                        }
                    } catch (e) {
                        try { m.classList.add('aguia-custom-cursor-active'); } catch (er) {}
                    }
                }
            }
        } catch (e) {}
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
        // Envolver a chamada em um wrapper para evitar que o objeto Event seja passado
        // como argumento para funções que usam a assinatura (silent = false).
        button.addEventListener('click', function(e) {
            try { e.preventDefault(); } catch (err) {}
            try {
                // Marcar o botão como âncora temporária para a mensagem de status
                const msg = document.getElementById('aguiaStatusMessage');
                if (msg) {
                    // Limpa timeout anterior se existir
                    if (msg._aguiaAnchorClearTimeout) {
                        clearTimeout(msg._aguiaAnchorClearTimeout);
                        msg._aguiaAnchorClearTimeout = null;
                    }
                    msg._aguiaAnchor = button;
                    // Limpar a âncora depois de 3.5s (alinha com duração da mensagem)
                    msg._aguiaAnchorClearTimeout = setTimeout(function() {
                        try { if (msg) { msg._aguiaAnchor = null; } } catch (e) {}
                    }, 3500);
                }
                option.action();
                // Se este botão é o "Cursor Grande", também aplicamos/removemos
                // o efeito dentro do menu para que o cursor usado ali mude
                // apenas quando a funcionalidade estiver ativa.
                try {
                    if (option.id === 'aguiaCustomCursorBtn') {
                        const menuEl = document.getElementById('aguiaMenu');
                        if (menuEl) {
                            try {
                                const scope = window.AGUIA_SCOPE || document.getElementById('aguia-scope-element') || document.body;
                                const computedCursor = (window.getComputedStyle && scope) ? (window.getComputedStyle(scope).cursor || '') : '';
                                if (typeof customCursorEnabled !== 'undefined' && customCursorEnabled) {
                                    if (computedCursor) {
                                        menuEl.style.cursor = computedCursor;
                                        try { menuEl.style.setProperty('--aguia-custom-cursor', computedCursor); } catch (ee) {}
                                    }
                                    else menuEl.classList.add('aguia-custom-cursor-active');
                                } else {
                                    // remover estilo inline e classe residual
                                    try { menuEl.style.cursor = ''; } catch (er) {}
                                    try { menuEl.style.removeProperty('--aguia-custom-cursor'); } catch (ee) {}
                                    try { menuEl.classList.remove('aguia-custom-cursor-active'); } catch (er) {}
                                }
                            } catch (er) {
                                try {
                                    if (typeof customCursorEnabled !== 'undefined' && customCursorEnabled) menuEl.classList.add('aguia-custom-cursor-active');
                                    else menuEl.classList.remove('aguia-custom-cursor-active');
                                } catch (e) {}
                            }
                        }
                    }
                } catch (e) { /* noop */ }
            } catch (err) { console.error('Erro ao executar ação do botão AGUIA', err); }
        });
        button.addEventListener('keydown', function(e) {
            // Permitir navegação por teclado (WCAG 2.1.1)
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                try {
                    option.action();
                    if (option.id === 'aguiaCustomCursorBtn') {
                        const menuEl = document.getElementById('aguiaMenu');
                        if (menuEl) {
                            try {
                                const scope = window.AGUIA_SCOPE || document.getElementById('aguia-scope-element') || document.body;
                                const computedCursor = (window.getComputedStyle && scope) ? (window.getComputedStyle(scope).cursor || '') : '';
                                if (typeof customCursorEnabled !== 'undefined' && customCursorEnabled) {
                                    if (computedCursor) {
                                        menuEl.style.cursor = computedCursor;
                                        try { menuEl.style.setProperty('--aguia-custom-cursor', computedCursor); } catch (ee) {}
                                    }
                                    else menuEl.classList.add('aguia-custom-cursor-active');
                                } else {
                                    try { menuEl.style.cursor = ''; } catch (er) {}
                                    try { menuEl.style.removeProperty('--aguia-custom-cursor'); } catch (ee) {}
                                    try { menuEl.classList.remove('aguia-custom-cursor-active'); } catch (er) {}
                                }
                            } catch (er) {
                                try {
                                    if (typeof customCursorEnabled !== 'undefined' && customCursorEnabled) menuEl.classList.add('aguia-custom-cursor-active');
                                    else menuEl.classList.remove('aguia-custom-cursor-active');
                                } catch (e) {}
                            }
                        }
                    }
                } catch (err) { console.error('Erro ao executar ação do botão AGUIA via teclado', err); }
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

        // Define texto
        message.textContent = text;

        // Ajusta classes sem sobrescrever outras classes (preserva classes de animação)
        // Remove classes de tipo anteriores e adiciona a classe base e a nova classe de tipo quando fornecida
        try {
            message.classList.remove('success', 'warning', 'error');
            if (!message.classList.contains('aguia-status-message')) {
                message.classList.add('aguia-status-message');
            }
            if (type) {
                // type pode vir vazio ou ser 'success'|'warning'|'error'
                message.classList.add(type);
            }
        } catch (e) {
            // fallback simples
            message.className = 'aguia-status-message' + (type ? ' ' + type : '');
        }

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
            let top = mRect.top - msgRect.height - 8; 
            let left = mRect.left + mRect.width - msgRect.width - 8;

            // Proteções contra sair da tela
            if (top < 8) top = 8;
            if (left < 8) left = 8;

            message.style.left = left + 'px';
            message.style.top = top + 'px';
        } else if (message._aguiaAnchor && document.body.contains(message._aguiaAnchor)) {
            // Se houver um botão que disparou a ação, ancoramos a mensagem acima dele
            try {
                const aRect = message._aguiaAnchor.getBoundingClientRect();
                let top = aRect.top - msgRect.height - 8;
                let left = aRect.left + (aRect.width / 2) - (msgRect.width / 2);

                // Proteções contra sair da tela
                if (top < 8) top = 8;
                if (left < 8) left = 8;
                if (left + msgRect.width > window.innerWidth - 8) left = Math.max(8, window.innerWidth - msgRect.width - 8);

                message.style.left = left + 'px';
                message.style.top = top + 'px';
            } catch (e) {
                // fallback para canto inferior direito se algo falhar
                message.style.right = '30px';
                message.style.bottom = '30px';
            }
        } else {
            // Fallback: canto inferior direito — usar valores fixos para evitar posicionamento fora da tela
            message.style.right = '30px';
            message.style.bottom = '30px';
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

            try {
                // Verifica se o usuário prefere reduzir motion via media query
                var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                // Também respeitamos a preferência interna do plugin (reduceAnimationsEnabled)
                // e a presença da classe global .aguia-reduce-animations no documento
                var reduce = !!(prefersReduce || reduceAnimationsEnabled || (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains && document.documentElement.classList.contains('aguia-reduce-animations')));

                // Limpa classes de animação anteriores
                message.classList.remove('aguia-status-enter', 'aguia-status-exit');
                if (!reduce) {
                    // Definir estado inicial inline para garantir que a animação seja percebida
                    try {
                        message.style.transform = 'translateX(120px)';
                        message.style.opacity = '0';
                    } catch (e) {}

                    // Força reflow para garantir os estilos iniciais aplicados
                    // eslint-disable-next-line no-unused-expressions
                    void message.offsetHeight;

                    // Adiciona classe que inicia a animação de entrada
                    message.classList.add('aguia-status-enter');
                    // animation class added for entry
                } else {
                    // Se animações foram reduzidas (pelo usuário ou plugin), garantir estado visível
                    try {
                        message.style.transform = '';
                        message.style.opacity = '1';
                    } catch (e) {}
                }
        } catch (e) {
            // fallback silencioso
        }

        // Oculta a mensagem após 3 segundos, com animação de saída se permitido
        message._aguiaTimeout = setTimeout(function() {
            // Se o usuário preferir reduzir movimento (via media query ou preferência do plugin), não anima, apenas oculta
            var prefersReduceTimeout = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            var reduceTimeout = !!(prefersReduceTimeout || reduceAnimationsEnabled || (document.documentElement && document.documentElement.classList && document.documentElement.classList.contains && document.documentElement.classList.contains('aguia-reduce-animations')));
            if (reduceTimeout) {
                message.style.display = 'none';
                return;
            }

            // Reproduz animação de saída via classe e depois remove do DOM visual
            // Limpa entrada caso esteja presente
            message.classList.remove('aguia-status-enter');
            // Força reflow
            // eslint-disable-next-line no-unused-expressions
            void message.offsetHeight;

            // Handler para esconder após animação
            message._aguiaHideHandler = function() {
                // animation end handler fired
                message.style.display = 'none';
                // Limpar quaisquer estilos inline que possam ter sido adicionados
                try {
                    message.style.transform = '';
                    message.style.opacity = '';
                } catch (e) {}
                message.classList.remove('aguia-status-exit');
                message.removeEventListener('animationend', message._aguiaHideHandler);
                message._aguiaHideHandler = null;
            };

            message.addEventListener('animationend', message._aguiaHideHandler);
            // Inicia animação de saída
            message.classList.add('aguia-status-exit');
            // animation class added for exit
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
            showStatusMessage('Alto contraste ativado', 'success');
        } else {
            AGUIA_SCOPE.classList.remove('aguia-high-contrast');
            showStatusMessage('Alto contraste desativado');
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
            
            // Remove classes de daltonismo do body, html e AGUIA_SCOPE
            document.body.classList.remove(
                'aguia-colorblind-protanopia',
                'aguia-colorblind-deuteranopia',
                'aguia-colorblind-tritanopia',
                'aguia-colorblind-achromatopsia'
            );
            document.documentElement.classList.remove(
                'aguia-colorblind-protanopia',
                'aguia-colorblind-deuteranopia',
                'aguia-colorblind-tritanopia',
                'aguia-colorblind-achromatopsia'
            );
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
    function setColorBlindModes(modes) {
        // Remove classes anteriores do body e html para garantir que funcionem
        document.body.classList.remove(
            'aguia-colorblind-protanopia',
            'aguia-colorblind-deuteranopia',
            'aguia-colorblind-tritanopia'
        );
        document.documentElement.classList.remove(
            'aguia-colorblind-protanopia',
            'aguia-colorblind-deuteranopia',
            'aguia-colorblind-tritanopia'
        );
        // Também remove do AGUIA_SCOPE por compatibilidade
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
        document.body.classList.remove(
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
            // Aplica filtros no body e html para garantir que toda a página seja afetada
            modes.forEach(mode => {
                document.body.classList.add('aguia-colorblind-' + mode);
                document.documentElement.classList.add('aguia-colorblind-' + mode);
                AGUIA_SCOPE.classList.add('aguia-colorblind-' + mode);
            });
            
            // Mantém o botão fora do efeito
            const aguiaButton = document.getElementById('aguiaButton');
            if (aguiaButton) {
                aguiaButton.style.filter = 'none';
            }
            const aguiaMenu = document.getElementById('aguiaMenu');
            if (aguiaMenu) {
                aguiaMenu.style.filter = 'none';
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
        // Se houver leitura em andamento, interrompe imediatamente e limpa estado
        try {
            if (menuReadingActive || (window.speechSynthesis && window.speechSynthesis.speaking)) {
                menuReadingActive = false;
                // invalidar execução atual
                try { menuSpeechRunId++; } catch (e) {}
                try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
                try { if (menuSpeechTimeout) { clearTimeout(menuSpeechTimeout); menuSpeechTimeout = null; } } catch (e) {}
                menuSpeechUtter = null;
                try { if (menuHighlightedEl && menuHighlightedEl.classList) menuHighlightedEl.classList.remove('aguia-menu-item--highlighted'); } catch (e) {}
                menuHighlightedEl = null;
                // restaurar visual do botão de leitura
                try {
                    const readBtn = document.querySelector('.aguia-menu-read');
                    if (readBtn) {
                        readBtn.innerHTML = (typeof AguiaIcons !== 'undefined' && AguiaIcons.volume) ? AguiaIcons.volume : '';
                        readBtn.setAttribute('aria-pressed', 'false');
                        readBtn.classList.remove('aguia-menu-read--active');
                    }
                } catch (e) {}
            }
        } catch (e) {}
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
        // Garantir que o menu e seu conteúdo voltem ao cursor padrão
        try {
            const menuEl = document.getElementById('aguiaMenu');
            if (menuEl) {
                try { menuEl.style.cursor = ''; } catch (e) {}
                try { menuEl.style.removeProperty('--aguia-custom-cursor'); } catch (e) {}
                try { menuEl.classList.remove('aguia-custom-cursor-active'); } catch (e) {}
            }
        } catch (e) {}
        
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
        
        // Garantir que a preferência de reduzir animações também seja desativada
        try {
            reduceAnimationsEnabled = false;
        } catch (e) {}
        try {
            if (document && document.documentElement && document.documentElement.classList) {
                document.documentElement.classList.remove('aguia-reduce-animations');
            }
        } catch (e) {}
        const reduceBtn = document.getElementById('aguiaReduceAnimationsBtn');
        if (reduceBtn) {
            reduceBtn.classList.remove('active');
        }
        // Salvar preferência desativada
        saveUserPreference('reduceAnimations', false);

        // Reset da funcionalidade de interpretar imagens (nova funcionalidade)
        try {
            if (imageInterpreterEnabled) {
                imageInterpreterEnabled = false;
                detachImageListeners();
                closeImageInterpreterModal();
            }
            const imgBtn = document.getElementById('aguiaImageInterpreterBtn');
            if (imgBtn) imgBtn.classList.remove('active');
            // Salvar preferência desativada
            try { saveUserPreference('imageInterpreter', false); } catch (e) {}
        } catch (e) {}

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
                customCursor: getFromLocalStorage('customCursor', false),
                reduceAnimations: getFromLocalStorage('reduceAnimations', false)
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

        // Aplicar redução de animações (se o usuário tiver salvo a preferência)
        if (typeof preferences.reduceAnimations !== 'undefined') {
            reduceAnimationsEnabled = !!preferences.reduceAnimations;
            try {
                if (reduceAnimationsEnabled) {
                    document.documentElement.classList.add('aguia-reduce-animations');
                } else {
                    document.documentElement.classList.remove('aguia-reduce-animations');
                }
            } catch (e) {}

            const reduceBtn = document.getElementById('aguiaReduceAnimationsBtn');
            if (reduceBtn) {
                if (reduceAnimationsEnabled) reduceBtn.classList.add('active'); else reduceBtn.classList.remove('active');
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

    // Função para alternar redução de animações
    function toggleReduceAnimations(silent = false) {
        reduceAnimationsEnabled = !reduceAnimationsEnabled;

        try {
            if (reduceAnimationsEnabled) {
                document.documentElement.classList.add('aguia-reduce-animations');
            } else {
                document.documentElement.classList.remove('aguia-reduce-animations');
            }
        } catch (e) {}

        const reduceBtn = document.getElementById('aguiaReduceAnimationsBtn');
        if (reduceBtn) {
            if (reduceAnimationsEnabled) reduceBtn.classList.add('active'); else reduceBtn.classList.remove('active');
        }

        if (!silent) {
            showStatusMessage(reduceAnimationsEnabled ? 'Animações reduzidas' : 'Animações restauradas', 'success');
        }

        // Certifica-se de não passar o evento acidentalmente
        // Salva preferência
        saveUserPreference('reduceAnimations', reduceAnimationsEnabled);
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
