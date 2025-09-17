/**
 * Biblioteca de ícones SVG para o plugin AGUIA de Acessibilidade
 * Estes ícones são otimizados para acessibilidade e alta visibilidade
 * Seguindo as diretrizes WCAG 2.1 e as recomendações da W3C para acessibilidade SVG
 */

// Namespace para os ícones
const AguiaIcons = {
    // Ícones para tipos de daltonismo - Material Design
    colorblindNone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Sem filtro de daltonismo</title><path fill="currentColor" d="M2.47 2.47c-.39.39-.39 1.02 0 1.41l2.26 2.26A9.91 9.91 0 0 0 2 12c0 5.52 4.48 10 10 10 2.04 0 3.93-.63 5.49-1.69l2.69 2.69c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L3.87 2.47c-.38-.39-1.01-.39-1.4 0zM12 20c-4.42 0-8-3.58-8-8 0-1.48.42-2.85 1.13-4.03l10.9 10.9c-1.18.71-2.55 1.13-4.03 1.13zm4.51-9.03l-2.9-2.9c1.3-.51 2.73.18 3.25 1.48.22.53.22 1.12 0 1.66-.1.23-.22.44-.35.63zm.03 6.5l-7-7c0-.01-.01-.02-.01-.03a2.99 2.99 0 0 1 4.64-2.5l.01-.01 2.49 2.49-.01.01c.18.56.18 1.16 0 1.72l-.01.01.01.01c-.3.94-1.06 1.62-2.03 1.84l-.03-.03-1.73-1.73c.01 0 .02-.01.04-.01a.79.79 0 1 0-.56-1.36l-.57-.57a.778.778 0 0 0-.38 1.45c.16.07.33.09.5.07l1.74 1.74c-.08 0-.16.02-.24.02-1.25 0-2.26-.93-2.36-2.15l-2.49-2.49c-.18-.56-.19-1.16-.01-1.73l.01-.01-.01-.01c.17-.55.49-1.04.97-1.39l-1.01-1.01c-1.3.9-2.12 2.37-2.12 4.02 0 3.04 2.46 5.5 5.5 5.5 1.65 0 3.11-.73 4.12-1.88z"/></svg>',
    
    protanopia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Protanopia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#FF0000"/></svg>',
    
    deuteranopia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Deuteranopia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#00FF00"/></svg>',
    
    tritanopia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Tritanopia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#0000FF"/></svg>',
    
    achromatopsia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Monocromacia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#000000"/></svg>',
        // Ícone para VLibras - tradução para língua brasileira de sinais
    vLibras: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>VLibras</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm7-1c-1.1 0-2 .9-2 2 0 .74.4 1.38 1 1.72v1.78c-2 .67-3 2-3 3.5h2c0-1.1.9-2 2-2s2 .9 2 2h2c0-1.5-1-2.83-3-3.5V9.72c.6-.34 1-.98 1-1.72 0-1.1-.9-2-2-2z"/></svg>',
    
    // Ícone para texto para fala - Pessoa com ondas sonoras (ondas ajustadas ainda mais para cima)
    textToSpeech: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Texto para fala</title><path d="M8,10 C8,8.34 9.34,7 11,7 C12.66,7 14,8.34 14,10 C14,11.66 12.66,13 11,13 C9.34,13 8,11.66 8,10 Z" fill="currentColor"/><path d="M6,19 L16,19 C16,16.5 14,14 11,14 C8,14 6,16.5 6,19 Z" fill="currentColor"/><path d="M16,7.5 C16,7.5 17,9 17,10 C17,11 16,12.5 16,12.5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/><path d="M18,6 C18,6 20,8 20,10 C20,12 18,14 18,14" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round"/></svg>',
    
    // Ícone para aumentar texto - Versão limpa de A+
    increaseText: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><text x="4" y="16" font-family="Arial, sans-serif" font-weight="bold" font-size="14">A+</text></svg>',
    
    // Ícone para fonte legível - Material Design
    readableFont: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Fontes legíveis</title><path fill="currentColor" d="M9 8h6v2h-6V8zm0 3h6v2h-6v-2zm0 3h6v2h-6v-2zM5 5h14c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2zm0 2v10h14V7H5z"/></svg>',
    
    // Ícone para espaçamento entre linhas - Material Design
    lineSpacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Espaçamento entre linhas</title><path fill="currentColor" d="M6 7h2.5L5 3.5L1.5 7H4v10H1.5L5 20.5L8.5 17H6V7zm4-2v2h12V5H10zm0 14h12v-2H10v2zm0-6h12v-2H10v2z"/></svg>',
    
    // Ícone para espaçamento entre letras - Aa com seta abaixo centralizada
    letterSpacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Espaçamento entre letras</title><text x="4" y="12" font-family="Arial, sans-serif" font-weight="bold" font-size="12">A</text><text x="12" y="12" font-family="Arial, sans-serif" font-weight="bold" font-size="12">a</text><path d="M4 18 L19 18 M4 18 L6 16 M19 18 L17 16 M4 18 L6 20 M19 18 L17 20" stroke="#444444" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    
    // Mantém o ícone original por compatibilidade
    spacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Espaçamento</title><path fill="currentColor" d="M5 21h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2zm0-16h14v2H5V5zm0 4h14v2H5V9zm0 4h14v2H5v-2zm0 4h14v2H5v-2z"/></svg>',
    
    // Ícone para destacar links - Estilo flat minimalista
    emphasizeLinks: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Destacar links</title><rect x="6" y="8" width="12" height="8" rx="2" ry="2" fill="#444444" stroke="none"/><path fill="#FFFFFF" d="M10.5 10 C9.5 10 9 10.7 9 11.5 C9 12.3 9.5 13 10.5 13 L11.2 13 L11.2 12 L10.5 12 C10.2 12 10 11.8 10 11.5 C10 11.2 10.2 11 10.5 11 L11.8 11 L11.8 10 L10.5 10 Z M12.2 11 L12.2 12 L13.5 12 C13.8 12 14 12.2 14 12.5 C14 12.8 13.8 13 13.5 13 L12.2 13 L12.2 14 L13.5 14 C14.5 14 15 13.3 15 12.5 C15 11.7 14.5 11 13.5 11 L12.2 11 Z M11 12.25 L11 12.75 L13 12.75 L13 12.25 L11 12.25 Z"/></svg>',
    
    // Ícone para alto contraste - Círculo metade preenchido
    contrast: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Alto contraste</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="none"/><path fill="currentColor" d="M12,2 A10,10 0 0,1 12,22 A10,10 0 0,1 12,2 z" d="M12,2 A10,10 0 0,1 12,22 A10,10 0 0,1 12,2 z" clip-path="inset(0 50% 0 0)"/></svg>',
    
    // Ícone para intensidade de cores - Gota com metade preenchida
    colorIntensity: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Intensidade de cores</title><path fill="none" stroke="currentColor" stroke-width="1" d="M12 3.5c-3.8 5.2-7 9.8-7 13.5 0 3.9 3.1 7 7 7s7-3.1 7-7c0-3.7-3.2-8.3-7-13.5z"/><path fill="currentColor" d="M12 3.5c-3.8 5.2-7 9.8-7 13.5 0 3.9 3.1 7 7 7s7-3.1 7-7c0-3.7-3.2-8.3-7-13.5z" clip-path="inset(0 50% 0 0)"/></svg>',
    
    // Ícone para inverter cores
    invertColors: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Inverter cores</title><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8v8h8c0 4.41-3.59 8-8 8z"/></svg>',
    
    // Ícones para os níveis de intensidade de cor
    colorIntensityLow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Intensidade de cor baixa</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm7 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/></svg>',
    
    colorIntensityHigh: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Intensidade de cor alta</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm7 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-1-6h2v4h-2v-4z"/></svg>',
    
    colorIntensityGray: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Escala de cinza</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm5 8h4v-2h-2v-4H8v6z"/></svg>',
    
    // Ícone para daltonismo - Paleta de tinta
    colorblind: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Daltonismo</title><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3 4c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
    
    // Ícone para guia de leitura - Material Design
    readingGuide: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Auxiliar de leitura</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm1 2h12v2H6V9zm0 3h12v1H6v-1zm0 2h8v1H6v-1z"/></svg>',
    
    // Ícone para ocultar imagens - Estilo flat minimalista
    hideImages: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Ocultar imagens</title><rect x="5" y="5" width="14" height="14" rx="1" ry="1" fill="none" stroke="#444444" stroke-width="1.5"/><circle cx="8" cy="10" r="1.5" fill="#444444"/><path d="M9 14 L12 11 L15 14 L17 12 L17 16 L7 16 L9 14 Z" fill="#444444"/><line x1="4" y1="4" x2="20" y2="20" stroke="#444444" stroke-width="1.5" stroke-linecap="round"/></svg>',
    
    // Ícone para máscara de foco (estilo simplificado)
    focusMask: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Máscara de foco</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm0 3h14v4H5v-4z"/></svg>',
    
    // Ícone para máscara de foco horizontal - Estilo flat com retângulos horizontais
    focusMaskHorizontal: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Máscara de foco horizontal</title><rect x="5" y="6" width="14" height="3" rx="1" ry="1" fill="#444444" stroke="none"/><rect x="5" y="10.5" width="14" height="3" rx="1" ry="1" fill="none" stroke="#444444" stroke-width="1.5"/><rect x="5" y="15" width="14" height="3" rx="1" ry="1" fill="#444444" stroke="none"/></svg>',
    
    // Ícone para máscara de foco vertical - Estilo flat com retângulos verticais
    focusMaskVertical: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Máscara de foco vertical</title><rect x="6" y="5" width="3" height="14" rx="1" ry="1" fill="#444444" stroke="none"/><rect x="10.5" y="5" width="3" height="14" rx="1" ry="1" fill="none" stroke="#444444" stroke-width="1.5"/><rect x="15" y="5" width="3" height="14" rx="1" ry="1" fill="#444444" stroke="none"/></svg>',
    
    // Ícone para cursor personalizado - Estilo flat minimalista
    customCursor: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Cursor personalizado</title><path fill="#444444" d="M9 3.5 C8.7 3.5 8.5 3.7 8.5 4 L8.5 16 C8.5 16.5 9.1 16.7 9.5 16.4 L12 14.5 L14.5 18 C14.8 18.4 15.4 18.5 15.8 18.2 L16.8 17.5 C17.2 17.2 17.3 16.6 17 16.2 L14.5 12.7 L17.5 12 C18 11.9 18.2 11.3 17.9 10.9 L9.5 3.7 C9.4 3.6 9.2 3.5 9 3.5 Z" stroke="#444444" stroke-width="0.5" stroke-linejoin="round"/></svg>',
    
    // Ícone para resetar - Material Design
    reset: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Resetar configurações</title><path fill="currentColor" d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6c0 2.97-2.17 5.43-5 5.9v2.02c3.95-.49 7-3.85 7-7.92c0-4.41-3.59-8-8-8zM6 13c0-1.65.67-3.15 1.76-4.24L6.34 7.34A8.014 8.014 0 0 0 4 13c0 4.07 3.05 7.43 7 7.92v-2.02c-2.83-.47-5-2.93-5-5.9z"/></svg>',
    
    // Ícone para letras destacadas - Material Design
    highlightedLetters: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><text x="7" y="18" font-family="Arial, sans-serif" font-weight="bold" font-size="18">B</text></svg>',
    
    // Ícone para lupa de conteúdo - Design minimalista
    magnifier: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Lupa de conteúdo</title><circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="2" fill="none"/><path stroke="currentColor" stroke-width="2" d="M16 16 L21 21" stroke-linecap="round"/></svg>',
    
    // Ícone para destaque de cabeçalhos - Design minimalista com linha grossa
    headerHighlight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Destacar cabeçalhos</title><rect x="4" y="4" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" rx="2" ry="2"/><path d="M8 8 L12 8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    
    // Novos ícones acessíveis
    
    // Ícone para informações de acessibilidade
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Informações</title><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v-6h-2v6zm0-8h2V6h-2v2z"/></svg>',
    
    // Ícone para configurações de acessibilidade
    settings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Configurações</title><path fill="currentColor" d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/></svg>',
    
    // Ícone para menu de acessibilidade
    menu: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Menu de acessibilidade</title><path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>',
    
    // Ícone para símbolo universal de acessibilidade
    accessibilitySymbol: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Símbolo de acessibilidade</title><path fill="currentColor" d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>',
    
    // Ícone para tema escuro
    darkTheme: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Tema escuro</title><path fill="currentColor" d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/></svg>',
    
    // Ícone para tema claro
    lightTheme: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Tema claro</title><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>',
    
    // Ícone para ajuda
    help: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Ajuda</title><path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>'
};
