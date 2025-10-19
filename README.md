# AGUIA Plugin de Acessibilidade para Moodle

![Versão](https://img.shields.io/badge/versão-1.5.0-blue.svg)
![Moodle](https://img.shields.io/badge/Moodle-4.0+-orange.svg)
![Licença](https://img.shields.io/badge/licença-GPL%20v3-green.svg)

O plugin AGUIA (Acessibilidade e Guia para Inclusão e Aprendizagem) é uma ferramenta de acessibilidade para o Moodle, especialmente projetada para pessoas com deficiência visual. O plugin oferece diversas funcionalidades que seguem as diretrizes de acessibilidade WCAG 2.1 nível AA, melhorando a experiência de uso da plataforma Moodle para todos os usuários.

## Características

- **Ajuste de tamanho de fonte (WCAG 1.4.4)**: Permitindo aumentar, diminuir ou redefinir o tamanho da fonte.
- **Configurações de contraste (WCAG 1.4.3, 1.4.6)**: Opções de alto contraste e cores invertidas.
- **Fontes mais legíveis (WCAG 1.4.8)**: Substitui as fontes por alternativas mais legíveis para pessoas com dislexia.
- **Espaçamento entre linhas (WCAG 1.4.8)**: Permite ajustar o espaçamento para facilitar a leitura.
- **Modos de daltonismo (WCAG 1.4.3)**: Filtros de cores para diferentes tipos de daltonismo:
  - Protanomalia/Protanopia (dificuldade em perceber vermelho)
  - Deuteranomalia/Deuteranopia (dificuldade em perceber verde)
  - Tritanomalia/Tritanopia (dificuldade em perceber azul)
- **Leitura de texto (Text-to-Speech)**: Lê o texto quando o usuário clica em um elemento.
- **Auxiliar de leitura (WCAG 2.4.8)**: Realça a linha de texto onde o cursor está posicionado.
- **Destaque para links (WCAG 1.4.1)**: Permite destacar visualmente os links para melhor identificação.
- **Foco visível (WCAG 2.4.7)**: Destaca claramente os elementos com foco durante a navegação por teclado.
- **Lupa de conteúdo**: Amplia o texto sob o cursor para facilitar a leitura de conteúdos específicos.
- **Persistência de configurações**: Todas as preferências do usuário são salvas no banco de dados e restauradas automaticamente quando o usuário faz login novamente.

## Compatibilidade

- Moodle 4.0+ (versão 2022041900 ou superior)

## Instalação

1. Baixe o código fonte
2. Extraia o conteúdo em `/path/to/moodle/local/`
3. Renomeie a pasta para "aguiaplugin" (se necessário)
4. Acesse como administrador para completar a instalação

Alternativamente, você pode instalar usando git:

```bash
cd /path/to/moodle/local/
git clone https://github.com/LucasBissolotti/aguiaplugin.git aguiaplugin
```

Depois, acesse o site como administrador para concluir a instalação.

## Configuração

Após a instalação, você pode configurar o plugin acessando:
Administração do site > Plugins > Plugins locais > AGUIA Plugin

## Uso

Depois de ativado, o plugin adiciona um botão flutuante com o logo AGUIA no canto inferior direito de todas as páginas do Moodle. Ao clicar nesse botão, um menu de opções de acessibilidade é exibido, permitindo aos usuários ajustarem as configurações conforme suas necessidades. O carregamento do botão é garantido pelos scripts globais, incluindo `js/botoes_acessibilidade.js`.

O plugin foi projetado para ser totalmente acessível:
- Navegação completa por teclado (WCAG 2.1.1)
- Rótulos adequados para leitores de tela (WCAG 1.1.1)
- Mensagens de status acessíveis (WCAG 4.1.3)
- Contraste suficiente para todas as interfaces (WCAG 1.4.3)

As preferências do usuário são salvas no banco de dados e aplicadas em todas as sessões futuras.

## Estrutura do projeto

```
aguiaplugin/
├── index.php                # Página principal do plugin
├── lib.php                  # Funções principais e hooks do Moodle
├── settings.php             # Configurações administrativas
├── version.php              # Informações de versão e compatibilidade
├── db/                      # Estrutura de banco de dados
├── js/                      # Ferramentas e API de front-end
├── preferences/             # Endpoints PHP e fallback de preferências
├── lang/                    # Idiomas do plugin
├── pix/                     # Logotipo do plugin
├── styles/                  # Arquivos de estilos css do plugin
│   └── icons/               # Icones das ferramentas de acessibilidade
├── docs/                    # Documentação (diagramas, imagens)
└── README.md
```

### Descrição das pastas principais

- `db/`: define estrutura de banco de dados, upgrades e serviços externos usados pelo Moodle.
- `js/`: concentra os módulos JavaScript responsáveis pelas ferramentas e pela API de preferências do front-end (por exemplo, `js/api_preferencias.js`).
- `preferences/`: expõe endpoints PHP internos/externos e utilitários (inclui fallback em arquivo em `preferences/armazenamento_arquivos.php`).
- `lang/`: armazena strings de idioma (inglês por padrão) exigidas pelo Moodle.
- `pix/`: contém os recursos visuais do plugin, incluindo o logotipo exibido no botão flutuante.
- `styles/`: reúne as folhas de estilo base e o diretório `styles/icons/` com ajustes específicos para os ícones.
- `docs/`: materiais de documentação, como diagramas de sequência e de classes.

## Armazenamento de preferências

O AGUIA persiste as escolhas dos usuários de duas formas:

- **Banco de dados Moodle**: a API `\local_aguiaplugin\preferences\ApiPreferencias` grava e atualiza as preferências na tabela `local_aguiaplugin_prefs`.
- **Fallback em arquivo**: quando o banco não está disponível, `preferences/armazenamento_arquivos.php` registra JSONs no diretório `preferences/data/` para manter a experiência consistente.

Observação: o estilo para “Letras destacadas” é `styles/letras_destaque.css`.

## Conformidade com WCAG 2.1 Nível AA

O plugin atende às seguintes diretrizes de acessibilidade:

- **Princípio 1: Perceptível**
  - 1.1.1 Conteúdo Não Textual (A)
  - 1.4.1 Uso da Cor (A)
  - 1.4.3 Contraste (Mínimo) (AA)
  - 1.4.4 Redimensionar texto (AA)
  - 1.4.6 Contraste (Aprimorado) (AAA)
  - 1.4.8 Apresentação Visual (AAA)

- **Princípio 2: Operável**
  - 2.1.1 Teclado (A)
  - 2.1.2 Sem Bloqueio do Teclado (A)
  - 2.4.3 Ordem de Foco (A)
  - 2.4.7 Foco Visível (AA)
  - 2.4.8 Localização (AAA)

- **Princípio 3: Compreensível**
  - 3.1.1 Idioma da Página (A)
  - 3.1.2 Idioma das Partes (AA)
  - 3.2.1 Em Foco (A)
  - 3.2.2 Em Entrada (A)
  - 3.2.3 Navegação Consistente (AA)
  - 3.2.4 Identificação Consistente (AA)
  - 3.3.1 Identificação do Erro (A)
  - 3.3.2 Etiquetas ou Instruções (A)
  - 3.3.3 Sugestão de Erro (AA)

- **Princípio 4: Robusto**
  - 4.1.3 Mensagens de Status (AA)

## Privacidade (LGPD/GDPR)

Este plugin implementa o provedor de privacidade do Moodle para declarar, exportar e excluir os dados armazenados em `local_aguiaplugin_prefs`.

- Onde ficam os dados: na tabela `local_aguiaplugin_prefs`.
- Exportação: os dados são exportados pelo fluxo padrão do Moodle em Administração do site > Usuários > Privacidade e políticas > Exportar dados do usuário. O resultado é um pacote (ZIP) com arquivos JSON/HTML contendo as informações exportadas por componente. As preferências também aparecem em "User preferences" no relatório.
- Exclusão: é possível solicitar a exclusão de dados pelo mesmo fluxo ("Excluir dados do usuário"). O provider do plugin remove as linhas para o(s) usuário(s) na tabela.

## Desenvolvimento futuro

Planejamos adicionar as seguintes funcionalidades em versões futuras:
- Opções de navegação simplificada
- Suporte a mais idiomas (incluindo espanhol e inglês completo)
- Integrações com tecnologias assistivas adicionais
- Reconhecimento de voz para controle de funções
- Melhoria na detecção automática de necessidades de acessibilidade
- Relatórios de uso e eficácia das ferramentas

## Suporte

Se encontrar problemas ou tiver sugestões, abra uma [issue](https://github.com/LucasBissolotti/aguiaplugin/issues) no GitHub.

## Licença

Este plugin é licenciado sob os termos da [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.html) ou posterior.

---

Desenvolvido por Lucas Bissolotti e Matheus Bordinhão - © 2025
