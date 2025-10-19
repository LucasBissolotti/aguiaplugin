/**
 * Script para atualizar ícones no plugin AGUIA
 * Garante que os ícones SVG são aplicados corretamente
 */
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda o carregamento completo do DOM e do plugin AGUIA
    setTimeout(function() {
        // Atualiza os ícones dos botões
        updateButtonIcons();
    }, 1000); // Espera 1 segundo após o carregamento do DOM
    
    function updateButtonIcons() {
        // Determinar ícone correto para Fontes Legíveis baseado no modo salvo (0/1/2)
        let readableIconForMode = AguiaIcons.fontSingleA;
        try {
            const savedMode = parseInt(localStorage.getItem('fontMode') || '0', 10);
            if (savedMode === 1 && AguiaIcons.fontAaSample) {
                readableIconForMode = AguiaIcons.fontAaSample;
            } else if (savedMode === 2 && AguiaIcons.fontAaOpenDyslexic) {
                readableIconForMode = AguiaIcons.fontAaOpenDyslexic;
            }
        } catch (e) {
        }
        // Associação de IDs de botões aos seus ícones correspondentes
        const iconMapping = {
            'aguiaHorizontalMaskBtn': AguiaIcons.focusMaskHorizontal,
            'aguiaVerticalMaskBtn': AguiaIcons.focusMaskVertical,
            'aguiaCustomCursorBtn': AguiaIcons.customCursor,
            'aguiaHideImagesBtn': AguiaIcons.hideImages,
            'aguiaReadingGuideBtn': AguiaIcons.readingGuide,
            'aguiaTextToSpeechBtn': AguiaIcons.textToSpeech,
            'aguiaResetBtn': AguiaIcons.reset,
            'aguiaContrastBtn': AguiaIcons.contrast,
            'aguiaInvertBtn': AguiaIcons.invertColors,
            'aguiaColorBlindBtn': AguiaIcons.colorblind,
            'aguiaMagnifierBtn': AguiaIcons.magnifier,
            'aguiaIncreaseFontBtn': AguiaIcons.increaseText,
            'aguiaReadableFontsBtn': readableIconForMode,
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
        const scope = document.getElementById('page') || document.querySelector('#page-content') || document.querySelector('main') || document.body;
        if (scope.classList.contains('aguia-reading-mask-horizontal')) {
            const horizontalMaskBtn = document.getElementById('aguiaHorizontalMaskBtn');
            if (horizontalMaskBtn) horizontalMaskBtn.classList.add('active');
        }
        
        if (scope.classList.contains('aguia-reading-mask-vertical')) {
            const verticalMaskBtn = document.getElementById('aguiaVerticalMaskBtn');
            if (verticalMaskBtn) verticalMaskBtn.classList.add('active');
        }
        
        if (scope.classList.contains('aguia-custom-cursor')) {
            const cursorBtn = document.getElementById('aguiaCustomCursorBtn');
            if (cursorBtn) cursorBtn.classList.add('active');
        }
    }
});
