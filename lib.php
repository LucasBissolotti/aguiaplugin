<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Funções principais do plugin AGUIA
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Função para adicionar o JavaScript em todas as páginas
 */
function local_aguiaplugin_require_js() {
    global $PAGE, $CFG, $OUTPUT;
    
    // Verifica se o plugin está ativado nas configurações
    $enabled = get_config('local_aguiaplugin', 'enable');
    // Se não estiver definido, assume-se que está habilitado (padrão 1)
    if ($enabled === false) {
        $enabled = 1;
    }
    
    if ($enabled == 0) {
        return;
    }
    
    // Carrega os scripts JavaScript
    $PAGE->requires->js('/local/aguiaplugin/js/detecao_erros.js'); // Carrega primeiro o detector de erros
    $PAGE->requires->js('/local/aguiaplugin/js/gerenciamento_memoria.js'); // Carrega o gerenciador de memória
    $PAGE->requires->js('/local/aguiaplugin/js/icones_acessibilidade.js');
    $PAGE->requires->js('/local/aguiaplugin/preferences/api_preferencias.js'); // Nova API centralizada de preferências
    $PAGE->requires->js('/local/aguiaplugin/js/acessibilidade_wcag.js');
    $PAGE->requires->js('/local/aguiaplugin/js/painel_daltonismo.js');
    $PAGE->requires->js('/local/aguiaplugin/js/inicializar_daltonismo.js');
    $PAGE->requires->js('/local/aguiaplugin/js/atualizador_icones.js');
    $PAGE->requires->js('/local/aguiaplugin/js/letras_destaque.js');
    $PAGE->requires->js('/local/aguiaplugin/js/ajuste_exibicao.js'); // Carrega primeiro o script para corrigir problemas de exibição
    $PAGE->requires->js('/local/aguiaplugin/js/ampliador_conteudo.js'); // Carrega a lupa de conteúdo
    $PAGE->requires->js('/local/aguiaplugin/js/ampliador_autonomo.js'); // Carrega a versão independente da lupa
    
    // Adiciona CSS personalizado para garantir a posição fixa do botão
    echo '<style>
        .aguia-button {
            position: fixed !important;
            top: 43% !important; /* Posicionado um pouco acima do meio vertical da tela */
            transform: translateY(-50%) !important; /* Ajuste para centralização perfeita */
            right: 10px !important; /* Reduzida distância da borda direita */
            z-index: 9999 !important;
            background-color: #2271ff !important;
            border-radius: 10px !important;
            border: 1px solid #2271ff !important; /* Borda reduzida de 2px para 1px */
            width: 40px !important; /* Tamanho reduzido para 40px conforme solicitado */
            height: 40px !important; /* Tamanho reduzido para 40px conforme solicitado */
        }
        .aguia-logo {
            width: 36px !important;
            height: 36px !important;
            border-radius: 8px !important;
            object-fit: cover !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
        }
        
        /* Estilo para o hover mostrando AGUIA em uma faixa lateral */
        .aguia-button::before {
            content: "AGUIA" !important;
            position: absolute !important;
            left: -100px !important;
            top: 0 !important;
            height: 40px !important; /* Mesmo tamanho do botão */
            background-color: #2271ff !important;
            color: white !important;
            padding: 0 30px !important; /* Aumentado horizontalmente */
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            border-radius: 10px !important;
            font-weight: bold !important;
            font-size: 14px !important;
            box-shadow: 0 3px 10px rgba(0, 86, 179, 0.5) !important;
            border: 1px solid #2271ff !important;
            white-space: nowrap !important;
            z-index: 9998 !important;
            opacity: 0 !important;
            transform: translateX(20px) !important;
            transition: all 0.3s ease !important;
            pointer-events: none !important;
        }
        
        .aguia-button:hover::before {
            opacity: 1 !important;
            left: -115px !important;
            transform: translateX(0) !important;
        }
        
        /* Limpa todos os estilos que podem estar interferindo */
        .aguia-submenu-option::before {
            content: none !important;
            display: none !important;
        }
        
        .aguia-multi-select-option::before {
            content: none !important;
            display: none !important;
        }
        
        /* Estrutura geral dos botões */
    .aguia-submenu-option {
            display: flex !important;
            align-items: center !important;
            padding: 10px 15px !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease !important;
            text-align: left !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            width: 100% !important;
            box-sizing: border-box !important;
            position: relative !important;
            border: none !important;
            background-color: white; /* sem !important para permitir estilos de estado ativo */
        }
        
        /* Estilos para os círculos coloridos de daltonismo */
        /* Removidos estilos de daltonismo antigos que usavam ::before */
        
        .aguia-submenu-option[data-value="none"]::before {
            content: "✓" !important;
            display: inline-flex !important;
            width: 20px !important;
            height: 20px !important;
            min-width: 20px !important;
            background-color: transparent !important;
            border-radius: 50% !important;
            margin-right: 10px !important;
            border: 1px solid #444 !important;
            align-items: center !important;
            justify-content: center !important;
            font-weight: bold !important;
            vertical-align: middle !important;
            flex-shrink: 0 !important;
        }
        
        /* Estados ativos dos botões */
        .aguia-submenu-option.active[data-value="protanopia"]::before,
        .aguia-submenu-option.active[data-value="deuteranopia"]::before,
        .aguia-submenu-option.active[data-value="tritanopia"]::before,
        .aguia-submenu-option.active[data-value="achromatopsia"]::before,
        .aguia-submenu-option.active[data-value="none"]::before {
            border: 2px solid #2271ff !important;
        }
        
        /* Estilos para o texto dentro dos botões */
        .aguia-submenu-option .option-text {
            display: inline-block !important;
            vertical-align: middle !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 14px !important;
            line-height: 1.5 !important;
            color: #333 !important;
        }
    </style>';
}

/**
 * Função chamada quando o Moodle carrega qualquer página. Adiciona o JS globalmente.
 */
function local_aguiaplugin_extend_navigation(navigation_node $node) {
    global $PAGE;
    
    // Adiciona o JavaScript a todas as páginas
    local_aguiaplugin_require_js();
}

/**
 * Função chamada antes do cabeçalho para garantir que o JS seja carregado
 */
function local_aguiaplugin_before_header() {
    global $PAGE;
    
    // Adiciona o JavaScript a todas as páginas
    local_aguiaplugin_require_js();
}

/**
 * Função chamada em cada carregamento de página para inicializar o plugin
 */
function local_aguiaplugin_before_footer() {
    global $PAGE;
    
    // Adiciona o JavaScript a todas as páginas
    local_aguiaplugin_require_js();
    
    // VLibras Widget 
            // VLibras removido
}

/**
 * Função chamada quando o Moodle renderiza o cabeçalho da página
 * Esta função é chamada antes que qualquer parte do HTML seja enviada
 */
function local_aguiaplugin_before_standard_html_head() {
    global $CFG, $USER;
    
    // Verificação rápida se o plugin está ativado e se o usuário está logado
    $enabled = get_config('local_aguiaplugin', 'enable');
    if ($enabled === false) {
        $enabled = 1;  // Habilitado por padrão
    }
    
    if ($enabled == 0) {
        return '';
    }
    
    // Lista de estilos carregados pelo plugin (todos em português)
    $arquivoscss = [
        'base.css',
        'wcag.css',
        'daltonismo.css',
        'painel_daltonismo.css',
        'intensidade_cores.css',
        'mascara_leitura_cursor.css',
        'icones.css',
        'interacoes_botoes.css',
        'estilos_botoes.css',
        'destaque_cabecalho.css',
        'espacamento_adicional.css',
        'espacamento_separado.css',
        'letras_destaque.css',
        'fonte_opendyslexic.css',
        'ampliador_conteudo.css',
    'icons/padronizacao_tamanho_icones.css',
    'icons/icones_unificados.css',
    'icons/ajuste_letras_destaque.css',
    'icons/ajuste_icone_espacamento_letras.css',
    'icons/ajuste_icone_ampliador.css',
    'icons/ajuste_icone_destaque_cabecalho.css',
    'icons/ajuste_intensidade_cor.css',
    'icons/ajuste_texto_para_fala.css',
    'icons/ajuste_texto_para_fala_adicional.css',
    'icons/ajuste_ocultar_imagens.css',
    'icons/ajuste_tamanho_texto.css',
    'icons/ajuste_altura_linha.css',
    'icons/ajuste_destaque_links.css',
    'icons/ajuste_mascara_foco_horizontal.css',
    'icons/ajuste_mascara_foco_vertical.css',
    'icons/ajuste_alto_contraste.css',
    'manutencao_icones.css', // Arquivo que garante que os ícones mantenham sua aparência original
    'correcao_icones_final.css', // Correção final para botões com problemas específicos de consistência
    'icons/correcao_cursor_personalizado.css',
    ];

    $links = [];
    foreach ($arquivoscss as $arquivo) {
        $url = new moodle_url('/local/aguiaplugin/styles/' . $arquivo);
        $links[] = "<link rel='stylesheet' type='text/css' href='{$url}'>";
    }

    return implode("\n        ", $links);
}
