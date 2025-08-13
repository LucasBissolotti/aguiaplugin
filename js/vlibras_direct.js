/**
 * Implementação direta do VLibras para o plugin AGUIA
 * Este arquivo garante a exibição do personagem do VLibras ao clicar no botão
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando implementação direta do VLibras...');
    
    // Adiciona o container do VLibras se não existir
    if (!document.getElementById('vlibras-container')) {
        const container = document.createElement('div');
        container.id = 'vlibras-container';
        document.body.appendChild(container);
        console.log('Container VLibras criado');
    }
    
    // Carrega o script do VLibras
    if (!window.VLibras) {
        const script = document.createElement('script');
        script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
        script.onload = function() {
            console.log('Script VLibras carregado com sucesso');
            initializeVLibrasWidget();
        };
        document.head.appendChild(script);
    } else {
        console.log('VLibras já carregado');
        initializeVLibrasWidget();
    }
    
    // Adiciona o evento de clique ao botão VLibras no menu
    const button = document.getElementById('aguia-vlibras-button');
    if (button) {
        console.log('Adicionando evento de clique ao botão VLibras');
        button.addEventListener('click', toggleVLibrasNow);
    } else {
        // Se o botão ainda não existir, configura um observador para esperar sua criação
        const observer = new MutationObserver(function(mutations) {
            const vlibrasBtn = document.getElementById('aguia-vlibras-button');
            if (vlibrasBtn) {
                console.log('Botão VLibras encontrado, adicionando evento de clique');
                vlibrasBtn.addEventListener('click', toggleVLibrasNow);
                observer.disconnect();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});

/**
 * Inicializa o widget VLibras
 */
function initializeVLibrasWidget() {
    try {
        if (!window.vLibrasWidget && window.VLibras) {
            console.log('Inicializando widget VLibras');
            window.vLibrasWidget = new window.VLibras.Widget({
                rootPath: 'https://vlibras.gov.br/app',
                personalization: true,
                showMessageBox: true,
                showWelcome: true
            });
            window.vLibrasLoaded = true;
            
            // Verifica se deve mostrar o widget baseado nas preferências salvas
            const savedState = localStorage.getItem('aguia_vlibras');
            if (savedState === 'true') {
                setTimeout(function() {
                    showVLibrasWidget();
                }, 1000);
            }
        }
    } catch (error) {
        console.error('Erro ao inicializar widget VLibras:', error);
    }
}

/**
 * Alterna o estado do VLibras - essa função é chamada diretamente pelo botão
 */
function toggleVLibrasNow() {
    console.log('Toggle VLibras acionado pelo botão');
    
    // Verifica estado atual
    const isActive = document.querySelector('.vw-container.enabled') !== null ||
                    localStorage.getItem('aguia_vlibras') === 'true';
    
    if (isActive) {
        hideVLibrasWidget();
    } else {
        showVLibrasWidget();
    }
    
    return false; // Evita propagação do evento
}

/**
 * Mostra o widget do VLibras
 */
function showVLibrasWidget() {
    console.log('Mostrando widget VLibras');
    
    // Garante que o VLibras foi carregado
    if (!window.vLibrasLoaded) {
        if (!window.VLibras) {
            console.log('VLibras não carregado, inicializando...');
            const script = document.createElement('script');
            script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
            script.onload = function() {
                console.log('Script VLibras carregado, tentando mostrar widget...');
                initializeVLibrasWidget();
                setTimeout(showVLibrasWidget, 1000);
            };
            document.head.appendChild(script);
            return;
        } else {
            initializeVLibrasWidget();
            setTimeout(showVLibrasWidget, 1000);
            return;
        }
    }
    
    try {
        // Tenta usar a API do VLibras para mostrar o widget
        if (window.vLibrasWidget && typeof window.vLibrasWidget.showWidget === 'function') {
            console.log('Usando API do VLibras para mostrar widget');
            window.vLibrasWidget.showWidget();
            
            // Força a exibição do personagem
            setTimeout(function() {
                console.log('Forçando exibição do personagem');
                
                // Força elementos visíveis
                const vwContainer = document.querySelector('.vw-container');
                if (vwContainer) {
                    vwContainer.classList.add('enabled');
                    vwContainer.style.display = 'block';
                    vwContainer.style.visibility = 'visible';
                    vwContainer.style.opacity = '1';
                    vwContainer.style.zIndex = '9999';
                }
                
                const vwPluginBox = document.querySelector('.vw-plugin-box');
                if (vwPluginBox) {
                    vwPluginBox.style.display = 'block';
                    vwPluginBox.style.visibility = 'visible';
                    vwPluginBox.style.opacity = '1';
                }
                
                // Força exibição do box do avatar
                const vpBox = document.querySelector('.vp-box');
                if (vpBox) {
                    vpBox.style.display = 'block';
                    vpBox.style.visibility = 'visible';
                    vpBox.style.opacity = '1';
                    vpBox.style.zIndex = '10000';
                }
                
                // Força exibição dos controles do avatar
                const vpControls = document.querySelector('.vp-box .vp-controls');
                if (vpControls) {
                    vpControls.style.display = 'block';
                    vpControls.style.visibility = 'visible';
                    vpControls.style.opacity = '1';
                }
                
                // Força exibição da caixa de mensagem
                const vpMessageBox = document.querySelector('.vp-box .vp-message-box');
                if (vpMessageBox) {
                    vpMessageBox.style.display = 'block';
                    vpMessageBox.style.visibility = 'visible';
                    vpMessageBox.style.opacity = '1';
                }
                
                // Verifica se há um iframe e ajusta sua visibilidade
                const vLibrasIframe = document.querySelector('#vlibras iframe');
                if (vLibrasIframe) {
                    vLibrasIframe.style.display = 'block';
                    vLibrasIframe.style.visibility = 'visible';
                    vLibrasIframe.style.opacity = '1';
                }
                
                // Tenta mostrar o widget através do método da API, se disponível
                if (window.vLibrasWidget && typeof window.vLibrasWidget.setVisible === 'function') {
                    console.log('Usando API setVisible para mostrar widget');
                    window.vLibrasWidget.setVisible(true);
                }
                
                // Ativa o botão no menu AGUIA
                const vlibrasBtn = document.getElementById('aguia-vlibras-button');
                if (vlibrasBtn) {
                    vlibrasBtn.classList.add('active');
                    vlibrasBtn.setAttribute('aria-pressed', 'true');
                }
                
                // Salva o estado
                localStorage.setItem('aguia_vlibras', 'true');
                if (typeof saveUserPreference === 'function') {
                    saveUserPreference('vlibras', true);
                }
                
                // Verifica se a inicialização foi completa após um tempo
                setTimeout(function() {
                    const isVisible = document.querySelector('.vw-container.enabled') !== null;
                    if (!isVisible) {
                        console.log('VLibras ainda não visível, tentando forçar novamente...');
                        
                        // Última tentativa usando o evento de clique oficial
                        const accessBtn = document.querySelector('.vw-button.access-button');
                        if (accessBtn) {
                            console.log('Clicando no botão de acesso do VLibras como última alternativa');
                            accessBtn.click();
                        }
                    }
                }, 1000);
            }, 300);
        } else {
            // Tenta alternativas para mostrar o widget
            console.log('API do VLibras não disponível, tentando alternativas');
            
            const accessBtn = document.querySelector('.vw-button.access-button');
            if (accessBtn) {
                console.log('Clicando no botão de acesso do VLibras');
                accessBtn.click();
                
                // Atualiza o botão no menu AGUIA
                const vlibrasBtn = document.getElementById('aguia-vlibras-button');
                if (vlibrasBtn) {
                    vlibrasBtn.classList.add('active');
                    vlibrasBtn.setAttribute('aria-pressed', 'true');
                }
                
                // Salva o estado
                localStorage.setItem('aguia_vlibras', 'true');
                if (typeof saveUserPreference === 'function') {
                    saveUserPreference('vlibras', true);
                }
                
                // Adiciona verificação adicional para garantir a visibilidade
                setTimeout(function() {
                    const vwContainer = document.querySelector('.vw-container');
                    if (vwContainer) {
                        vwContainer.classList.add('enabled');
                        vwContainer.style.display = 'block';
                        vwContainer.style.visibility = 'visible';
                    }
                }, 500);
            } else {
                console.log('Botão de acesso do VLibras não encontrado, tentando reinicializar');
                
                // Tenta reinicializar o VLibras como último recurso
                initializeVLibrasWidget();
                setTimeout(showVLibrasWidget, 1500);
            }
        }
    } catch (error) {
        console.error('Erro ao mostrar widget VLibras:', error);
    }
}

/**
 * Esconde o widget do VLibras
 */
function hideVLibrasWidget() {
    console.log('Escondendo widget VLibras');
    
    try {
        // Tenta usar a API do VLibras para esconder o widget
        if (window.vLibrasWidget && typeof window.vLibrasWidget.hideWidget === 'function') {
            console.log('Usando API do VLibras para esconder widget');
            window.vLibrasWidget.hideWidget();
        } else {
            // Tenta alternativas para esconder o widget
            console.log('API do VLibras não disponível, tentando alternativas');
            
            const closeBtn = document.querySelector('.vw-btn-close-windows');
            if (closeBtn) {
                console.log('Clicando no botão de fechar do VLibras');
                closeBtn.click();
            } else {
                // Força ocultação via CSS
                const vwContainer = document.querySelector('.vw-container');
                if (vwContainer) {
                    vwContainer.classList.remove('enabled');
                    vwContainer.style.display = 'none';
                }
                
                const vwPluginBox = document.querySelector('.vw-plugin-box');
                if (vwPluginBox) {
                    vwPluginBox.style.display = 'none';
                }
            }
        }
        
        // Atualiza o botão no menu AGUIA
        const vlibrasBtn = document.getElementById('aguia-vlibras-button');
        if (vlibrasBtn) {
            vlibrasBtn.classList.remove('active');
            vlibrasBtn.setAttribute('aria-pressed', 'false');
        }
        
        // Salva o estado
        localStorage.setItem('aguia_vlibras', 'false');
        if (typeof saveUserPreference === 'function') {
            saveUserPreference('vlibras', false);
        }
    } catch (error) {
        console.error('Erro ao esconder widget VLibras:', error);
    }
}
