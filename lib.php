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
    $PAGE->requires->js('/local/aguiaplugin/js/accessibility_icons.js');
    $PAGE->requires->js('/local/aguiaplugin/js/accessibility_wcag.js');
    $PAGE->requires->js('/local/aguiaplugin/js/colorblind_panel.js');
    $PAGE->requires->js('/local/aguiaplugin/js/initialize_colorblind.js');
    // Nova implementação direta do VLibras (carregada primeiro)
    $PAGE->requires->js('/local/aguiaplugin/js/vlibras_direct.js');
    $PAGE->requires->js('/local/aguiaplugin/js/vlibras_direct_inject.js');
    $PAGE->requires->js('/local/aguiaplugin/js/vlibras_bugfix.js');
    $PAGE->requires->js('/local/aguiaplugin/js/vlibras_init.js');
    $PAGE->requires->js('/local/aguiaplugin/js/vlibras_integration.js');
    $PAGE->requires->js('/local/aguiaplugin/js/vlibras_monitor.js');
    $PAGE->requires->js('/local/aguiaplugin/js/icon_updater.js');
    
    // Adiciona CSS personalizado para garantir a posição fixa do botão
    echo '<style>
        .aguia-button {
            position: fixed !important;
            bottom: 30px !important;
            right: 30px !important;
            z-index: 9999 !important;
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
    $cssreadingmask = new moodle_url('/local/aguiaplugin/styles/reading_mask_cursor.css');
    $cssicons = new moodle_url('/local/aguiaplugin/styles/icons.css');
    $cssmultiselect = new moodle_url('/local/aguiaplugin/styles/multi_select.css');
    $cssbutton = new moodle_url('/local/aguiaplugin/styles/button_styles.css');
    $cssvlibras = new moodle_url('/local/aguiaplugin/styles/vlibras.css');
    $cssvlibrasforce = new moodle_url('/local/aguiaplugin/styles/vlibras_force.css');
    
    return "
        <link rel='stylesheet' type='text/css' href='{$cssbase}'>
        <link rel='stylesheet' type='text/css' href='{$csswcag}'>
        <link rel='stylesheet' type='text/css' href='{$csscolorblind}'>
        <link rel='stylesheet' type='text/css' href='{$cssreadingmask}'>
        <link rel='stylesheet' type='text/css' href='{$cssicons}'>
        <link rel='stylesheet' type='text/css' href='{$cssmultiselect}'>
        <link rel='stylesheet' type='text/css' href='{$cssbutton}'>
        <link rel='stylesheet' type='text/css' href='{$cssvlibras}'>
        <link rel='stylesheet' type='text/css' href='{$cssvlibrasforce}'>
    ";
}
