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
    // Detecção de erros no navegador: apenas quando debug do plugin estiver ativo.
    $debug = get_config('local_aguiaplugin', 'debuglog');
    $debugenabled = ($debug === '1' || $debug === 1 || $debug === true);
    if ($debugenabled) {
        $PAGE->requires->js('/local/aguiaplugin/js/detecao_erros.js');
    }
    $PAGE->requires->js('/local/aguiaplugin/js/gerenciamento_memoria.js');
    $PAGE->requires->js('/local/aguiaplugin/js/icones_acessibilidade.js');
        $PAGE->requires->js('/local/aguiaplugin/js/botoes_acessibilidade.js');
    $PAGE->requires->js('/local/aguiaplugin/js/api_preferencias.js'); 
    $PAGE->requires->js('/local/aguiaplugin/js/acessibilidade_wcag.js'); 
    $PAGE->requires->js('/local/aguiaplugin/js/inicializar_daltonismo.js');
    $PAGE->requires->js('/local/aguiaplugin/js/atualizador_icones.js');
    $PAGE->requires->js('/local/aguiaplugin/js/letras_destaque.js');
    $PAGE->requires->js('/local/aguiaplugin/js/ajuste_exibicao.js');
    $PAGE->requires->js('/local/aguiaplugin/js/ampliador_conteudo.js'); 
    $PAGE->requires->js('/local/aguiaplugin/js/ampliador_autonomo.js'); 
    
}

/**
 * Função chamada antes do cabeçalho para garantir que o JS seja carregado
 */
function local_aguiaplugin_before_header() {
    global $PAGE;
    
    // Adiciona o JavaScript a todas as páginas
    local_aguiaplugin_require_js();
}

function local_aguiaplugin_extend_navigation(navigation_node $node) {
    local_aguiaplugin_require_js();
}

/**
 * Função chamada quando o Moodle renderiza o cabeçalho da página
 * Esta função é chamada antes que qualquer parte do HTML seja enviada
 */
function local_aguiaplugin_before_standard_html_head() {
    global $CFG, $USER, $PAGE;
    
    // Verificação rápida se o plugin está ativado e se o usuário está logado
    $enabled = get_config('local_aguiaplugin', 'enable');
    if ($enabled === false) {
        $enabled = 1;  // Habilitado por padrão
    }
    
    if ($enabled == 0) {
        return '';
    }

    // Garante que os scripts JS do plugin sejam carregados cedo no ciclo de renderização.
    local_aguiaplugin_require_js();
    
    // Lista de estilos carregados pelo plugin
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
        'aguia_button.css',
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
    'manutencao_icones.css',
    'correcao_icones_final.css', 
    'icons/correcao_cursor_personalizado.css',
    ];

    $links = [];
    foreach ($arquivoscss as $arquivo) {
        $url = new moodle_url('/local/aguiaplugin/styles/' . $arquivo);
        $links[] = "<link rel='stylesheet' type='text/css' href='{$url}'>";
    }

    return implode("\n        ", $links);
}
