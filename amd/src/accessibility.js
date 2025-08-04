/**
 * Plugin AGUIA para acessibilidade
 * 
 * @module     local_aguiaplugin/accessibility
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import $ from 'jquery';
import ajax from 'core/ajax';
import Notification from 'core/notification';
import Config from 'core/config';
import * as Str from 'core/str';

export const init = () => {
    // Carregar as strings do plugin
    const strings = [
        {key: 'aguia_menu', component: 'local_aguiaplugin'},
        {key: 'font_increase', component: 'local_aguiaplugin'},
        {key: 'font_decrease', component: 'local_aguiaplugin'},
        {key: 'font_reset', component: 'local_aguiaplugin'},
        {key: 'contrast_highcontrast', component: 'local_aguiaplugin'},
        {key: 'contrast_inverted', component: 'local_aguiaplugin'},
        {key: 'contrast_reset', component: 'local_aguiaplugin'},
        {key: 'readable_fonts', component: 'local_aguiaplugin'},
        {key: 'line_spacing', component: 'local_aguiaplugin'},
        {key: 'text_speech', component: 'local_aguiaplugin'},
        {key: 'text_helper', component: 'local_aguiaplugin'},
        {key: 'ocr_title', component: 'local_aguiaplugin'},
        {key: 'ocr_button', component: 'local_aguiaplugin'},
        {key: 'ocr_processing', component: 'local_aguiaplugin'}
    ];

    // Configurações de estilo
    const styles = {
        button: {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            fontSize: '28px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: '9999'
        },
        buttonHover: {
            transform: 'scale(1.1)',
            backgroundColor: '#45a049'
        },
        menu: {
            position: 'fixed',
            bottom: '100px',
            right: '30px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            display: 'none',
            width: '250px',
            zIndex: '9999'
        },
        menuItem: {
            display: 'block',
            width: '100%',
            padding: '12px',
            margin: '8px 0',
            backgroundColor: '#f8f8f8',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
        },
        menuItemHover: {
            backgroundColor: '#f0f0f0'
        },
        statusMessage: {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            backgroundColor: '#333',
            color: 'white',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
            display: 'none',
            zIndex: '10000'
        },
        progressContainer: {
            position: 'fixed',
            top: '60px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '300px',
            height: '20px',
            backgroundColor: '#f0f0f0',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'none',
            zIndex: '10000'
        },
        progressBar: {
            height: '100%',
            width: '0%',
            backgroundColor: '#4caf50',
            borderRadius: '10px',
            transition: 'width 0.3s ease',
            textAlign: 'center',
            color: 'white',
            fontSize: '12px',
            lineHeight: '20px'
        }
    };
    
    // Variáveis globais
    let accessibilityButton;
    let accessibilityMenu;
    let statusMessage;
    let progressContainer;
    let progressBar;
    let fileInput;
    let ocrImage;
    let ocrResult;
    let ocrText;
    let currentFontSize = 100;
    let currentContrast = 'normal';
    let useReadableFonts = false;
    let currentLineSpacing = 100;
    let speechEnabled = false;
    let textHelperEnabled = false;
    let speechSynthesis;
    let speechUtterance;
    
    // Função de inicialização
    const initialize = () => {
        // Carregar preferências salvas
        loadUserPreferences().then((prefs) => {
            currentFontSize = prefs.fontsize || 100;
            currentContrast = prefs.contrast || 'normal';
            useReadableFonts = prefs.readablefonts == 1;
            currentLineSpacing = prefs.linespacing || 100;
            speechEnabled = prefs.speech == 1;
            textHelperEnabled = prefs.texthelper == 1;
            
            // Aplicar preferências carregadas
            setFontSize(currentFontSize);
            setContrast(currentContrast);
            if (useReadableFonts) toggleReadableFonts();
            setLineSpacing(currentLineSpacing);
            if (speechEnabled) toggleSpeech();
            if (textHelperEnabled) toggleTextHelper();
            
            // Criar os elementos da interface
            createElements();
        });
    };
    
    // Função para criar os elementos do plugin
    const createElements = () => {
        // Botão flutuante de acessibilidade
        Str.get_string('aguia_menu', 'local_aguiaplugin').then(function(aguiaMenu) {
            accessibilityButton = document.createElement('button');
            accessibilityButton.id = 'accessibilityButton';
            accessibilityButton.setAttribute('aria-label', aguiaMenu);
            accessibilityButton.textContent = '♿';
            Object.assign(accessibilityButton.style, styles.button);
            
            accessibilityButton.addEventListener('mouseenter', () => {
                Object.assign(accessibilityButton.style, styles.buttonHover);
            });
            
            accessibilityButton.addEventListener('mouseleave', () => {
                Object.assign(accessibilityButton.style, styles.button);
            });
            
            accessibilityButton.addEventListener('click', toggleMenu);
            
            document.body.appendChild(accessibilityButton);
            createMenu();
        });
    };

    // Criar o menu de acessibilidade
    const createMenu = () => {
        // Menu de acessibilidade
        accessibilityMenu = document.createElement('div');
        accessibilityMenu.id = 'accessibilityMenu';
        Object.assign(accessibilityMenu.style, styles.menu);
        
        const menuTitle = document.createElement('h2');
        menuTitle.style.margin = '0 0 15px 0';
        menuTitle.style.fontSize = '18px';
        Str.get_string('aguia_menu', 'local_aguiaplugin').then(function(aguiaMenu) {
            menuTitle.textContent = aguiaMenu;
        });
        accessibilityMenu.appendChild(menuTitle);
        
        // Lista de opções
        const menuOptions = [
            {key: 'font_increase', icon: '🔍+', action: increaseFontSize},
            {key: 'font_decrease', icon: '🔍-', action: decreaseFontSize},
            {key: 'font_reset', icon: '🔄', action: resetFontSize},
            {key: 'contrast_highcontrast', icon: '🌓', action: setHighContrast},
            {key: 'contrast_inverted', icon: '🔄', action: setInvertedContrast},
            {key: 'contrast_reset', icon: '🌈', action: resetContrast},
            {key: 'readable_fonts', icon: '📝', action: toggleReadableFonts},
            {key: 'line_spacing', icon: '↕️', action: increaseLineSpacing},
            {key: 'text_speech', icon: '🔊', action: toggleSpeech},
            {key: 'text_helper', icon: '👁️', action: toggleTextHelper}
        ];
        
        // Adiciona os botões ao menu
        menuOptions.forEach(option => {
            const button = document.createElement('button');
            button.className = 'accessibility-option';
            Object.assign(button.style, styles.menuItem);
            
            const iconSpan = document.createElement('span');
            iconSpan.textContent = option.icon + ' ';
            button.appendChild(iconSpan);
            
            const textSpan = document.createElement('span');
            Str.get_string(option.key, 'local_aguiaplugin').then(function(text) {
                textSpan.textContent = text;
            });
            button.appendChild(textSpan);
            
            button.addEventListener('click', option.action);
            
            button.addEventListener('mouseenter', () => {
                Object.assign(button.style, styles.menuItemHover);
            });
            
            button.addEventListener('mouseleave', () => {
                Object.assign(button.style, styles.menuItem);
            });
            
            accessibilityMenu.appendChild(button);
        });
        
        document.body.appendChild(accessibilityMenu);

        // Mensagem de status
        statusMessage = document.createElement('div');
        statusMessage.id = 'statusMessage';
        statusMessage.className = 'status-message';
        Object.assign(statusMessage.style, styles.statusMessage);
        document.body.appendChild(statusMessage);

        // Barra de progresso
        progressContainer = document.createElement('div');
        progressContainer.id = 'progressContainer';
        Object.assign(progressContainer.style, styles.progressContainer);
        
        progressBar = document.createElement('div');
        progressBar.id = 'progressBar';
        Object.assign(progressBar.style, styles.progressBar);
        progressBar.textContent = '0%';
        
        progressContainer.appendChild(progressBar);
        document.body.appendChild(progressContainer);
    };

    // Funções de manipulação de preferências
    
    // Tamanho da fonte
    const increaseFontSize = () => {
        currentFontSize += 10;
        setFontSize(currentFontSize);
        saveUserPreferences();
    };
    
    const decreaseFontSize = () => {
        if (currentFontSize > 70) {
            currentFontSize -= 10;
            setFontSize(currentFontSize);
            saveUserPreferences();
        }
    };
    
    const resetFontSize = () => {
        currentFontSize = 100;
        setFontSize(currentFontSize);
        saveUserPreferences();
    };
    
    const setFontSize = (size) => {
        document.documentElement.style.setProperty('--font-size-multiplier', size + '%');
        document.body.style.fontSize = size + '%';
    };
    
    // Contraste
    const setHighContrast = () => {
        resetContrast();
        document.body.classList.add('high-contrast');
        currentContrast = 'high';
        saveUserPreferences();
    };
    
    const setInvertedContrast = () => {
        resetContrast();
        document.body.classList.add('inverted-colors');
        currentContrast = 'inverted';
        saveUserPreferences();
    };
    
    const resetContrast = () => {
        document.body.classList.remove('high-contrast', 'inverted-colors');
        currentContrast = 'normal';
        saveUserPreferences();
    };
    
    const setContrast = (contrast) => {
        resetContrast();
        if (contrast === 'high') {
            setHighContrast();
        } else if (contrast === 'inverted') {
            setInvertedContrast();
        }
    };
    
    // Fontes legíveis
    const toggleReadableFonts = () => {
        useReadableFonts = !useReadableFonts;
        if (useReadableFonts) {
            document.body.classList.add('readable-fonts');
        } else {
            document.body.classList.remove('readable-fonts');
        }
        saveUserPreferences();
    };
    
    // Espaçamento de linhas
    const increaseLineSpacing = () => {
        currentLineSpacing = currentLineSpacing >= 200 ? 100 : currentLineSpacing + 25;
        setLineSpacing(currentLineSpacing);
        saveUserPreferences();
    };
    
    const setLineSpacing = (spacing) => {
        document.documentElement.style.setProperty('--line-height-multiplier', spacing + '%');
        document.body.style.lineHeight = (spacing / 100) * 1.5;
    };
    
    // Leitura de texto
    const toggleSpeech = () => {
        speechEnabled = !speechEnabled;
        if (speechEnabled) {
            initializeSpeech();
            document.body.classList.add('text-to-speech');
        } else {
            document.body.classList.remove('text-to-speech');
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        }
        saveUserPreferences();
    };
    
    const initializeSpeech = () => {
        if (!('speechSynthesis' in window)) {
            alert('Seu navegador não suporta a função de leitura de texto.');
            speechEnabled = false;
            return;
        }
        
        speechSynthesis = window.speechSynthesis;
        
        // Adiciona eventos para ler texto ao clicar
        document.addEventListener('click', (e) => {
            if (!speechEnabled) return;
            
            const element = e.target.closest('p, h1, h2, h3, h4, h5, h6, li, td, th, a, button, span, div');
            if (element && element.textContent.trim().length > 0) {
                speechUtterance = new SpeechSynthesisUtterance(element.textContent.trim());
                speechUtterance.lang = document.documentElement.lang || 'pt-BR';
                speechSynthesis.cancel();
                speechSynthesis.speak(speechUtterance);
            }
        });
    };
    
    // Auxiliar de leitura
    const toggleTextHelper = () => {
        textHelperEnabled = !textHelperEnabled;
        if (textHelperEnabled) {
            document.body.classList.add('text-helper');
            initializeTextHelper();
        } else {
            document.body.classList.remove('text-helper');
            document.removeEventListener('mousemove', textHelperMouseMove);
        }
        saveUserPreferences();
    };
    
    const initializeTextHelper = () => {
        if (!document.getElementById('textHelper')) {
            const helper = document.createElement('div');
            helper.id = 'textHelper';
            helper.style.position = 'absolute';
            helper.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
            helper.style.pointerEvents = 'none';
            helper.style.zIndex = '9998';
            helper.style.height = '30px';
            helper.style.display = 'none';
            document.body.appendChild(helper);
        }
        
        document.addEventListener('mousemove', textHelperMouseMove);
    };
    
    const textHelperMouseMove = (e) => {
        const helper = document.getElementById('textHelper');
        if (!helper || !textHelperEnabled) return;
        
        const element = document.elementFromPoint(e.clientX, e.clientY);
        if (element && element.textContent && element !== helper) {
            const rect = element.getBoundingClientRect();
            helper.style.width = rect.width + 'px';
            helper.style.top = (window.scrollY + rect.top) + 'px';
            helper.style.left = rect.left + 'px';
            helper.style.display = 'block';
        } else {
            helper.style.display = 'none';
        }
    };

    // Toggle menu
    const toggleMenu = () => {
        if (accessibilityMenu.style.display === 'none' || accessibilityMenu.style.display === '') {
            accessibilityMenu.style.display = 'block';
        } else {
            accessibilityMenu.style.display = 'none';
        }
    };
    
    // Mensagens de status
    const showStatusMessage = (message) => {
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            hideStatusMessage();
        }, 3000);
    };
    
    const hideStatusMessage = () => {
        statusMessage.style.display = 'none';
    };
    
    // Funções de gerenciamento de dados
    
    // Carregar preferências do usuário
    const loadUserPreferences = () => {
        return ajax.call([{
            methodname: 'local_aguiaplugin_get_preferences',
            args: {}
        }])[0]
        .then((response) => {
            return response;
        })
        .catch((error) => {
            console.error('Erro ao carregar preferências:', error);
            return {
                fontsize: 100,
                contrast: 'normal',
                readablefonts: 0,
                linespacing: 100,
                speech: 0,
                texthelper: 0,
                colorblind: 'none'
            };
        });
    };
    
    // Salvar preferências do usuário
    const saveUserPreferences = () => {
        const prefs = {
            fontsize: currentFontSize,
            contrast: currentContrast,
            readablefonts: useReadableFonts ? 1 : 0,
            linespacing: currentLineSpacing,
            speech: speechEnabled ? 1 : 0,
            texthelper: textHelperEnabled ? 1 : 0,
            colorblind: currentColorBlindMode
        };
        
        ajax.call([{
            methodname: 'local_aguiaplugin_save_preferences',
            args: prefs
        }])[0]
        .then((response) => {
            if (response.success) {
                Str.get_string('preferences_saved', 'local_aguiaplugin').then(function(msg) {
                    showStatusMessage(msg);
                });
            } else {
                Str.get_string('preferences_error', 'local_aguiaplugin').then(function(msg) {
                    showStatusMessage(msg);
                });
            }
        })
        .catch((error) => {
            console.error('Erro ao salvar preferências:', error);
            Str.get_string('preferences_error', 'local_aguiaplugin').then(function(msg) {
                showStatusMessage(msg);
            });
        });
    };
    
    // Adicionar estilos CSS necessários para o plugin
    const addStyles = () => {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            :root {
                --font-size-multiplier: 100%;
                --line-height-multiplier: 100%;
            }
            
            .high-contrast {
                background-color: #000 !important;
                color: #fff !important;
            }
            
            .high-contrast * {
                background-color: #000 !important;
                color: #fff !important;
                border-color: #fff !important;
            }
            
            .high-contrast a {
                color: #ffff00 !important;
            }
            
            .high-contrast img {
                filter: grayscale(100%) contrast(150%) !important;
            }
            
            .inverted-colors {
                filter: invert(100%) hue-rotate(180deg) !important;
            }
            
            .inverted-colors img {
                filter: invert(100%) hue-rotate(180deg) !important;
            }
            
            .readable-fonts,
            .readable-fonts * {
                font-family: "Open Dyslexic", "Comic Sans MS", "Arial", sans-serif !important;
                font-weight: 400 !important;
                letter-spacing: 0.05em !important;
                word-spacing: 0.15em !important;
            }
            
            .text-to-speech [role="button"],
            .text-to-speech p,
            .text-to-speech h1,
            .text-to-speech h2,
            .text-to-speech h3,
            .text-to-speech h4,
            .text-to-speech h5,
            .text-to-speech h6,
            .text-to-speech li,
            .text-to-speech td,
            .text-to-speech th,
            .text-to-speech a,
            .text-to-speech button,
            .text-to-speech label {
                cursor: pointer !important;
            }
            
            .text-to-speech [role="button"]:hover,
            .text-to-speech p:hover,
            .text-to-speech h1:hover,
            .text-to-speech h2:hover,
            .text-to-speech h3:hover,
            .text-to-speech h4:hover,
            .text-to-speech h5:hover,
            .text-to-speech h6:hover,
            .text-to-speech li:hover,
            .text-to-speech td:hover,
            .text-to-speech th:hover,
            .text-to-speech a:hover,
            .text-to-speech button:hover,
            .text-to-speech label:hover {
                background-color: rgba(255, 255, 0, 0.2) !important;
            }
        `;
        document.head.appendChild(styleElement);
    };
    
    // Adicionar os estilos CSS
    addStyles();
    
    // Inicializar o plugin
    initialize();
};
