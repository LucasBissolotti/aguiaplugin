// accessibility.js - Plugin AGUIA de Acessibilidade

document.addEventListener("DOMContentLoaded", function() {
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
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
            display: 'none',
            zIndex: '9999'
        },
        progressContainer: {
            display: 'none',
            width: '100%',
            backgroundColor: '#f3f3f3',
            marginTop: '20px',
            borderRadius: '10px'
        },
        progressBar: {
            width: '0%',
            height: '20px',
            backgroundColor: '#4caf50',
            textAlign: 'center',
            color: 'white',
            borderRadius: '10px'
        }
    };

    // Estado do plugin
    const state = {
        isHighContrast: false,
        fontSizeMultiplier: 1,
        currentSpeech: null
    };

    // Elementos criados dinamicamente
    let accessibilityButton;
    let accessibilityMenu;
    let statusMessage;
    let progressContainer;
    let progressBar;
    let imageContainer;
    let ocrImage;
    let ocrResult;
    let ocrText;
    let fileInput;

    // Inicializa o plugin
    function init() {
        createElements();
        setupEventListeners();
        addStylesToHead();
    }

    // Cria os elementos do DOM necessários
    function createElements() {
        // Botão principal
        accessibilityButton = document.createElement('button');
        accessibilityButton.id = 'accessibilityButton';
        accessibilityButton.className = 'accessibility-button';
        accessibilityButton.setAttribute('aria-label', 'Menu de Acessibilidade');
        accessibilityButton.setAttribute('title', 'Acessibilidade');
        Object.assign(accessibilityButton.style, styles.button);
        
        // Ícone do botão
        const icon = document.createElement('i');
        icon.className = 'fas fa-universal-access';
        accessibilityButton.appendChild(icon);
        document.body.appendChild(accessibilityButton);

        // Menu de acessibilidade
        accessibilityMenu = document.createElement('div');
        accessibilityMenu.id = 'accessibilityMenu';
        accessibilityMenu.className = 'accessibility-menu';
        Object.assign(accessibilityMenu.style, styles.menu);
        
        // Itens do menu
        const menuItems = [
            { text: 'Contraste', icon: 'fas fa-adjust', action: toggleContrast },
            { text: 'Aumentar Fonte', icon: 'fas fa-search-plus', action: increaseFontSize },
            { text: 'Diminuir Fonte', icon: 'fas fa-search-minus', action: decreaseFontSize },
            { text: 'Ler Texto', icon: 'fas fa-volume-up', action: readText },
            { text: 'OCR', icon: 'fas fa-camera-retro', action: showOCRInput }
        ];
        
        menuItems.forEach(item => {
            const button = document.createElement('button');
            button.innerHTML = `<i class="${item.icon}"></i> ${item.text}`;
            button.onclick = item.action;
            Object.assign(button.style, styles.menuItem);
            
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

        // Container de imagem OCR
        imageContainer = document.createElement('div');
        imageContainer.id = 'imageContainer';
        imageContainer.style.display = 'none';
        imageContainer.style.marginTop = '20px';
        
        const imageTitle = document.createElement('h3');
        imageTitle.textContent = 'Imagem para OCR:';
        imageContainer.appendChild(imageTitle);
        
        ocrImage = document.createElement('img');
        ocrImage.id = 'ocrImage';
        ocrImage.src = '';
        ocrImage.alt = 'Imagem para OCR';
        ocrImage.style.maxWidth = '100%';
        ocrImage.style.height = 'auto';
        ocrImage.style.border = '1px solid #ddd';
        ocrImage.style.borderRadius = '5px';
        imageContainer.appendChild(ocrImage);
        
        document.body.appendChild(imageContainer);

        // Resultado do OCR
        ocrResult = document.createElement('div');
        ocrResult.id = 'ocrResult';
        ocrResult.style.display = 'none';
        ocrResult.style.marginTop = '20px';
        
        const resultTitle = document.createElement('h3');
        resultTitle.textContent = 'Resultado do OCR:';
        ocrResult.appendChild(resultTitle);
        
        ocrText = document.createElement('div');
        ocrText.id = 'ocrText';
        ocrText.style.padding = '10px';
        ocrText.style.border = '1px solid #ddd';
        ocrText.style.backgroundColor = '#f9f9f9';
        ocrText.style.borderRadius = '6px';
        ocrResult.appendChild(ocrText);
        
        document.body.appendChild(ocrResult);

        // Input de arquivo (oculto)
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'imageUpload';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', performOCR);
        document.body.appendChild(fileInput);
    }

    // Configura os event listeners
    function setupEventListeners() {
        // Botão principal
        accessibilityButton.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });

        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!accessibilityMenu.contains(e.target) && e.target !== accessibilityButton) {
                accessibilityMenu.style.display = 'none';
            }
        });

        // Efeitos de hover
        accessibilityButton.addEventListener('mouseenter', function() {
            Object.assign(accessibilityButton.style, styles.buttonHover);
        });
        
        accessibilityButton.addEventListener('mouseleave', function() {
            Object.assign(accessibilityButton.style, styles.button);
        });

        // Fechar menu com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && accessibilityMenu.style.display === 'block') {
                accessibilityMenu.style.display = 'none';
            }
        });
    }

    // Adiciona estilos dinâmicos ao head
    function addStylesToHead() {
        const style = document.createElement('style');
        style.textContent = `
            .dark-mode {
                background-color: #333 !important;
                color: #f4f7fc !important;
            }
            
            .dark-mode .container {
                background-color: #444 !important;
            }
            
            @media (max-width: 768px) {
                .accessibility-menu {
                    width: 100% !important;
                    padding: 15px !important;
                }
                
                .accessibility-button {
                    width: 50px !important;
                    height: 50px !important;
                    font-size: 22px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Alternar visibilidade do menu
    function toggleMenu() {
        accessibilityMenu.style.display = 
            accessibilityMenu.style.display === 'block' ? 'none' : 'block';
    }

    // Alternar modo de contraste
    function toggleContrast() {
        state.isHighContrast = !state.isHighContrast;
        document.body.classList.toggle('dark-mode');
        accessibilityMenu.style.display = 'none';
    }

    // Aumentar tamanho da fonte
    function increaseFontSize() {
        state.fontSizeMultiplier += 0.1;
        document.documentElement.style.fontSize = 
            `${state.fontSizeMultiplier * 100}%`;
        accessibilityMenu.style.display = 'none';
    }

    // Diminuir tamanho da fonte
    function decreaseFontSize() {
        if (state.fontSizeMultiplier > 0.5) {
            state.fontSizeMultiplier -= 0.1;
            document.documentElement.style.fontSize = 
                `${state.fontSizeMultiplier * 100}%`;
            accessibilityMenu.style.display = 'none';
        }
    }

    // Ler texto selecionado ou padrão
    function readText() {
        const selectedText = window.getSelection().toString();
        const defaultText = document.querySelector('.text-to-read')?.innerText || 
                           'Nenhum texto encontrado para ler. Selecione algum texto na página.';
        
        const textToRead = selectedText || defaultText;

        if ('speechSynthesis' in window) {
            // Cancela qualquer fala em andamento
            window.speechSynthesis.cancel();
            
            const speech = new SpeechSynthesisUtterance(textToRead);
            speech.lang = 'pt-BR';
            window.speechSynthesis.speak(speech);
            
            state.currentSpeech = speech;
        } else {
            alert('Seu navegador não suporta síntese de voz.');
        }
        
        accessibilityMenu.style.display = 'none';
    }

    // Mostrar input para OCR
    function showOCRInput() {
        fileInput.click();
        accessibilityMenu.style.display = 'none';
    }

    // Realizar OCR na imagem selecionada
    function performOCR() {
        if (fileInput.files.length === 0) return;

        const file = fileInput.files[0];
        showStatusMessage("Processando OCR...");
        progressContainer.style.display = "block";
        ocrResult.style.display = "none";

        const reader = new FileReader();
        reader.onload = function(e) {
            ocrImage.src = e.target.result;
            imageContainer.style.display = "block";

            Tesseract.recognize(
                e.target.result,
                'por',
                {
                    logger: function(m) {
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            updateProgress(progress);
                        }
                    }
                }
            ).then(function(result) {
                hideStatusMessage();
                hideProgressBar();
                displayOCRText(result.data.text);
            }).catch(function(err) {
                hideStatusMessage();
                hideProgressBar();
                console.error("Erro no OCR:", err);
                alert('Erro ao processar a imagem. Verifique o console para detalhes.');
            });
        };
        reader.readAsDataURL(file);
    }

    // Mostrar texto resultante do OCR
    function displayOCRText(text) {
        ocrText.textContent = text;
        ocrResult.style.display = "block";
    }

    // Mostrar mensagem de status
    function showStatusMessage(message) {
        statusMessage.textContent = message;
        statusMessage.style.display = 'block';
    }

    // Esconder mensagem de status
    function hideStatusMessage() {
        statusMessage.style.display = 'none';
    }

    // Atualizar barra de progresso
    function updateProgress(progress) {
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';
    }

    // Esconder barra de progresso
    function hideProgressBar() {
        progressContainer.style.display = "none";
        progressBar.style.width = "0%";
        progressBar.textContent = "0%";
    }

    // Inicializar o plugin
    init();
});