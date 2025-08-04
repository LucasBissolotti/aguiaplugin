# AGUIA Plugin - Instruções de Implementação

## Sobre o Logo

O arquivo `pix/aguia_logo.png` deve ser substituído pela imagem do logo AGUIA que foi fornecida. Certifique-se de que:

1. A imagem tenha dimensões quadradas (recomendado 200x200 pixels)
2. O formato seja PNG com fundo transparente para melhor visualização
3. A imagem seja nítida e clara

## Implementação WCAG 2.1 Nível AA

Este plugin segue as diretrizes de acessibilidade WCAG 2.1 nível AA, incluindo:

- Contraste suficiente (WCAG 1.4.3)
- Redimensionamento de texto (WCAG 1.4.4)
- Alternativas de texto para componentes não textuais (WCAG 1.1.1)
- Navegabilidade por teclado (WCAG 2.1.1, 2.1.2)
- Foco visível (WCAG 2.4.7)
- Auxílios de navegação (WCAG 2.4.8)
- Ajuste de espaçamento de texto (WCAG 1.4.8)

## Como adicionar sua própria imagem:

1. Substitua o arquivo `pix/aguia_logo.png` pela sua imagem
2. Certifique-se de que a imagem tenha as dimensões adequadas
3. Limpe o cache do Moodle após a substituição utilizando:
   - Administração do site > Desenvolvimento > Limpar caches

## Personalização adicional

Para personalizar o estilo do botão ou outras características visuais, você pode editar os arquivos CSS:
- `styles/base.css` - Estilos básicos
- `styles/wcag.css` - Estilos que atendem às diretrizes WCAG

## Teste de acessibilidade

Recomendamos testar o plugin com:
- Leitores de tela (NVDA, JAWS, VoiceOver)
- Navegação exclusivamente por teclado
- Ferramentas de verificação de contraste
- Diferentes dispositivos e tamanhos de tela
