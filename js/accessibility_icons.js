/**
 * Biblioteca de ícones SVG para o plugin AGUIA de Acessibilidade
 * Estes ícones são otimizados para acessibilidade e alta visibilidade
 */

// Namespace para os ícones
const AguiaIcons = {
    // Ícone para VLibras - tradução para língua brasileira de sinais
    vLibras: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12.87 15.07l-2.54-2.51l.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5l3.11 3.11l.76-2.04M18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12m-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>',
    
    // Ícone para aumentar texto - mais legível
    increaseText: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" stroke="none" d="M9.5 7l5 10h-2l-1-2h-4l-1 2h-2l5-10h.5m-1.25 6h2.5l-1.25-2.5-1.25 2.5M20 14h-4v-2h2v-2h2v4M20 19h-4v-2h4v2z"/></svg>',
    
    // Ícone para fonte legível
    readableFont: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 4h2v6h4V4h2v14H9v-6H5v6H3V4m14 0h5v2h-5v4h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2m0 8v4h4v-4h-4z"/></svg>',
    
    // Ícone para espaçamento entre linhas
    lineSpacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 16h18v2H3v-2m0-5h18v2H3v-2m0-5h18v2H3V6z"/></svg>',
    
    // Ícone para espaçamento entre letras
    letterSpacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.17 15.5h5.64l1.14 3h2.09l-5.11-13h-1.86l-5.11 13h2.09l1.12-3M12 7.98l2.07 5.52H9.93L12 7.98M20 14v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4Z"/></svg>',
    
    // Mantém o ícone original por compatibilidade
    spacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 16h18v2H3v-2m0-5h18v2H3v-2m0-5h18v2H3V6z"/></svg>',
    
    // Ícone para destacar links
    emphasizeLinks: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8v2m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1c0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>',
    
    // Ícone para alto contraste
    contrast: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 18a8 8 0 0 1-8-8a8 8 0 0 1 8-8a8 8 0 0 1 8 8a8 8 0 0 1-8 8m4-7c.6 0 1 .4 1 1s-.4 1-1 1s-1-.4-1-1s.4-1 1-1m-8 0c.6 0 1 .4 1 1s-.4 1-1 1s-1-.4-1-1s.4-1 1-1m3.3-4.3l-1.1 2l-1.7.4l1.7.4l1.1 2l1.1-2l1.7-.4l-1.7-.4l-1.1-2"/></svg>',
    
    // Ícone para cores invertidas
    invertColors: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8M7 12a5 5 0 0 0 5 5V7a5 5 0 0 0-5 5"/></svg>',
    
    // Ícone para daltonismo
    colorblind: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17 13v-2h-1.5A1.5 1.5 0 0 1 14 9.5A1.5 1.5 0 0 1 15.5 8H17V6h-1.5A3.5 3.5 0 0 0 12 9.5c0 .93.37 1.77.96 2.39A2.99 2.99 0 0 0 11 15a3 3 0 0 0 3 3c.75 0 1.44-.28 1.97-.74a3.52 3.52 0 0 0 2.14.74A3.39 3.39 0 0 0 21.5 14.5a3.39 3.39 0 0 0-3.39-3.5c-.36 0-.7.08-1.11.2M15.5 15a1.5 1.5 0 0 1-1.5-1.5A1.5 1.5 0 0 1 15.5 12a1.39 1.39 0 0 1 1.39 1.5a1.39 1.39 0 0 1-1.39 1.5M8.33 7.5l-.66-1.5H5.33l-.67 1.5h3.67m-4.1 1l-1.04 2.39c-.04.09-.2.61.13.61h2.26C5.62 8.67 4.73 8.5 4.23 8.5M9.97 11.5c.19 0 .37-.19.26-.43L8.1 5.5a.62.62 0 0 0-.5-.5H7.12c-.26 0-.4.21-.5.5l-2.12 5.57c-.11.24.06.43.26.43h4.71z"/></svg>',
    
    // Ícone para texto para fala
    textToSpeech: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 3h-4c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1m-2 11c-.83 0-1.5-.67-1.5-1.5S11.17 11 12 11s1.5.67 1.5 1.5S12.83 14 12 14m2-8H10V4h4v2M4.97 19H9v-5H4.97v5M20 10h-4v5h4v-5m0 9h-4v-2h4v2m-7 0h-4v-2h4v2M15 2c-2.76 0-5 2.24-5 5h2c0-1.66 1.34-3 3-3s3 1.34 3 3h2c0-2.76-2.24-5-5-5"/></svg>',
    
    // Ícone para guia de leitura
    readingGuide: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 14H3V6h18v12M9 8v8h6V8H9m8 0v2h2V8h-2m-2 0v2h1V8h-1m-9 4h2v-2H6v2m0 4h2v-2H6v2"/></svg>',
    
    // Ícone para ocultar imagens
    hideImages: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2.28 3L1 4.27L3 6.27V19a2 2 0 0 0 2 2h13.73l2 2L22 21.72L4 3.72L2.28 3M6.09 8L12 13.91l1-1V12h-1.09L8 8.09V9H6.09v-1M19 5a2 2 0 0 1 2 2v11.18l-2-2V17l-2-2l1-1l-1.9-1.9L11 7l-.9-.9L8.82 5H19M16.5 6A1.5 1.5 0 0 0 15 7.5a1.5 1.5 0 0 0 1.5 1.5a1.5 1.5 0 0 0 1.5-1.5A1.5 1.5 0 0 0 16.5 6"/></svg>',
    
    // Ícone para máscara de foco
    focusMask: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 4h4V2H2a2 2 0 0 0-2 2v4h2V4m20-2h-4v2h4v4h2V4a2 2 0 0 0-2-2M2 16H0v4a2 2 0 0 0 2 2h4v-2H2v-4m20 4h-4v2h4a2 2 0 0 0 2-2v-4h-2v4M5 12h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1"/></svg>',
    
    // Ícone para cursor personalizado
    customCursor: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M13.64 21.97a.99.99 0 0 1-1.33-.47l-2.18-4.74l-2.51 2.02c-.17.14-.38.22-.62.22a.995.995 0 0 1-1-1V3a1 1 0 0 1 1-1c.24 0 .47.09.64.23l.01-.01l11.49 9.64a1.001 1.001 0 0 1-.44 1.78l-3.18.4l2.14 4.73c.24.52 0 1.14-.52 1.38z"/></svg>',
    
    // Ícone para resetar
    reset: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4c2.1 0 4 .8 5.4 2.2l1.6-1.6v5h-5l2-2c-1-1-2.5-1.6-4-1.6C9 6 6 9 6 12s3 6 6 6c2.3 0 4.2-1.2 5.2-3h2.2c-1.2 2.8-3.9 4.8-7.4 4.8-4.4 0-8-3.6-8-8s3.6-8 8-8m0 3c.8 0 1.5.7 1.5 1.5S12.8 10 12 10s-1.5-.7-1.5-1.5S11.2 7 12 7z"/></svg>',
    
    // Ícone para letras destacadas
    highlightedLetters: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9.62 12L12 5.67L14.37 12M11 3L5.5 17h2.25l1.12-3h6.25l1.13 3h2.25L13 3h-2z"/></svg>'
};
