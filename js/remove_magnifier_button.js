/**
 * Script para gerenciar o botão da lupa
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Função auto-executável para evitar conflitos
(function() {
    /**
     * Configura o posicionamento do botão da lupa standalone
     */
    function setupMagnifierButton() {
        // Configura o botão da lupa standalone se existir
        const standaloneButton = document.getElementById('aguia-magnifier-standalone-button');
        if (standaloneButton) {
            standaloneButton.style.zIndex = '9999';
            standaloneButton.style.position = 'fixed';
            standaloneButton.style.bottom = '20px';
            standaloneButton.style.right = '20px';
        }
        
        // Configura os outros botões com ícone de lupa, se houver
        document.querySelectorAll('.aguia-standalone-button').forEach(function(button) {
            button.style.zIndex = '9999';
        });
    }
    
    // Executar a configuração quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', setupMagnifierButton);
    
    // Executar novamente após um breve atraso para garantir que todos os scripts tenham carregado
    setTimeout(setupMagnifierButton, 1000);
    
    // Executar periodicamente para configurar botões que possam ser adicionados dinamicamente
    setInterval(setupMagnifierButton, 2000);
})();
