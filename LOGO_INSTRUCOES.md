# Instruções para instalar a logo AGUIA no plugin

Para usar a imagem personalizada do logo AGUIA no plugin de acessibilidade, siga estas etapas:

## Passo 1: Preparar a imagem
1. A imagem deve estar preferencialmente no formato PNG com fundo transparente
2. Dimensão recomendada: 200x200 pixels
3. O arquivo deve ser nomeado `aguia_logo.png`

## Passo 2: Substituir a imagem
1. Localize a pasta do plugin em seu servidor Moodle:
   ```
   [pasta_raiz_moodle]/local/aguiaplugin/pix/
   ```
2. Substitua o arquivo `aguia_logo.png` existente pela sua versão personalizada.

## Passo 3: Limpar o cache
1. Acesse o painel administrativo do Moodle
2. Navegue até: Administração do site > Desenvolvimento > Limpar caches
3. Clique em "Limpar todos os caches"

## Passo 4: Verificar
1. Navegue até qualquer página do Moodle
2. Verifique se o botão de acessibilidade está exibindo corretamente o novo logo
3. Teste a funcionalidade clicando no botão para abrir o menu

## Nota importante:
- Certifique-se de que sua imagem tenha bom contraste para ser bem visível em diferentes cores de fundo
- A imagem será exibida em um botão circular, então o design deve funcionar bem nesse formato
- Para um melhor resultado, use uma imagem com área de segurança ao redor do elemento principal, garantindo que nada importante seja cortado na visualização circular

Se encontrar problemas, verifique:
1. Permissões de arquivo: a imagem deve ser legível pelo servidor web
2. Tamanho do arquivo: otimize a imagem para carregamento rápido (menos de 100KB)
3. Formato correto: confirme que o arquivo está realmente em formato PNG
