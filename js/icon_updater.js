/**
 * Script para atualizar ícones no plugin AGUIA
 * Garante que os ícones SVG são aplicados corretamente e substitui os emojis problemáticos
 */
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda o carregamento completo do DOM e do plugin AGUIA
    setTimeout(function() {
        // Atualiza os ícones dos botões
        updateButtonIcons();
    }, 1000); // Espera 1 segundo após o carregamento do DOM
    
    function updateButtonIcons() {
        // Associação de IDs de botões aos seus ícones correspondentes
        const iconMapping = {
            'aguiaReadingMaskCursorBtn': AguiaIcons.focusMask,
            'aguiaCustomCursorBtn': AguiaIcons.customCursor,
            'aguiaHideImagesBtn': AguiaIcons.hideImages,
            'aguiaReadingGuideBtn': AguiaIcons.readingGuide,
            'aguiaTextToSpeechBtn': AguiaIcons.textToSpeech,
            'aguiaResetBtn': AguiaIcons.reset,
            'aguiaContrastBtn': AguiaIcons.contrast,
            'aguiaInvertBtn': AguiaIcons.invertColors,
            'aguiaColorBlindBtn': AguiaIcons.colorblind,
            'aguiaFontIncreaseBtn': AguiaIcons.increaseText,
            'aguiaReadableFontsBtn': AguiaIcons.readableFont,
            'aguiaSpacingBtn': AguiaIcons.spacing,
            'aguiaEmphasizeLinksBtn': AguiaIcons.emphasizeLinks
        };
        
        // Aplica os ícones SVG para cada botão
        for (const [buttonId, icon] of Object.entries(iconMapping)) {
            const button = document.getElementById(buttonId);
            if (button) {
                const iconSpan = button.querySelector('.icon');
                if (iconSpan) {
                    iconSpan.innerHTML = icon;
                }
            }
        }
        
        // Verifica o estado atual das funcionalidades e aplica a classe 'active' se necessário
        if (document.body.classList.contains('aguia-reading-mask-horizontal') || 
            document.body.classList.contains('aguia-reading-mask-vertical')) {
            const maskBtn = document.getElementById('aguiaReadingMaskCursorBtn');
            if (maskBtn) maskBtn.classList.add('active');
        }
        
        if (document.body.classList.contains('aguia-custom-cursor')) {
            const cursorBtn = document.getElementById('aguiaCustomCursorBtn');
            if (cursorBtn) cursorBtn.classList.add('active');
        }
    }
});
