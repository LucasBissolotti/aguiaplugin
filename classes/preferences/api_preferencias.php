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
 * Domain API to manage accessibility preferences
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_aguiaplugin\preferences;

defined('MOODLE_INTERNAL') || die();

class ApiPreferencias {
    public static function buscar_preferencias_usuario($usuarioid = null) {
        global $USER, $DB;
        if ($usuarioid === null) {
            $usuarioid = $USER->id;
        }
        $defaults = [
            'tamanho_fonte' => 100,
            'contraste' => 'normal',
            'fontes_legiveis' => 0,
            'espaco_linhas' => 100,
            'texto_para_fala' => 0,
            'auxiliar_leitura' => 0,
            'daltonismo' => 'none',
            'intensidade_cores' => 0,
            'modo_fonte' => 0,
            'espaco_letras' => 0,
            'destaque_links' => 0,
            'destaque_cabecalho' => 0,
            'mascara_leitura_modo' => 0,
            'mascara_horizontal_nivel' => 0,
            'mascara_vertical_nivel' => 0,
            'cursor_personalizado' => 0
        ];
        $record = $DB->get_record('local_aguiaplugin_prefs', ['usuarioid' => $usuarioid]);
        if ($record) {
            return $record;
        }
        $defaults = (object)$defaults;
        $defaults->usuarioid = $usuarioid;
        return $defaults;
    }

    public static function salvar_preferencias_usuario($preferencias, $usuarioid = null) {
        global $USER, $DB;
        if ($usuarioid === null) {
            $usuarioid = $USER->id;
        }
        $existing = $DB->get_record('local_aguiaplugin_prefs', ['usuarioid' => $usuarioid]);
        $registro = new \stdClass();
        $registro->usuarioid = $usuarioid;
        // Map legacy and new keys.
        $registro->tamanho_fonte = isset($preferencias->tamanho_fonte) ? (int)$preferencias->tamanho_fonte : (isset($preferencias->fontsize) ? (int)$preferencias->fontsize : 100);
        $registro->contraste = isset($preferencias->contraste) ? $preferencias->contraste : (isset($preferencias->contrast) ? ($preferencias->contrast === 'high' ? 'alto' : 'normal') : 'normal');
        $registro->fontes_legiveis = isset($preferencias->fontes_legiveis) ? (int)$preferencias->fontes_legiveis : (isset($preferencias->readablefonts) ? (int)$preferencias->readablefonts : 0);
        $registro->espaco_linhas = isset($preferencias->espaco_linhas) ? (int)$preferencias->espaco_linhas : (isset($preferencias->linespacing) ? (int)$preferencias->linespacing : 100);
        $registro->texto_para_fala = isset($preferencias->texto_para_fala) ? (int)$preferencias->texto_para_fala : (isset($preferencias->speech) ? (int)$preferencias->speech : 0);
        $registro->auxiliar_leitura = isset($preferencias->auxiliar_leitura) ? (int)$preferencias->auxiliar_leitura : (isset($preferencias->texthelper) ? (int)$preferencias->texthelper : 0);
        $registro->daltonismo = isset($preferencias->daltonismo) ? $preferencias->daltonismo : (isset($preferencias->colorblind) ? $preferencias->colorblind : 'none');
        $registro->intensidade_cores = isset($preferencias->intensidade_cores) ? (int)$preferencias->intensidade_cores : (isset($preferencias->colorIntensityMode) ? (int)$preferencias->colorIntensityMode : 0);
        $registro->modo_fonte = isset($preferencias->modo_fonte) ? (int)$preferencias->modo_fonte : (isset($preferencias->fontMode) ? (int)$preferencias->fontMode : 0);
        $registro->espaco_letras = isset($preferencias->espaco_letras) ? (int)$preferencias->espaco_letras : (isset($preferencias->letterSpacing) ? (int)$preferencias->letterSpacing : 0);
        $registro->destaque_links = isset($preferencias->destaque_links) ? (int)$preferencias->destaque_links : (isset($preferencias->emphasizeLinks) ? (int)$preferencias->emphasizeLinks : 0);
        $registro->destaque_cabecalho = isset($preferencias->destaque_cabecalho) ? (int)$preferencias->destaque_cabecalho : (isset($preferencias->headerHighlight) ? (int)$preferencias->headerHighlight : 0);
        $registro->mascara_leitura_modo = isset($preferencias->mascara_leitura_modo) ? (int)$preferencias->mascara_leitura_modo : (isset($preferencias->readingMaskMode) ? (int)$preferencias->readingMaskMode : 0);
        $registro->mascara_horizontal_nivel = isset($preferencias->mascara_horizontal_nivel) ? (int)$preferencias->mascara_horizontal_nivel : (isset($preferencias->horizontalMaskLevel) ? (int)$preferencias->horizontalMaskLevel : 0);
        $registro->mascara_vertical_nivel = isset($preferencias->mascara_vertical_nivel) ? (int)$preferencias->mascara_vertical_nivel : (isset($preferencias->verticalMaskLevel) ? (int)$preferencias->verticalMaskLevel : 0);
        $registro->cursor_personalizado = isset($preferencias->cursor_personalizado) ? (int)$preferencias->cursor_personalizado : (isset($preferencias->customCursor) ? (int)$preferencias->customCursor : 0);
        $registro->modificado_em = time();

        if ($existing) {
            $registro->id = $existing->id;
            return $DB->update_record('local_aguiaplugin_prefs', $registro);
        }
        return (bool)$DB->insert_record('local_aguiaplugin_prefs', $registro);
    }

    public static function converter_banco_para_js($preferenciasBanco) {
        return [
            'fontSize' => (int) ($preferenciasBanco->tamanho_fonte ?? 100),
            'highContrast' => (($preferenciasBanco->contraste ?? 'normal') === 'alto'),
            'readableFonts' => (bool) ($preferenciasBanco->fontes_legiveis ?? 0),
            'textToSpeech' => (bool) ($preferenciasBanco->texto_para_fala ?? 0),
            'readingHelper' => (bool) ($preferenciasBanco->auxiliar_leitura ?? 0),
            'colorblind' => ($preferenciasBanco->daltonismo ?? 'none'),
            'lineSpacing' => self::obter_nivel_espacamento_linha((int)($preferenciasBanco->espaco_linhas ?? 100)),
            'colorIntensityMode' => (int) ($preferenciasBanco->intensidade_cores ?? 0),
            'fontMode' => (int) ($preferenciasBanco->modo_fonte ?? 0),
            'letterSpacing' => (int) ($preferenciasBanco->espaco_letras ?? 0),
            'emphasizeLinks' => (bool) ($preferenciasBanco->destaque_links ?? 0),
            'headerHighlight' => (bool) ($preferenciasBanco->destaque_cabecalho ?? 0),
            'readingMaskMode' => (int) ($preferenciasBanco->mascara_leitura_modo ?? 0),
            'horizontalMaskLevel' => (int) ($preferenciasBanco->mascara_horizontal_nivel ?? 0),
            'verticalMaskLevel' => (int) ($preferenciasBanco->mascara_vertical_nivel ?? 0),
            'customCursor' => (bool) ($preferenciasBanco->cursor_personalizado ?? 0)
        ];
    }

    public static function atualizar_preferencia($preferencia, $valor, $preferenciasBanco) {
        if (function_exists('aguia_format_preference_value')) {
            $valor = aguia_format_preference_value($preferencia, $valor);
        }
        if (function_exists('aguia_debug_log')) {
            aguia_debug_log('Atualizando preferência', ['preferencia' => $preferencia, 'valor' => $valor]);
        }
        switch ($preferencia) {
            case 'fontSize':
                $preferenciasBanco->tamanho_fonte = (int)$valor;
                break;
            case 'highContrast':
                $preferenciasBanco->contraste = $valor ? 'alto' : 'normal';
                break;
            case 'readableFonts':
            case 'fontMode':
                $preferenciasBanco->fontes_legiveis = (int)$valor;
                $preferenciasBanco->modo_fonte = isset($preferenciasBanco->modo_fonte) ? (int)$preferenciasBanco->modo_fonte : (int)$valor;
                break;
            case 'lineSpacing':
                $valor = (int)$valor;
                $percentuais = [100, 150, 200, 250];
                $preferenciasBanco->espaco_linhas = $percentuais[$valor] ?? 100;
                break;
            case 'textToSpeech':
                $preferenciasBanco->texto_para_fala = $valor ? 1 : 0;
                break;
            case 'readingHelper':
                $preferenciasBanco->auxiliar_leitura = $valor ? 1 : 0;
                break;
            case 'colorblind':
                $permitidos = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
                $preferenciasBanco->daltonismo = in_array($valor, $permitidos) ? $valor : 'none';
                break;
            case 'colorIntensityMode':
                $preferenciasBanco->intensidade_cores = (int)$valor;
                break;
            case 'letterSpacing':
                $preferenciasBanco->espaco_letras = (int)$valor;
                break;
            case 'emphasizeLinks':
                $preferenciasBanco->destaque_links = $valor ? 1 : 0;
                break;
            case 'headerHighlight':
                $preferenciasBanco->destaque_cabecalho = $valor ? 1 : 0;
                break;
            case 'readingMaskMode':
                $preferenciasBanco->mascara_leitura_modo = (int)$valor;
                break;
            case 'horizontalMaskLevel':
                $preferenciasBanco->mascara_horizontal_nivel = (int)$valor;
                break;
            case 'verticalMaskLevel':
                $preferenciasBanco->mascara_vertical_nivel = (int)$valor;
                break;
            case 'customCursor':
                $preferenciasBanco->cursor_personalizado = $valor ? 1 : 0;
                break;
        }
        return $preferenciasBanco;
    }

    public static function obter_nivel_espacamento_linha($percentual) {
        if ($percentual >= 250) { return 3; }
        if ($percentual >= 200) { return 2; }
        if ($percentual >= 150) { return 1; }
        return 0;
    }
}
