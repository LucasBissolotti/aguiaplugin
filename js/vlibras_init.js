/**
 * Funções de inicialização do VLibras
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * Inicializa o VLibras quando o plugin é carregado
 */
function initializeVLibras() {
    console.log('Inicializando VLibras no carregamento da página...');
    
    // Aguarda a API VLibras ser carregada, se ainda não estiver
    if (typeof initVLibras === 'function') {
        initVLibras();
        
        // Recupera o estado salvo
        const savedState = localStorage.getItem('aguia_vlibras');
        if (savedState === 'true') {
            // Ativa o VLibras após um pequeno delay para garantir que o widget foi carregado
            setTimeout(() => {
                if (typeof enableVLibras === 'function') {
                    console.log('Ativando VLibras baseado em preferências salvas');
                    enableVLibras();
                }
            }, 1500);
        }
    } else {
        console.error('Função initVLibras não encontrada.');
    }
}

/**
 * Função específica para a função de toggle do VLibras chamada pelo botão
 */
function toggleVLibras() {
    console.log('Botão de VLibras clicado. Verificando estado...');
    
    // Se a função de toggle não existir, carregamos a implementação
    if (typeof initVLibras !== 'function') {
        console.log('VLibras não está disponível. Carregando script...');
        
        // Adiciona o script do VLibras Integration se não existir
        const script = document.createElement('script');
        script.src = M.cfg.wwwroot + '/local/aguiaplugin/js/vlibras_integration.js';
        script.onload = function() {
            console.log('Script VLibras Integration carregado. Tentando ativar...');
            if (typeof toggleVLibras === 'function') {
                toggleVLibras();
            }
        };
        document.head.appendChild(script);
        return;
    }
    
    if (typeof window.toggleVLibrasState === 'function') {
        // Se temos a função específica do vlibras_integration.js
        window.toggleVLibrasState();
    } else {
        // Caso contrário, usamos nossa implementação alternativa
        console.log('Usando implementação alternativa do toggle VLibras');
        
        // Recuperar estado atual
        const currentState = localStorage.getItem('aguia_vlibras') === 'true';
        
        if (currentState) {
            if (typeof disableVLibras === 'function') {
                disableVLibras();
            }
        } else {
            if (typeof enableVLibras === 'function') {
                enableVLibras();
            }
        }
        
        // Atualizar botão manualmente
        const vLibrasBtn = document.getElementById('aguia-vlibras-button');
        if (vLibrasBtn) {
            if (!currentState) {
                vLibrasBtn.classList.add('active');
                vLibrasBtn.setAttribute('aria-pressed', 'true');
            } else {
                vLibrasBtn.classList.remove('active');
                vLibrasBtn.setAttribute('aria-pressed', 'false');
            }
        }
    }
}
