/**
 * Correções de bugs específicos do VLibras
 * Este arquivo contém soluções para problemas comuns com a exibição do personagem
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('VLibras Bugfix: Inicializando correções para o VLibras');
    
    // Observador de mutações para detectar quando o container do VLibras é adicionado ao DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Verifica se o container do VLibras foi adicionado
            if (document.querySelector('.vw-container')) {
                console.log('VLibras Bugfix: Container do VLibras detectado');
                
                // Aplica as correções de CSS
                applyVLibrasFixedStyles();
                
                // Monitora o status do botão para sincronizar com o estado do widget
                monitorVLibrasButtonStatus();
                
                // Desconecta o observador, pois as correções já foram aplicadas
                observer.disconnect();
            }
        });
    });
    
    // Inicia a observação do DOM
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Adiciona eventos para lidar com problemas de visibilidade em elementos pai
    handleContainerVisibilityIssues();
});

/**
 * Aplica estilos CSS fixos para garantir a exibição correta do VLibras
 */
function applyVLibrasFixedStyles() {
    console.log('VLibras Bugfix: Aplicando estilos fixos');
    
    // Correções para o container do VLibras
    const vwContainer = document.querySelector('.vw-container');
    if (vwContainer) {
        vwContainer.style.zIndex = '9999';
        vwContainer.style.position = 'fixed';
        vwContainer.style.bottom = '0px';
        vwContainer.style.right = '0px';
        vwContainer.style.overflow = 'visible';
        
        // Adiciona um observador para garantir que esses estilos não sejam alterados
        const containerObserver = new MutationObserver(function() {
            vwContainer.style.zIndex = '9999';
            vwContainer.style.position = 'fixed';
            vwContainer.style.visibility = vwContainer.classList.contains('enabled') ? 'visible' : 'hidden';
            vwContainer.style.display = vwContainer.classList.contains('enabled') ? 'block' : 'none';
        });
        
        containerObserver.observe(vwContainer, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    // Correções para o plugin box
    const vwPluginBox = document.querySelector('.vw-plugin-box');
    if (vwPluginBox) {
        vwPluginBox.style.visibility = 'visible';
        
        // Adiciona um observador para garantir que esses estilos não sejam alterados
        const pluginBoxObserver = new MutationObserver(function() {
            const isEnabled = document.querySelector('.vw-container.enabled') !== null;
            vwPluginBox.style.visibility = isEnabled ? 'visible' : 'hidden';
            vwPluginBox.style.display = isEnabled ? 'block' : 'none';
        });
        
        pluginBoxObserver.observe(vwPluginBox, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
    
    // Correções para o box do avatar
    const vpBox = document.querySelector('.vp-box');
    if (vpBox) {
        vpBox.style.visibility = 'visible';
        vpBox.style.display = 'block';
        vpBox.style.opacity = '1';
        
        // Adiciona um observador para garantir que esses estilos não sejam alterados
        const vpBoxObserver = new MutationObserver(function() {
            const isEnabled = document.querySelector('.vw-container.enabled') !== null;
            vpBox.style.visibility = isEnabled ? 'visible' : 'hidden';
            vpBox.style.display = isEnabled ? 'block' : 'none';
            vpBox.style.opacity = isEnabled ? '1' : '0';
        });
        
        vpBoxObserver.observe(vpBox, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }
}

/**
 * Monitora o status do botão VLibras para sincronizar com o estado do widget
 */
function monitorVLibrasButtonStatus() {
    console.log('VLibras Bugfix: Monitorando status do botão VLibras');
    
    // Observador para o container do VLibras
    const vwContainer = document.querySelector('.vw-container');
    if (vwContainer) {
        const containerObserver = new MutationObserver(function() {
            const isEnabled = vwContainer.classList.contains('enabled');
            const vlibrasBtn = document.getElementById('aguia-vlibras-button');
            
            if (vlibrasBtn) {
                // Sincroniza o estado do botão com o estado do widget
                if (isEnabled && !vlibrasBtn.classList.contains('active')) {
                    vlibrasBtn.classList.add('active');
                    vlibrasBtn.setAttribute('aria-pressed', 'true');
                    localStorage.setItem('aguia_vlibras', 'true');
                } else if (!isEnabled && vlibrasBtn.classList.contains('active')) {
                    vlibrasBtn.classList.remove('active');
                    vlibrasBtn.setAttribute('aria-pressed', 'false');
                    localStorage.setItem('aguia_vlibras', 'false');
                }
            }
        });
        
        containerObserver.observe(vwContainer, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
}

/**
 * Trata problemas de visibilidade em elementos pai que podem afetar o VLibras
 */
function handleContainerVisibilityIssues() {
    console.log('VLibras Bugfix: Configurando tratamento de problemas de visibilidade');
    
    // Adiciona um observador para garantir que nenhum elemento pai esconda o VLibras
    const observer = new MutationObserver(function() {
        const vwContainer = document.querySelector('.vw-container.enabled');
        if (vwContainer) {
            // Garante que o container do VLibras está visível
            vwContainer.style.visibility = 'visible';
            vwContainer.style.display = 'block';
            vwContainer.style.zIndex = '9999';
            
            // Corrige qualquer elemento pai que possa estar escondendo o VLibras
            let parent = vwContainer.parentElement;
            while (parent && parent !== document.body) {
                const style = window.getComputedStyle(parent);
                if (style.display === 'none' || style.visibility === 'hidden' || 
                    style.opacity === '0' || parseInt(style.zIndex) < 0) {
                    
                    console.log('VLibras Bugfix: Corrigindo elemento pai com visibilidade comprometida');
                    parent.style.display = 'block';
                    parent.style.visibility = 'visible';
                    parent.style.opacity = '1';
                }
                
                parent = parent.parentElement;
            }
        }
    });
    
    // Observa mudanças no DOM para detectar quando o VLibras está ativo
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });
    
    // Verifica periodicamente o estado do VLibras (a cada 2 segundos)
    setInterval(function() {
        const vwContainer = document.querySelector('.vw-container.enabled');
        if (vwContainer) {
            const vpBox = document.querySelector('.vp-box');
            if (vpBox && (window.getComputedStyle(vpBox).visibility === 'hidden' || 
                         window.getComputedStyle(vpBox).display === 'none')) {
                
                console.log('VLibras Bugfix: Problema de visibilidade detectado, corrigindo...');
                vpBox.style.visibility = 'visible';
                vpBox.style.display = 'block';
                vpBox.style.opacity = '1';
            }
        }
    }, 2000);
}
