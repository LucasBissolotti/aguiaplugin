/**
 * Script para corrigir problemas de exibição no plugin AGUIA
 * Remove elementos indesejados que aparecem na tela
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

(function() {
    // Função para remover elementos indesejados que estão aparecendo na tela
    function removeUnwantedElements() {
        // Busca por elementos de texto sem container adequado
        const bodyChildren = document.body.childNodes;
        
        bodyChildren.forEach(node => {
            // Verificar se é um nó de texto diretamente no body
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text.includes('Ferramentas de Acessibilidade') || 
                    text.includes('Lupa de Conteúdo')) {
                    node.parentNode.removeChild(node);
                }
            }
            
            // Verificar elementos inline não controlados
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (!(node.id && 
                     (node.id.includes('aguia') || 
                      node.classList && node.classList.contains('aguia')))) {
                    
                    const text = node.textContent.trim();
                    if (text === 'Ferramentas de Acessibilidade' || 
                        text === 'Lupa de Conteúdo') {
                        if (!node.id.includes('aguia-menu-panel')) {
                            node.style.display = 'none';
                        }
                    }
                }
            }
        });

        // Ocultar elementos específicos indesejados
        const elements = [
            document.querySelector('h1:not([id]):not([class])'), 
            document.querySelector('h2:not([id]):not([class])'),
            document.querySelector('h3:not([id]):not([class])')
        ];
        
        elements.forEach(el => {
            if (el && (el.textContent.includes('Ferramentas de Acessibilidade') || 
                      el.textContent.includes('Lupa de Conteúdo'))) {
                el.style.display = 'none';
            }
        });
        
        // Garantir que os botões estejam ocultos inicialmente
        const possibleIssueContainers = document.querySelectorAll('div:not([id]):not([class])');
        possibleIssueContainers.forEach(container => {
            if (container.textContent.trim() === 'Ferramentas de Acessibilidade' || 
                container.textContent.trim().includes('Lupa de Conteúdo')) {
                container.style.display = 'none';
            }
        });
    }

    // Verificar e remover elementos indesejados quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', function() {
        // Executar imediatamente
        removeUnwantedElements();
        
        // Executar novamente após um curto intervalo para garantir
        setTimeout(removeUnwantedElements, 100);
        setTimeout(removeUnwantedElements, 500);
    });
    
    // Também executar quando a página terminar de carregar
    window.addEventListener('load', removeUnwantedElements);
})();
