/**
 * Script para remover o botão da lupa sem afetar a funcionalidade
 * 
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Função auto-executável para evitar conflitos
(function() {
    /**
     * Remove os botões da lupa da tela
     */
    function removeMagnifierButtons() {
        // Remover o botão da lupa standalone
        const standaloneButton = document.getElementById('aguia-magnifier-standalone-button');
        if (standaloneButton) {
            standaloneButton.style.display = 'none';
            standaloneButton.style.visibility = 'hidden';
            standaloneButton.style.opacity = '0';
            standaloneButton.style.pointerEvents = 'none';
        }
        
        // Se houver outros botões com ícone de lupa, também ocultar
        document.querySelectorAll('.aguia-standalone-button').forEach(function(button) {
            button.style.display = 'none';
            button.style.visibility = 'hidden';
            button.style.opacity = '0';
            button.style.pointerEvents = 'none';
        });
    }
    
    // Executar a remoção quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', removeMagnifierButtons);
    
    // Executar novamente após um breve atraso para garantir que todos os scripts tenham carregado
    setTimeout(removeMagnifierButtons, 1000);
    
    // Executar periodicamente para garantir que novos botões não sejam adicionados
    setInterval(removeMagnifierButtons, 2000);
})();
