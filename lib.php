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
    $PAGE->requires->js('/local/aguiaplugin/js/error_detection.js'); // Carrega primeiro o detector de erros
    $PAGE->requires->js('/local/aguiaplugin/js/memory_management.js'); // Carrega o gerenciador de memória
    $PAGE->requires->js('/local/aguiaplugin/js/accessibility_icons.js');
    $PAGE->requires->js('/local/aguiaplugin/js/accessibility_wcag.js');
    $PAGE->requires->js('/local/aguiaplugin/js/colorblind_panel.js');
    $PAGE->requires->js('/local/aguiaplugin/js/initialize_colorblind.js');
    $PAGE->requires->js('/local/aguiaplugin/js/icon_updater.js');
    $PAGE->requires->js('/local/aguiaplugin/js/highlighted_letters.js');
    $PAGE->requires->js('/local/aguiaplugin/js/display_fix.js'); // Carrega primeiro o script para corrigir problemas de exibição
    $PAGE->requires->js('/local/aguiaplugin/js/content_magnifier.js'); // Carrega a lupa de conteúdo
    $PAGE->requires->js('/local/aguiaplugin/js/magnifier_standalone.js'); // Carrega a versão independente da lupa
    $PAGE->requires->js('/local/aguiaplugin/js/remove_magnifier_button.js'); // Remove o botão da lupa visualmente
    
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
            width: 34px !important;
            height: 34px !important;
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
    echo '
    <div vw class="enabled">
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper></div>
    </div>
    <script src="https://vlibras.gov.br/app/vlibras-plugin.js"></script>
    <script>
      new window.VLibras.Widget(\'https://vlibras.gov.br/app\');
    </script>
    ';
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
    
    // Adiciona os arquivos CSS no cabeçalho HTML
    $cssbase = new moodle_url('/local/aguiaplugin/styles/base.css');
    $csswcag = new moodle_url('/local/aguiaplugin/styles/wcag.css');
    $csscolorblind = new moodle_url('/local/aguiaplugin/styles/colorblind.css');
    $csscolorintensity = new moodle_url('/local/aguiaplugin/styles/color_intensity.css');
    $cssreadingmask = new moodle_url('/local/aguiaplugin/styles/reading_mask_cursor.css');
    $cssicons = new moodle_url('/local/aguiaplugin/styles/icons.css');
    $cssmultiselect = new moodle_url('/local/aguiaplugin/styles/multi_select.css');
    $cssbutton = new moodle_url('/local/aguiaplugin/styles/button_styles.css');
    $cssvlibras = new moodle_url('/local/aguiaplugin/styles/vlibras.css');
    $cssspacing = new moodle_url('/local/aguiaplugin/styles/spacing_indicators.css');
    $cssspacing_add = new moodle_url('/local/aguiaplugin/styles/spacing_additional.css');
    $cssspacing_separated = new moodle_url('/local/aguiaplugin/styles/spacing_separated.css');
    $csshandtalk = new moodle_url('/local/aguiaplugin/styles/handtalk_spacing.css');
    $csshighlightedletters = new moodle_url('/local/aguiaplugin/styles/highlighted_letters.css');
    $cssopendyslexic = new moodle_url('/local/aguiaplugin/styles/opendyslexic.css');
    $csscontentmagnifier = new moodle_url('/local/aguiaplugin/styles/content_magnifier.css');
    $cssmagnifierfix = new moodle_url('/local/aguiaplugin/styles/magnifier_fix.css');
    $csshidemagnifierbutton = new moodle_url('/local/aguiaplugin/styles/hide_magnifier_button.css');
    
    return "
        <link rel='stylesheet' type='text/css' href='{$cssbase}'>
        <link rel='stylesheet' type='text/css' href='{$csswcag}'>
        <link rel='stylesheet' type='text/css' href='{$csscolorblind}'>
        <link rel='stylesheet' type='text/css' href='{$csscolorintensity}'>
        <link rel='stylesheet' type='text/css' href='{$cssreadingmask}'>
        <link rel='stylesheet' type='text/css' href='{$cssicons}'>
        <link rel='stylesheet' type='text/css' href='{$cssmultiselect}'>
        <link rel='stylesheet' type='text/css' href='{$cssbutton}'>
        <link rel='stylesheet' type='text/css' href='{$cssvlibras}'>
        <link rel='stylesheet' type='text/css' href='{$cssspacing}'>
        <link rel='stylesheet' type='text/css' href='{$cssspacing_add}'>
        <link rel='stylesheet' type='text/css' href='{$cssspacing_separated}'>
        <link rel='stylesheet' type='text/css' href='{$csshandtalk}'>
        <link rel='stylesheet' type='text/css' href='{$csshighlightedletters}'>
        <link rel='stylesheet' type='text/css' href='{$cssopendyslexic}'>
        <link rel='stylesheet' type='text/css' href='{$csscontentmagnifier}'>
        <link rel='stylesheet' type='text/css' href='{$cssmagnifierfix}'>
        <link rel='stylesheet' type='text/css' href='{$csshidemagnifierbutton}'>
    ";
}
