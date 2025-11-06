/**
 * Biblioteca de ícones SVG para o plugin AGUIA de Acessibilidade
 * Estes ícones são otimizados para acessibilidade e alta visibilidade
 * Seguindo as diretrizes WCAG 2.1 e as recomendações da W3C para acessibilidade SVG
 *
 * @module     local_aguiaplugin/icones_acessibilidade
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Namespace para os ícones
/**
 * Objeto que agrupa SVGs (strings) usados como ícones do plugin AGUIA.
 * Cada propriedade é um SVG inline (string) pronto para ser injetado em
 * um botão via innerHTML (por exemplo: element.querySelector('.icon').innerHTML = AguiaIcons.x).
 * Os ícones seguem propriedades de acessibilidade: possuem <title>, role="img"
 * e atributos que melhoram compatibilidade com leitores de tela.
 * @namespace AguiaIcons
 */
const AguiaIcons = {
    // Ícones para tipos de daltonismo - Material Design
    colorblindNone: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Sem filtro de daltonismo</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#FFFFFF"/><path d="M7 7 L17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    
    protanopia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Protanopia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#FF0000"/></svg>',
    
    deuteranopia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Deuteranopia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#00FF00"/></svg>',
    
    tritanopia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Tritanopia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#0000FF"/></svg>',
    
    achromatopsia: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Monocromacia</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="#000000"/></svg>',
    
    // Ícone para texto para fala - Pessoa com ondas sonoras (cabeça e corpo preenchidos em preto; ondas só com traço)
    textToSpeech: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Texto para fala</title><path d="M8,10 C8,8.34 9.34,7 11,7 C12.66,7 14,8.34 14,10 C14,11.66 12.66,13 11,13 C9.34,13 8,11.66 8,10 Z" fill="#000000" style="fill:#000000!important"/><path d="M6,19 L16,19 C16,16.5 14,14 11,14 C8,14 6,16.5 6,19 Z" fill="#000000" style="fill:#000000!important"/><path d="M15.5,8 C15.5,8 16.5,9 16.5,10 C16.5,11 15.5,12 15.5,12" stroke="#000000" fill="none" stroke-width="1.5" stroke-linecap="round" style="stroke:#000000!important"/><path d="M18,6.5 C18,6.5 20,8.25 20,10 C20,11.75 18,13.5 18,13.5" stroke="#000000" fill="none" stroke-width="1.5" stroke-linecap="round" style="stroke:#000000!important"/></svg>',
    
    // Ícone de volume/alto-falante para leitura do menu
    volume: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Ler funcionalidades</title><path d="M3 10v4h4l5 5V5L7 10H3z" fill="currentColor"/><path d="M16.5 12c0-1.77-.77-3.37-2-4.47v8.94c1.23-1.1 2-2.7 2-4.47z" fill="currentColor"/></svg>',
    // Ícone de volume desligado / parar leitura (usado enquanto a leitura estiver ativa)
    volumeOff: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Parar leitura</title><path d="M3 10v4h4l5 5V5L7 10H3z" fill="currentColor"/><path d="M19 8l-6 6m0-6l6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
    
    // Ícone para aumentar texto - Versão limpa de A+
    increaseText: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><text x="4" y="16" font-family="Arial, sans-serif" font-weight="bold" font-size="14">A+</text></svg>',
    
    // Ícone para fonte legível - Material Design
    readableFont: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Fontes legíveis</title><path fill="currentColor" d="M9 8h6v2h-6V8zm0 3h6v2h-6v-2zm0 3h6v2h-6v-2zM5 5h14c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2zm0 2v10h14V7H5z"/></svg>',

    // Novos ícones para estado de Fontes Legíveis
    // Estado padrão (não selecionado): A dentro de um quadrado (como a imagem 1)
    fontSingleA: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Fonte padrão</title><rect x="3" y="3" width="18" height="18" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.8"/><text x="12" y="15.5" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="currentColor">A</text></svg>',
    // Estado ativo (selecionado): Aa (A maiúsculo e a minúsculo) herdando a cor atual
    fontAaSample: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Fontes legíveis ativas</title><text x="8" y="15.5" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="currentColor">A</text><text x="14" y="15.5" font-family="Arial, sans-serif" font-weight="normal" font-size="12" fill="currentColor">a</text></svg>',

    // Variante para OpenDyslexic: usa a família 'OpenDyslexic' se disponível
    fontAaOpenDyslexic: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>OpenDyslexic ativo</title><text x="7.5" y="15.5" font-family="OpenDyslexic, Arial, sans-serif" font-weight="700" font-size="13" fill="currentColor">A</text><text x="14" y="15.5" font-family="OpenDyslexic, Arial, sans-serif" font-weight="400" font-size="13" fill="currentColor">a</text></svg>',
    
    // Ícone para espaçamento entre linhas - Setas e linhas mais finas
    lineSpacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Espaçamento entre linhas</title><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M5 4 L3 6 M5 4 L7 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M5 20 L3 18 M5 20 L7 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><line x1="10" y1="6" x2="22" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="18" x2="22" y2="18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    
    // Ícone para espaçamento entre letras - Aa com seta abaixo centralizada
    letterSpacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Espaçamento entre letras</title><text x="7" y="13" font-family="Arial, sans-serif" font-weight="bold" font-size="12">A</text><text x="14" y="13" font-family="Arial, sans-serif" font-weight="bold" font-size="12">a</text><path d="M5 18 L22 18 M5 18 L7 16 M22 18 L20 16 M5 18 L7 20 M22 18 L20 20" stroke="#000000" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    
    // Mantém o ícone original por compatibilidade
    spacing: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Espaçamento</title><path fill="currentColor" d="M5 21h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2zm0-16h14v2H5V5zm0 4h14v2H5V9zm0 4h14v2H5v-2zm0 4h14v2H5v-2z"/></svg>',
    
    // Ícone para destacar links - Dois elos horizontais interligados com corte onde passa o risco; risco horizontal mais curto e fino
    emphasizeLinks: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Destacar links</title><defs><mask id="linkCutMask"><rect x="0" y="0" width="24" height="24" style="fill:#ffffff!important"/><!-- faixa preta remove o trecho onde o risco passa (limitada à extensão do risco) --><rect x="8" y="11.4" width="8" height="1.2" style="fill:#000000!important"/></mask></defs><g mask="url(#linkCutMask)"><ellipse cx="6.5" cy="12" rx="4.3" ry="3" style="fill:none!important; stroke:#000000!important; stroke-width:2!important"/><ellipse cx="17.5" cy="12" rx="4.3" ry="3" style="fill:none!important; stroke:#000000!important; stroke-width:2!important"/></g><!-- risco horizontal mais curto e mais fino --><line x1="8" y1="12" x2="16" y2="12" style="stroke:#000000!important; stroke-width:1.2!important; stroke-linecap:round!important; fill:none!important"/></svg>',
    
    // Ícone para alto contraste - Círculo metade preenchido
    contrast: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Alto contraste</title><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1" fill="none"/><path fill="currentColor" d="M12,2 A10,10 0 0,1 12,22 A10,10 0 0,1 12,2 z" d="M12,2 A10,10 0 0,1 12,22 A10,10 0 0,1 12,2 z" clip-path="inset(0 50% 0 0)"/></svg>',
    
    // Ícone para intensidade de cores - Gota metade preta e metade branca
    colorIntensity: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Intensidade de cores</title><defs><clipPath id="ciClipAguia"><path d="M12 3.5c-3.8 5.2-7 9.8-7 13.5 0 3.9 3.1 7 7 7s7-3.1 7-7c0-3.7-3.2-8.3-7-13.5z"/></clipPath></defs><rect x="0" y="0" width="12" height="24" fill="#000000" clip-path="url(#ciClipAguia)" style="fill:#000000!important"/><path d="M12 3.5c-3.8 5.2-7 9.8-7 13.5 0 3.9 3.1 7 7 7s7-3.1 7-7c0-3.7-3.2-8.3-7-13.5z" fill="none" stroke="#000000" stroke-width="1" style="fill:none!important;stroke:#000000!important"/><!-- metade direita transparente para se adaptar ao fundo do botão (branco desativado, azul ativado) --></svg>',
    
    // Ícone para inverter cores
    invertColors: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Inverter cores</title><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8v8h8c0 4.41-3.59 8-8 8z"/></svg>',
    
    // Ícones para os níveis de intensidade de cor
    colorIntensityLow: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Intensidade de cor baixa</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm7 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/></svg>',
    
    colorIntensityHigh: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Intensidade de cor alta</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm7 8c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-1-6h2v4h-2v-4z"/></svg>',
    
    colorIntensityGray: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Escala de cinza</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm5 8h4v-2h-2v-4H8v6z"/></svg>',
    
    // Ícone para daltonismo - Paleta de tinta com bolas coloridas maiores
    colorblind: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Daltonismo</title><path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/><circle cx="6.5" cy="10.5" r="2.2" fill="#FFFFFF"/><circle cx="9.5" cy="6.5" r="2.2" fill="#FFFFFF"/><circle cx="14.5" cy="6.5" r="2.2" fill="#FFFFFF"/><circle cx="17.5" cy="10.5" r="2.2" fill="#FFFFFF"/></svg>',
    
    // Ícone para guia de leitura - retângulo grosso com linhas internas finas
    readingGuide: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Auxiliar de leitura</title><rect x="2" y="5" width="20" height="14" rx="1" ry="1" fill="none" stroke="currentColor" stroke-width="3.5"/><line x1="5" y1="8.5" x2="19" y2="8.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="5" y1="15.5" x2="13" y2="15.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    
    // Ícone para ocultar imagens - Estilo flat minimalista
    hideImages: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Ocultar imagens</title><rect x="5" y="5" width="14" height="14" rx="1" ry="1" fill="none" stroke="#000000" stroke-width="1.5"/><circle cx="8" cy="10" r="1.5" fill="#000000"/><path d="M9 14 L12 11 L15 14 L17 12 L17 16 L7 16 L9 14 Z" fill="#000000"/><line x1="4" y1="4" x2="20" y2="20" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/></svg>',
    
    // Ícone para máscara de foco (estilo simplificado)
    focusMask: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Máscara de foco</title><path fill="currentColor" d="M5 19h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2zM5 7h14v10H5V7zm0 3h14v4H5v-4z"/></svg>',
    
    // Ícone para máscara de foco horizontal - Estilo flat com retângulos horizontais
    focusMaskHorizontal: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Máscara de foco horizontal</title><rect x="5" y="6" width="14" height="3" rx="1" ry="1" fill="#000000" stroke="none"/><rect x="5" y="10.5" width="14" height="3" rx="1" ry="1" fill="none" stroke="#000000" stroke-width="1.5"/><rect x="5" y="15" width="14" height="3" rx="1" ry="1" fill="#000000" stroke="none"/></svg>',
    
    // Ícone para máscara de foco vertical - Estilo flat com retângulos verticais
    focusMaskVertical: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Máscara de foco vertical</title><rect x="6" y="5" width="3" height="14" rx="1" ry="1" fill="#000000" stroke="none"/><rect x="10.5" y="5" width="3" height="14" rx="1" ry="1" fill="none" stroke="#000000" stroke-width="1.5"/><rect x="15" y="5" width="3" height="14" rx="1" ry="1" fill="#000000" stroke="none"/></svg>',
    
    // Ícone para cursor personalizado - Estilo flat minimalista
    customCursor: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Cursor personalizado</title><path fill="#000000" d="M9 3.5 C8.7 3.5 8.5 3.7 8.5 4 L8.5 16 C8.5 16.5 9.1 16.7 9.5 16.4 L12 14.5 L14.5 18 C14.8 18.4 15.4 18.5 15.8 18.2 L16.8 17.5 C17.2 17.2 17.3 16.6 17 16.2 L14.5 12.7 L17.5 12 C18 11.9 18.2 11.3 17.9 10.9 L9.5 3.7 C9.4 3.6 9.2 3.5 9 3.5 Z" stroke="#000000" stroke-width="0.5" stroke-linejoin="round"/></svg>',
    
    // Ícone para resetar - Material Design
    reset: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Resetar configurações</title><path fill="currentColor" d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6c0 2.97-2.17 5.43-5 5.9v2.02c3.95-.49 7-3.85 7-7.92c0-4.41-3.59-8-8-8zM6 13c0-1.65.67-3.15 1.76-4.24L6.34 7.34A8.014 8.014 0 0 0 4 13c0 4.07 3.05 7.43 7 7.92v-2.02c-2.83-.47-5-2.93-5-5.9z"/></svg>',
    
    // Ícone para letras destacadas - Material Design
    highlightedLetters: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><text x="7" y="18" font-family="Arial, sans-serif" font-weight="bold" font-size="18">B</text></svg>',
    
    // Ícone para lupa de conteúdo - Lente com anel fino
    magnifier: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Lupa de conteúdo</title><circle cx="10" cy="10" r="6.5" fill="none" stroke="#000000" stroke-width="1.8" style="stroke:#000000!important"/><path d="M15 15 L21 21" stroke="#000000" stroke-width="2.2" stroke-linecap="round" style="stroke:#000000!important"/></svg>',
    
    // Ícone para destaque de cabeçalhos - Design minimalista com linha grossa
    headerHighlight: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Destacar cabeçalhos</title><rect x="4" y="4" width="16" height="16" rx="2" ry="2" style="fill:none!important; stroke:#000000!important; stroke-width:2!important"/><path d="M8 8 L12 8" style="fill:none!important; stroke:#000000!important; stroke-width:3!important; stroke-linecap:round!important"/></svg>',

    // Ícone para reduzir animações - símbolo de movimento reduzido (meia-lua com traço)
    reduceAnimations: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Reduzir animações</title><path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20z" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M8 12h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    
    // Novos ícones acessíveis
    
    // Ícone para informações de acessibilidade
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Informações</title><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v-6h-2v6zm0-8h2V6h-2v2z"/></svg>',
    
    // Ícone para interpretar imagens - Documento com imagem e lupa (simplificado e mais legível)
    imageInterpreter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false"><title>Interpretar imagens</title><path fill="none" stroke="currentColor" stroke-width="2" d="M4 3h9l4 4v6"/><path fill="none" stroke="currentColor" stroke-width="2" d="M4 3v16h9"/><line x1="13" y1="3" x2="13" y2="7" stroke="currentColor" stroke-width="2"/><line x1="13" y1="7" x2="17" y2="7" stroke="currentColor" stroke-width="2"/><rect x="6.5" y="9" width="7" height="5" rx="0.8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="11" r="0.6" fill="currentColor"/><path d="M7.5 13l1.5-1.5l1.5 1.5l2-2l1 1.5" stroke="currentColor" stroke-width="0.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="17" cy="17" r="3.8" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M19.5 19.5l2.8 2.8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',
    
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
