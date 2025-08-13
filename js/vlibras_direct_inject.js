/**
 * Este script força a injeção direta do VLibras no DOM
 * para garantir que o personagem seja exibido corretamente
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('VLibras Direct Inject: Inicializando...');
    
    // Verifica se já existe um container do VLibras
    if (!document.getElementById('vlibras-container')) {
        // Cria o container do VLibras conforme documentação oficial
        const vLibrasContainer = document.createElement('div');
        vLibrasContainer.id = 'vlibras-container';
        document.body.appendChild(vLibrasContainer);
    }
    
    // Verifica se o script do VLibras já está carregado
    if (typeof VLibras !== 'undefined') {
        console.log('VLibras Direct Inject: VLibras já carregado');
        return;
    }
    
    // Função para verificar se o VLibras deve ser ativado automaticamente
    function checkVLibrasAutoEnable() {
        const savedState = localStorage.getItem('aguia_vlibras');
        if (savedState === 'true') {
            console.log('VLibras Direct Inject: Ativando VLibras conforme preferência');
            
            // Verifica se o botão do VLibras está disponível e clica nele
            const vLibrasBtn = document.querySelector('.vw-button.access-button');
            if (vLibrasBtn) {
                console.log('VLibras Direct Inject: Clicando no botão do VLibras');
                vLibrasBtn.click();
                
                // Atualiza estado do botão no menu AGUIA
                const aguiaBtn = document.getElementById('aguia-vlibras-button');
                if (aguiaBtn) {
                    aguiaBtn.classList.add('active');
                    aguiaBtn.setAttribute('aria-pressed', 'true');
                }
            } else {
                console.log('VLibras Direct Inject: Botão do VLibras não encontrado');
            }
        }
    }
    
    // Carrega o script do VLibras
    console.log('VLibras Direct Inject: Carregando script do VLibras...');
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.onload = function() {
        console.log('VLibras Direct Inject: Script carregado, inicializando widget...');
        
        try {
            // Inicializa o widget exatamente como na documentação oficial
            const widget = new window.VLibras.Widget({
                rootPath: 'https://vlibras.gov.br/app',
                personalization: true,
                showMessageBox: true,
                showWelcome: true,
                forceOnboarding: false
            });
            
            console.log('VLibras Direct Inject: Widget inicializado com sucesso');
            
            // Configura um temporizador para verificar quando o VLibras estiver pronto
            setTimeout(checkVLibrasAutoEnable, 2000);
        } catch (e) {
            console.error('VLibras Direct Inject: Erro ao inicializar o widget', e);
        }
    };
    
    script.onerror = function() {
        console.error('VLibras Direct Inject: Falha ao carregar o script');
    };
    
    document.head.appendChild(script);
});
