/**
 * Script para aplicar a classe CSS unificada ao botão de texto por fala
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

document.addEventListener("DOMContentLoaded", function() {
    // Adicionar a classe unificada ao botão de texto por fala
    const btnTextoFala = document.getElementById("aguiaTextToSpeechBtn");
    if (btnTextoFala) {
        btnTextoFala.classList.add("icone-texto-fala");
        console.log("Classe 'icone-texto-fala' aplicada ao botão de texto por fala");
    }

    // Garantir que o botão mantenha a classe em todos os estados
    btnTextoFala?.addEventListener("mouseenter", function() {
        this.classList.add("icone-texto-fala");
    });
    
    btnTextoFala?.addEventListener("mouseleave", function() {
        this.classList.add("icone-texto-fala");
    });
    
    btnTextoFala?.addEventListener("click", function() {
        this.classList.add("icone-texto-fala");
    });
    
    // Verificação periódica para garantir que a classe permaneça aplicada
    setInterval(function() {
        const btn = document.getElementById("aguiaTextToSpeechBtn");
        if (btn && !btn.classList.contains("icone-texto-fala")) {
            btn.classList.add("icone-texto-fala");
        }
    }, 1000); // Verificar a cada segundo
});