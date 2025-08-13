/**
 * Script auxiliar para monitorar o estado do VLibras
 * e sincronizar com nosso botão de acessibilidade
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Inicia o monitoramento quando a página estiver pronta
document.addEventListener('DOMContentLoaded', function() {
    // Inicia o monitoramento do estado do VLibras
    startVLibrasMonitoring();
});

/**
 * Inicia o monitoramento do estado do VLibras
 * para sincronizar com o botão do nosso menu
 */
function startVLibrasMonitoring() {
    console.log('VLibras Monitor: Inicializando monitoramento');
    
    // Verifica a cada 2 segundos se o estado do VLibras mudou
    setInterval(function() {
        if (typeof vLibrasEnabled !== 'undefined' && typeof isVLibrasOpen === 'function') {
            const isOpen = isVLibrasOpen();
            
            // Se o estado atual não corresponde ao estado do widget
            if (vLibrasEnabled !== isOpen) {
                console.log('VLibras Monitor: Estado alterado de', vLibrasEnabled, 'para', isOpen);
                vLibrasEnabled = isOpen;
                updateVLibrasButton();
                
                // Atualiza a preferência
                localStorage.setItem('aguia_vlibras', isOpen ? 'true' : 'false');
                if (typeof saveUserPreference === 'function') {
                    saveUserPreference('vlibras', isOpen);
                }
            }
        }
    }, 1000);
    
    // Adiciona um observador para detectar quando o widget é fechado pelo botão nativo
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                mutation.target.classList && 
                mutation.target.classList.contains('vw-container')) {
                
                console.log('VLibras Monitor: Detectada mudança no container do VLibras');
                const isOpen = mutation.target.classList.contains('enabled');
                if (typeof vLibrasEnabled !== 'undefined' && vLibrasEnabled !== isOpen) {
                    console.log('VLibras Monitor: Estado do container alterado para', isOpen);
                    vLibrasEnabled = isOpen;
                    updateVLibrasButton();
                    
                    // Atualiza a preferência
                    localStorage.setItem('aguia_vlibras', isOpen ? 'true' : 'false');
                    if (typeof saveUserPreference === 'function') {
                        saveUserPreference('vlibras', isOpen);
                    }
                }
            }
        });
    });
    
    // Observa modificações no corpo do documento para detectar quando o VLibras é inicializado
    const bodyObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    // Verifica se o elemento adicionado é relacionado ao VLibras
                    if (node.nodeType === 1 && 
                        (node.classList && 
                         (node.classList.contains('vw-plugin') || 
                          node.classList.contains('vw-container') ||
                          node.id === 'vlibras-btn'))) {
                        
                        console.log('VLibras Monitor: Detectado elemento do VLibras:', node);
                        
                        // Configura o observador para o container do VLibras
                        if (node.classList.contains('vw-container')) {
                            observer.observe(node, { attributes: true });
                            
                            // Força a visibilidade do widget após adicionado ao DOM
                            setTimeout(function() {
                                node.style.display = 'block';
                                node.style.visibility = 'visible';
                                
                                // Se o widget deveria estar aberto, força sua abertura
                                const savedState = localStorage.getItem('aguia_vlibras');
                                if (savedState === 'true' && typeof enableVLibras === 'function') {
                                    console.log('VLibras Monitor: Forçando abertura do widget');
                                    enableVLibras();
                                }
                            }, 500);
                        }
                    }
                });
            }
        });
        
        // Verifica se o container do VLibras já existe no DOM
        const vwContainer = document.querySelector('.vw-container');
        if (vwContainer) {
            console.log('VLibras Monitor: Container VLibras já existe, configurando observador');
            observer.observe(vwContainer, { attributes: true });
        }
    });
    
    // Inicia a observação do corpo
    bodyObserver.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
    
    // Força uma verificação inicial do estado e da presença do VLibras
    setTimeout(function() {
        // Verifica se o VLibras está presente e visível
        const vwContainer = document.querySelector('.vw-container');
        if (vwContainer) {
            console.log('VLibras Monitor: Container VLibras encontrado, verificando estado');
            
            // Configurar observador para o container
            observer.observe(vwContainer, { attributes: true });
            
            // Verifica o estado atual
            const isOpen = isVLibrasOpen && isVLibrasOpen();
            
            // Se o widget está visível, mas o estado não reflete isso
            if (isOpen && typeof vLibrasEnabled !== 'undefined' && !vLibrasEnabled) {
                console.log('VLibras Monitor: Widget está visível, atualizando estado');
                vLibrasEnabled = true;
                updateVLibrasButton();
            }
            
            // Se o container existe, mas o estado salvo indica que deve estar ativo
            const savedState = localStorage.getItem('aguia_vlibras') === 'true';
            if (savedState && !isOpen && typeof enableVLibras === 'function') {
                console.log('VLibras Monitor: Widget deveria estar ativo, ativando...');
                enableVLibras();
            }
        }
    }, 3000); // Aguarda um tempo para garantir que o VLibras foi carregado completamente
}
