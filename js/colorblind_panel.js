/**
 * Plugin AGUIA de Acessibilidade
 * Módulo para gerenciamento das funcionalidades de daltonismo
 * 
 * @module     local_aguiaplugin/colorblind_panel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Initialize
document.addEventListener("DOMContentLoaded", function() {
    // Garantir que os ícones estão disponíveis
    if (typeof AguiaIcons === 'undefined') {
        console.error('AguiaIcons não está definido. Verifique se accessibility_icons.js foi carregado antes de colorblind_panel.js');
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
    
    // Inicializa o VLibras se disponível
    if (typeof initializeVLibras === 'function') {
        initializeVLibras();
    }
});

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
    
    // Opções para o painel de daltonismo
    const colorblindOptions = [
        { value: 'none', text: 'Nenhum (Resetar)', iconSvg: AguiaIcons.colorblindNone },
        { value: 'protanopia', text: 'Protanopia (sem vermelho)', iconSvg: AguiaIcons.protanopia },
        { value: 'deuteranopia', text: 'Deuteranopia (sem verde)', iconSvg: AguiaIcons.deuteranopia },
        { value: 'tritanopia', text: 'Tritanopia (sem azul)', iconSvg: AguiaIcons.tritanopia },
        { value: 'achromatopsia', text: 'Monocromacia (sem cores)', iconSvg: AguiaIcons.achromatopsia }
    ];
    
    // Adiciona as opções como botões
    const colorblindOptionsContainer = document.createElement('div');
    colorblindOptionsContainer.className = 'aguia-submenu-content';
    
    // Recupera os modos de daltonismo ativos
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
    
    colorblindOptions.forEach(option => {
        const optionButton = document.createElement('button');
        optionButton.className = 'aguia-submenu-option aguia-multi-select-option';
        optionButton.dataset.value = option.value;
        
        // Esvaziar o conteúdo do botão para garantir que não haja texto indefinido
        optionButton.innerHTML = '';
        
        // Criar elemento para o ícone
        const iconSpan = document.createElement('span');
        iconSpan.className = 'aguia-icon';
        iconSpan.innerHTML = option.iconSvg;
        optionButton.appendChild(iconSpan);
        
        // Criar elemento span para o texto
        const textSpan = document.createElement('span');
        textSpan.textContent = option.text;
        textSpan.className = 'option-text';
        optionButton.appendChild(textSpan);
        
        // Marca o botão como ativo se o modo estiver na lista de modos ativos
        if (option.value === 'none' && activeColorblindModes.length === 0) {
            optionButton.classList.add('active');
        } else if (option.value !== 'none' && activeColorblindModes.includes(option.value)) {
            optionButton.classList.add('active');
        }
        
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
            }
        });
        
        colorblindOptionsContainer.appendChild(optionButton);
    });
    
    colorblindPanel.appendChild(colorblindOptionsContainer);
    
    // Adiciona o painel ao documento
    document.body.appendChild(colorblindPanel);
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
