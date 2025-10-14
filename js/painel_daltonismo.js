/**
 * Plugin AGUIA de Acessibilidade
 * Módulo para gerenciamento das funcionalidades de daltonismo
 * 
 * @module     local_aguiaplugin/painel_daltonismo
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    // Garantir que os ícones estão disponíveis
    if (typeof AguiaIcons === 'undefined') {
    console.error('AguiaIcons não está definido. Verifique se icones_acessibilidade.js foi carregado antes de painel_daltonismo.js');
        return;
    }
    
    // Create accessibility button
    createAccessibilityButton();
    
    // Create menu
    createMenu();
    
    // Create settings panel
    createSettingsPanel();
    
    // Initialize colorblind panel
    createColorblindPanel();
    
    // Load user preferences
    loadUserPreferences();
    
    // Inicializa os modos de daltonismo salvos
    initializeColorblindModes();
    
    // VLibras removido
});

// Aplica estilos visuais fortes para o item selecionado (evita conflitos de CSS com !important)
function updateColorblindOptionStyles() {
    const options = document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option');
    options.forEach(btn => {
        const isActive = btn.classList.contains('active');
        const isNone = btn.dataset && btn.dataset.value === 'none';
        const textEl = btn.querySelector('.aguia-text-container');

        if (isActive && !isNone) {
            // Tom azul consistente com a aplicação
            btn.style.background = 'linear-gradient(145deg, #2271ff, #0d47a1)';
            btn.style.backgroundColor = '#2271ff';
            btn.style.border = '1px solid #2271ff';
            btn.style.color = '#ffffff';
            if (textEl) {
                textEl.style.color = '#ffffff';
                textEl.style.fontWeight = '700';
            }
        } else {
            // Resetar para estilos padrão do tema
            btn.style.background = '';
            btn.style.backgroundColor = '';
            btn.style.border = '';
            btn.style.color = '';
            if (textEl) {
                textEl.style.color = '';
                textEl.style.fontWeight = '';
            }
        }
    });
}

// Função para criar o painel de daltonismo com suporte a múltiplas seleções
function createColorblindPanel() {
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
    
    // Descrição para múltipla seleção
    const selectionHelp = document.createElement('p');
    selectionHelp.className = 'aguia-submenu-description';
    selectionHelp.textContent = 'Você pode selecionar múltiplos tipos de daltonismo simultaneamente';
    colorblindPanel.appendChild(selectionHelp);
    
    // Definir opções do painel com textos fixos e cores correspondentes
    const colorblindOptions = [
        {
            value: 'none',
            text: 'Nenhum (Resetar)',
            color: '#FFFFFF',
            hasStroke: true
        },
        {
            value: 'protanopia',
            text: 'Protanopia (sem vermelho)',
            color: '#FF0000',
            hasStroke: false
        },
        {
            value: 'deuteranopia',
            text: 'Deuteranopia (sem verde)',
            color: '#00FF00',
            hasStroke: false
        },
        {
            value: 'tritanopia',
            text: 'Tritanopia (sem azul)',
            color: '#0000FF',
            hasStroke: false
        }
    ];
    
    // Criar container para as opções
    const colorblindOptionsContainer = document.createElement('div');
    colorblindOptionsContainer.className = 'aguia-submenu-content';
    
    // Recuperar modos ativos
    let activeColorblindModes = [];
    try {
        const savedModes = localStorage.getItem('aguia_colorblind_modes');
        if (savedModes) {
            activeColorblindModes = JSON.parse(savedModes);
        }
    } catch (e) {
        console.error('Erro ao carregar os modos de daltonismo salvos:', e);
        activeColorblindModes = [];
    }
    
    // Criar botões de opção
    colorblindOptions.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.className = 'aguia-submenu-option aguia-multi-select-option';
        optionButton.dataset.value = option.value;
        optionButton.setAttribute('aria-label', option.text);

        // Container flexível para o conteúdo do botão
        const buttonContent = document.createElement('div');
        buttonContent.className = 'aguia-button-content';
        buttonContent.style.display = 'flex';
        buttonContent.style.alignItems = 'center';
        buttonContent.style.width = '100%';
        
        // Criar o ícone (círculo colorido)
        const iconContainer = document.createElement('div');
        iconContainer.className = 'aguia-icon-container';
        iconContainer.style.marginRight = '10px';
        iconContainer.style.display = 'flex';
        iconContainer.style.alignItems = 'center';
        iconContainer.style.justifyContent = 'center';
        
        // Criar o SVG diretamente
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('role', 'img');
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        
        // Adicionar círculo colorido
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '12');
        circle.setAttribute('cy', '12');
        circle.setAttribute('r', '10');
        circle.setAttribute('stroke', 'currentColor');
        circle.setAttribute('stroke-width', '1');
        circle.setAttribute('fill', option.color);
        svg.appendChild(circle);
        
        // Adicionar traço diagonal para a opção "Nenhum"
        if (option.hasStroke) {
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7 7 L17 17');
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path);
        }
        
        iconContainer.appendChild(svg);
        buttonContent.appendChild(iconContainer);
        
        // Criar o texto da opção
        const textContainer = document.createElement('div');
        textContainer.className = 'aguia-text-container';
        textContainer.textContent = option.text;
        buttonContent.appendChild(textContainer);
        
        optionButton.appendChild(buttonContent);
        
        // Marca o botão como ativo se o modo estiver na lista de modos ativos
        if (option.value === 'none' && activeColorblindModes.length === 0) {
            optionButton.classList.add('active');
        } else if (option.value !== 'none' && activeColorblindModes.includes(option.value)) {
            optionButton.classList.add('active');
        }
        
        // Adicionar evento de clique
        optionButton.addEventListener('click', function() {
            // Comportamento especial para a opção "Nenhum"
            if (this.dataset.value === 'none') {
                // Remove a classe ativa de todos os botões
                document.querySelectorAll('.aguia-submenu-option').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Ativa apenas o botão "Nenhum"
                this.classList.add('active');
                // Reseta os modos de daltonismo
                setColorBlindModes([]);
                // Atualiza visual
                updateColorblindOptionStyles();
            } else {
                // Remove a classe ativa do botão "Nenhum"
                const noneButton = document.querySelector('.aguia-submenu-option[data-value="none"]');
                if (noneButton) {
                    noneButton.classList.remove('active');
                }
                
                // Alterna a classe ativa do botão atual
                this.classList.toggle('active');
                
                // Coleta todos os modos ativos
                const activeModes = [];
                document.querySelectorAll('.aguia-submenu-option.active').forEach(btn => {
                    if (btn.dataset.value !== 'none') {
                        activeModes.push(btn.dataset.value);
                    }
                });
                
                // Aplica os modos de daltonismo
                setColorBlindModes(activeModes);
                // Atualiza visual
                updateColorblindOptionStyles();
            }
        });
        
        colorblindOptionsContainer.appendChild(optionButton);
    });
    
    colorblindPanel.appendChild(colorblindOptionsContainer);
    
    // Adiciona o painel ao documento
    document.body.appendChild(colorblindPanel);
    // Aplicar estilo inicial conforme seleção atual
    updateColorblindOptionStyles();
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

// Função para obter valor do localStorage
function getFromLocalStorage(key, defaultValue) {
    if (window.AguiaAPI && typeof window.AguiaAPI.getFromLocalStorage === 'function') {
        return window.AguiaAPI.getFromLocalStorage(key, defaultValue);
    } else {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    }
}
