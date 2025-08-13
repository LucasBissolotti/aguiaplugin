/**
 * Integração do VLibras com o plugin AGUIA de Acessibilidade
 * Implementação baseada na documentação oficial do VLibras gov.br
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Estado do VLibras
let vLibrasEnabled = false;
let vLibrasLoaded = false;
let vLibrasWidget = null;

/**
 * Inicializa o VLibras seguindo exatamente a implementação do gov.br
 */
function initVLibras() {
    console.log('Iniciando carregamento do VLibras...');
    
    // Cria os elementos necessários para o VLibras conforme documentação oficial
    if (!document.getElementById('vlibras-container')) {
        const vLibrasContainer = document.createElement('div');
        vLibrasContainer.id = 'vlibras-container';
        document.body.appendChild(vLibrasContainer);
    }
    
    // Verifica se o script já foi carregado
    if (window.VLibras) {
        console.log('VLibras já está carregado, inicializando widget...');
        initVLibrasWidget();
        return;
    }
    
    // Adiciona o script do VLibras do governo brasileiro
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.onload = function() {
        console.log('Script VLibras carregado com sucesso');
        initVLibrasWidget();
    };
    
    script.onerror = function() {
        console.error('Falha ao carregar o script do VLibras');
        showStatusMessage('Não foi possível carregar o VLibras', 'error');
    };
    
    document.head.appendChild(script);
}

/**
 * Inicializa o widget do VLibras após o carregamento do script
 */
function initVLibrasWidget() {
    try {
        // Inicializa o widget exatamente como na documentação oficial do gov.br
        vLibrasWidget = new window.VLibras.Widget({
            rootPath: 'https://vlibras.gov.br/app',
            personalization: true,
            showMessageBox: true,
            showWelcome: true,
            forceOnboarding: false
        });
        vLibrasLoaded = true;
        console.log('Widget VLibras inicializado com sucesso');
        
        // Se o usuário já tinha ativado antes, ativa o widget automaticamente
        const savedState = localStorage.getItem('aguia_vlibras');
        if (savedState === 'true') {
            setTimeout(function() {
                console.log('Ativando VLibras conforme preferência salva');
                enableVLibras();
            }, 1500); // Delay maior para garantir carregamento completo
        }
    } catch (e) {
        console.error('Erro ao inicializar o widget VLibras:', e);
    }
}

/**
 * Habilita o widget do VLibras - aciona o botão nativo do widget
 */
function enableVLibras() {
    if (!vLibrasLoaded) {
        console.log('VLibras não carregado, iniciando carregamento...');
        initVLibras();
        
        // Configura um temporizador para tentar habilitar após o carregamento
        setTimeout(function() {
            if (vLibrasLoaded) {
                console.log('Tentando habilitar VLibras após carregamento...');
                enableVLibras();
            }
        }, 2000);
        return;
    }
    
    try {
        console.log('Tentando ativar o widget VLibras...');
        
        // Método direto usando a API do VLibras - implementação oficial do gov.br
        if (vLibrasWidget && typeof vLibrasWidget.showWidget === 'function') {
            console.log('Chamando método showWidget() da API oficial...');
            vLibrasWidget.showWidget();
            
            // Força a exibição do avatar após mostrar o widget
            setTimeout(function() {
                if (typeof vLibrasWidget.translationOn === 'function') {
                    console.log('Ativando tradução do VLibras...');
                    vLibrasWidget.translationOn();
                }
                
                // Força a visibilidade dos elementos do VLibras
                const vwContainer = document.querySelector('.vw-container');
                if (vwContainer) {
                    vwContainer.classList.add('enabled');
                    vwContainer.style.display = 'block';
                    vwContainer.style.visibility = 'visible';
                }
                
                const vwPluginBox = document.querySelector('.vw-plugin-box');
                if (vwPluginBox) {
                    vwPluginBox.style.display = 'block';
                    vwPluginBox.style.visibility = 'visible';
                }
            }, 500);
            
            vLibrasEnabled = true;
            updateVLibrasButton();
            saveVLibrasState(true);
            return;
        }
        
        // Alternativa: buscar elemento do VLibras e interagir com ele
        const vLibrasBtn = document.querySelector('.vw-button.access-button');
        if (vLibrasBtn) {
            console.log('Clicando no botão de acesso do VLibras...');
            vLibrasBtn.click();
            vLibrasEnabled = true;
            updateVLibrasButton();
            saveVLibrasState(true);
            return;
        }
        
        // Segunda alternativa: tentar através do elemento interno
        const vwPlugin = document.querySelector('.vw-plugin');
        if (vwPlugin && typeof vwPlugin.settingsOpen === 'function') {
            console.log('Abrindo plugin do VLibras via elemento interno...');
            vwPlugin.settingsOpen();
            vLibrasEnabled = true;
            updateVLibrasButton();
            saveVLibrasState(true);
            return;
        }
        
        // Terceira alternativa: forçar a exibição via CSS
        console.log('Tentando forçar exibição via CSS...');
        const vwContainer = document.querySelector('.vw-container');
        if (vwContainer) {
            vwContainer.classList.add('enabled');
            vwContainer.style.display = 'block';
            const vwPluginBox = document.querySelector('.vw-plugin-box');
            if (vwPluginBox) {
                vwPluginBox.style.display = 'block';
            }
            vLibrasEnabled = true;
            updateVLibrasButton();
            saveVLibrasState(true);
            return;
        }
        
        console.error('Não foi possível encontrar elementos do VLibras para ativar');
    } catch (e) {
        console.error('Erro ao ativar o VLibras:', e);
    }
}

/**
 * Desabilita o widget do VLibras
 */
function disableVLibras() {
    try {
        console.log('Tentando desativar o widget VLibras...');
        
        // Método direto usando a API do VLibras
        if (vLibrasWidget && typeof vLibrasWidget.hideWidget === 'function') {
            console.log('Chamando método hideWidget()...');
            vLibrasWidget.hideWidget();
            vLibrasEnabled = false;
            updateVLibrasButton();
            saveVLibrasState(false);
            return;
        }
        
        // Alternativa: buscar elemento do VLibras e interagir com ele
        const closeBtn = document.querySelector('.vw-btn-close-windows');
        if (closeBtn) {
            console.log('Clicando no botão de fechar do VLibras...');
            closeBtn.click();
            vLibrasEnabled = false;
            updateVLibrasButton();
            saveVLibrasState(false);
            return;
        }
        
        // Forçar via CSS
        const vwContainer = document.querySelector('.vw-container');
        if (vwContainer) {
            vwContainer.classList.remove('enabled');
            vwContainer.style.display = 'none';
            const vwPluginBox = document.querySelector('.vw-plugin-box');
            if (vwPluginBox) {
                vwPluginBox.style.display = 'none';
            }
            vLibrasEnabled = false;
            updateVLibrasButton();
            saveVLibrasState(false);
            return;
        }
        
        console.log('Não foi possível encontrar elementos do VLibras para desativar');
    } catch (e) {
        console.error('Erro ao desativar o VLibras:', e);
    }
}

/**
 * Salva o estado do VLibras nas preferências do usuário
 */
function saveVLibrasState(isEnabled) {
    vLibrasEnabled = isEnabled;
    localStorage.setItem('aguia_vlibras', isEnabled ? 'true' : 'false');
    saveUserPreference('vlibras', isEnabled);
    
    if (isEnabled) {
        showStatusMessage('Tradutor de LIBRAS ativado', 'success');
    } else {
        showStatusMessage('Tradutor de LIBRAS desativado', 'success');
    }
}

/**
 * Atualiza a aparência do botão do VLibras conforme o estado
 */
function updateVLibrasButton() {
    console.log('Atualizando botão do VLibras para o estado:', vLibrasEnabled);
    
    // Encontra o botão do VLibras no painel de acessibilidade - tenta os dois IDs possíveis
    const vLibrasButton = document.getElementById('aguia-vlibras-button') || document.getElementById('aguiaVLibrasBtn');
    if (!vLibrasButton) {
        console.log('Botão do VLibras não encontrado no DOM');
        return;
    }
    
    console.log('Botão do VLibras encontrado, atualizando estado visual');
    
    if (vLibrasEnabled) {
        vLibrasButton.classList.add('active');
        vLibrasButton.setAttribute('aria-pressed', 'true');
    } else {
        vLibrasButton.classList.remove('active');
        vLibrasButton.setAttribute('aria-pressed', 'false');
    }
}

/**
 * Alterna o estado do VLibras (liga/desliga)
 */
function toggleVLibrasState() {
    if (!vLibrasLoaded) {
        console.log('VLibras não está carregado, iniciando carregamento...');
        initVLibras();
        
        // Configurar um temporizador para verificar quando estiver carregado
        const checkInterval = setInterval(function() {
            if (vLibrasLoaded) {
                clearInterval(checkInterval);
                toggleVLibrasState();
            }
        }, 1000);
        
        return;
    }
    
    console.log('Alternando estado do VLibras. Estado atual:', vLibrasEnabled);
    
    if (vLibrasEnabled) {
        disableVLibras();
    } else {
        enableVLibras();
    }
}

// Expõe a função para uso global
window.toggleVLibrasState = toggleVLibrasState;

/**
 * Verifica se o widget do VLibras está visível/aberto
 */
function isVLibrasOpen() {
    const vwContainer = document.querySelector('.vw-container');
    if (!vwContainer) return false;
    
    // Verifica se está visível por CSS
    const isVisible = 
        window.getComputedStyle(vwContainer).display !== 'none' && 
        vwContainer.classList.contains('enabled');
    
    // Verifica se o plugin box está visível
    const vwPluginBox = document.querySelector('.vw-plugin-box');
    const isPluginBoxVisible = vwPluginBox && 
                              window.getComputedStyle(vwPluginBox).display !== 'none';
    
    return isVisible || isPluginBoxVisible;
}

/**
 * Desabilita o widget do VLibras
 */
function disableVLibras() {
    if (!vLibrasLoaded) return;
    
    try {
        // Busca o botão nativo do VLibras e clica nele para desativar o widget se estiver aberto
        if (isVLibrasOpen()) {
            const vLibrasButton = document.getElementById('vlibras-btn');
            if (vLibrasButton) {
                vLibrasButton.click(); // Fecha o widget oficial
            }
        }
        
        // Atualiza o estado e o botão
        vLibrasEnabled = false;
        updateVLibrasButton();
        
        // Salva a preferência
        localStorage.setItem('aguia_vlibras', 'false');
        saveUserPreference('vlibras', false);
        
        showStatusMessage('Tradutor de LIBRAS desativado');
    } catch (e) {
        console.error('Erro ao desativar o VLibras:', e);
    }
}

/**
 * Verifica se o widget do VLibras está aberto
 */
function isVLibrasOpen() {
    // O VLibras adiciona a classe 'enabled' ao elemento raiz quando está ativo
    const vw = document.querySelector('.vw-container');
    return vw && vw.classList.contains('enabled');
}

/**
 * Alterna o estado do VLibras
 */
function toggleVLibras() {
    if (vLibrasEnabled) {
        disableVLibras();
    } else {
        enableVLibras();
    }
}

/**
 * Atualiza a aparência do botão de VLibras
 */
function updateVLibrasButton() {
    const button = document.getElementById('aguiaVLibrasBtn');
    if (button) {
        if (vLibrasEnabled) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    }
}

/**
 * Função chamada ao inicializar o plugin para verificar se precisa carregar o VLibras
 */
function initializeVLibras() {
    // Verifica se o VLibras estava habilitado
    const savedState = localStorage.getItem('aguia_vlibras');
    
    // Sempre inicializa o VLibras para garantir o carregamento do personagem
    initVLibras();
    
    // Se estava ativado, vai habilitar quando o widget estiver pronto
    if (savedState === 'true') {
        vLibrasEnabled = true;
    }
}
