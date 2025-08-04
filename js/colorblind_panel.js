/**
 * Plugin AGUIA de Acessibilidade
 * Módulo para gerenciamento das funcionalidades de daltonismo
 * 
 * @module     local_aguiaplugin/colorblind_panel
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

document.addEventListener('DOMContentLoaded', function() {
    // Adiciona o painel de daltonismo ao DOM
    createColorblindPanel();
    
    // Recupera as preferências salvas
    const savedColorblindMode = getFromLocalStorage('aguia_colorblind', 'none');
    if (savedColorblindMode !== 'none') {
        setColorBlindMode(savedColorblindMode);
    }
});

// Função para criar o painel de daltonismo
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
        if (option.value === window.colorBlindMode) {
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
    const value = localStorage.getItem(key);
    return value !== null ? value : defaultValue;
}
