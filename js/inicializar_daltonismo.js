/**
 * Função para inicializar os modos de daltonismo a partir do localStorage
 * Suporta múltiplos modos simultâneos
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
function initializeColorblindModes() {
    // Tenta recuperar os modos salvos no localStorage
    let activeColorblindModes = [];
    try {
        const savedModes = localStorage.getItem('aguia_colorblind_modes');
        if (savedModes) {
            activeColorblindModes = JSON.parse(savedModes);
        } else {
            // Tenta usar o modo legado para compatibilidade
            const legacyMode = localStorage.getItem('aguia_colorblind');
            if (legacyMode && legacyMode !== 'none') {
                activeColorblindModes = [legacyMode];
            }
        }
    } catch (e) {
        console.error('Erro ao carregar os modos de daltonismo salvos:', e);
        activeColorblindModes = [];
    }

    // Se houver modos salvos, aplica-os
    // Remove modo descontinuado (achromatopsia), se existir
    activeColorblindModes = activeColorblindModes.filter(m => ['protanopia','deuteranopia','tritanopia'].includes(m));

    if (activeColorblindModes.length > 0) {
        setColorBlindModes(activeColorblindModes);
        
        // Atualiza a interface
        document.querySelectorAll('#aguiaColorblindPanel .aguia-submenu-option').forEach(btn => {
            if (btn.dataset.value === 'none') {
                btn.classList.remove('active');
            } else if (activeColorblindModes.includes(btn.dataset.value)) {
                btn.classList.add('active');
            }
        });
        
        // Ativa o botão principal
        const colorblindButton = document.getElementById('aguiaColorblindButton');
        if (colorblindButton) {
            colorblindButton.classList.add('active');
        }
    }
}
