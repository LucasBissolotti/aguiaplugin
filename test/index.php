<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste do Plugin AGUIA</title>

    <!-- Adicionando o CSS do plugin -->
    <style>
        /* Estilos gerais do corpo */
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f7fc;
            margin: 0;
            padding: 0;
            transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Container principal */
        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 30px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            margin-top: 50px;
        }

        /* Cabeçalho */
        h1 {
            color: #333;
            text-align: center;
            font-size: 2.5em;
            margin-bottom: 20px;
        }

        /* Subtítulo */
        h3 {
            color: #444;
            font-size: 1.4em;
            margin-bottom: 10px;
        }

        /* Parágrafo com texto de exemplo */
        .text-to-read {
            padding: 20px;
            border: 1px solid #ddd;
            background-color: #fafafa;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 1.1em;
            color: #333;
        }

        /* Botão de Acessibilidade */
        .accessibility-button {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 28px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: all 0.3s ease;
            z-index: 9999;
        }

        .accessibility-button:hover {
            transform: scale(1.1);
            background-color: #45a049;
        }

        /* Menu de Acessibilidade */
        .accessibility-menu {
            position: fixed;
            bottom: 100px;
            right: 30px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            display: none;
            width: 250px;
            z-index: 9999;
        }

        .accessibility-menu button {
            display: block;
            width: 100%;
            padding: 12px;
            margin: 8px 0;
            background-color: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .accessibility-menu button:hover {
            background-color: #f0f0f0;
        }

        /* Status da mensagem de processamento */
        .status-message {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #4caf50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
            display: none;
            z-index: 9999;
        }

        /* Barra de Progresso */
        #progressContainer {
            display: none;
            width: 100%;
            background-color: #f3f3f3;
            margin-top: 20px;
            border-radius: 10px;
        }

        #progressBar {
            width: 0%;
            height: 20px;
            background-color: #4caf50;
            text-align: center;
            color: white;
            border-radius: 10px;
        }

        /* Imagem carregada para OCR */
        #imageContainer {
            display: none;
            margin-top: 20px;
        }

        #ocrImage {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        /* Resultado do OCR */
        #ocrResult {
            margin-top: 20px;
            display: none;
        }

        #ocrText {
            padding: 10px;
            border: 1px solid #ddd;
            background-color: #f9f9f9;
            border-radius: 6px;
        }

        /* Modo Escuro */
        body.dark-mode {
            background-color: #333;
            color: #f4f7fc;
        }

        .dark-mode .container {
            background-color: #444;
        }

        /* Responsividade */
        @media (max-width: 768px) {
            .container {
                padding: 15px;
            }

            .accessibility-menu {
                width: 100%;
                padding: 15px;
            }

            .accessibility-button {
                width: 50px;
                height: 50px;
                font-size: 22px;
            }
        }
    </style>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/4.1.1/tesseract.min.js"></script>
</head>
<body>

    <div class="container">
        <h1>Teste de Acessibilidade do Plugin AGUIA</h1>
        <p>Esta página serve para testar as funcionalidades do plugin AGUIA, como leitura por voz, ajuste de contraste, ajuste de fonte e OCR.</p>

        <div>
            <h3>Funções de Acessibilidade:</h3>
            <ul>
                <li>Leitura de Texto: Clique no botão para ler o texto abaixo.</li>
                <li>Ajuste de Contraste: Altere entre o modo de alto contraste e normal.</li>
                <li>Ajuste de Fonte: Modifique o tamanho da fonte.</li>
                <li>Reconhecimento de Texto: Realize o OCR em uma imagem.</li>
            </ul>
        </div>

        <p id="textToRead" class="text-to-read">Este é um exemplo de texto para ser lido pelo sistema de acessibilidade. Você pode selecionar qualquer outro texto na página ou digitar seu próprio texto.</p>

        <div style="margin: 20px 0;">
            <h3>Selecione uma imagem para OCR:</h3>
            <input type="file" id="imageUpload" accept="image/*">
        </div>

        <button id="accessibilityButton" class="accessibility-button">
            <i class="fas fa-universal-access"></i>
        </button>

        <div id="accessibilityMenu" class="accessibility-menu">
            <button onclick="toggleContrast()" title="Alterar Contraste"><i class="fas fa-adjust"></i> Contraste</button>
            <button onclick="increaseFontSize()" title="Aumentar Tamanho da Fonte"><i class="fas fa-search-plus"></i> Aumentar Fonte</button>
            <button onclick="decreaseFontSize()" title="Diminuir Tamanho da Fonte"><i class="fas fa-search-minus"></i> Diminuir Fonte</button>
            <button onclick="readText()" title="Ler Texto"><i class="fas fa-volume-up"></i> Ler Texto</button>
            <button onclick="performOCR()" title="Realizar OCR"><i class="fas fa-camera-retro"></i> OCR</button>
        </div>

        <div id="imageContainer">
            <h3>Imagem para OCR:</h3>
            <img id="ocrImage" src="" alt="Imagem para OCR">
        </div>

        <div id="progressContainer">
            <div id="progressBar">0%</div>
        </div>

        <div id="ocrResult">
            <h3>Resultado do OCR:</h3>
            <div id="ocrText"></div>
        </div>
    </div>

    <div id="statusMessage" class="status-message">Processando...</div>

    <script>
        document.getElementById('accessibilityButton').addEventListener('click', function() {
            var menu = document.getElementById('accessibilityMenu');
            menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
        });

        let isHighContrast = false;
        function toggleContrast() {
            // Alterna entre modo claro e escuro
            document.body.classList.toggle('dark-mode');
        }

        function increaseFontSize() {
            let currentSize = parseInt(window.getComputedStyle(document.body).fontSize);
            document.body.style.fontSize = (currentSize + 2) + 'px';
        }

        function decreaseFontSize() {
            let currentSize = parseInt(window.getComputedStyle(document.body).fontSize);
            if (currentSize > 10) {
                document.body.style.fontSize = (currentSize - 2) + 'px';
            }
        }

        function readText() {
            var selectedText = window.getSelection().toString();
            var text = selectedText || document.getElementById('textToRead').innerText;

            if (text) {
                window.speechSynthesis.cancel();
                var speech = new SpeechSynthesisUtterance(text);
                speech.lang = 'pt-BR';
                window.speechSynthesis.speak(speech);
            } else {
                alert("Selecione algum texto ou digite para ouvir.");
            }
        }

        function performOCR() {
            var fileInput = document.getElementById('imageUpload');
            if (fileInput.files.length === 0) {
                alert('Por favor, selecione uma imagem primeiro.');
                return;
            }

            var file = fileInput.files[0];
            showStatusMessage("Processando OCR...");
            document.getElementById("progressContainer").style.display = "block";
            document.getElementById("ocrResult").style.display = "none";

            var reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById("ocrImage").src = e.target.result;
                document.getElementById("imageContainer").style.display = "block";

                Tesseract.recognize(
                    e.target.result,
                    'por',
                    {
                        logger: function(m) {
                            if (m.status === 'recognizing text') {
                                var progress = Math.round(m.progress * 100);
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

        function displayOCRText(text) {
            document.getElementById("ocrText").textContent = text;
            document.getElementById("ocrResult").style.display = "block";
        }

        function showStatusMessage(message) {
            var statusMessage = document.getElementById('statusMessage');
            statusMessage.textContent = message;
            statusMessage.style.display = 'block';
        }

        function hideStatusMessage() {
            var statusMessage = document.getElementById('statusMessage');
            statusMessage.style.display = 'none';
        }

        function updateProgress(progress) {
            var progressBar = document.getElementById('progressBar');
            progressBar.style.width = progress + '%';
            progressBar.textContent = progress + '%';
        }

        function hideProgressBar() {
            document.getElementById("progressContainer").style.display = "none";
            document.getElementById("progressBar").style.width = "0%";
            document.getElementById("progressBar").textContent = "0%";
        }
    </script>

</body>
</html>
