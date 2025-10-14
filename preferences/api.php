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
 * API central para gerenciamento de preferências
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_aguiaplugin\preferences;

defined('MOODLE_INTERNAL') || die();

/**
 * Classe para gerenciar preferências de acessibilidade dos usuários
 */
class ApiPreferencias {

    /**
     * Obtém as preferências do usuário atual.
     *
     * @param int|null $usuarioid ID do usuário ou null para usar o usuário atual
     * @return \stdClass Objeto com as preferências do usuário
     */
    public static function buscar_preferencias_usuario($usuarioid = null) {
        global $USER, $DB;

        if ($usuarioid === null) {
            $usuarioid = $USER->id;
        }

        $padroes = [
            'fontsize' => 100,
            'contrast' => 'normal',
            'readablefonts' => 0,
            'linespacing' => 100,
            'speech' => 0,
            'texthelper' => 0,
            'colorblind' => 'none'
        ];

        $registro = $DB->get_record('local_aguiaplugin_prefs', ['userid' => $usuarioid]);

        if ($registro) {
            return $registro;
        }

        $padroes = (object) $padroes;
        $padroes->userid = $usuarioid;
        return $padroes;
    }

    /**
     * Salva as preferências do usuário.
     *
     * @param \stdClass $preferencias Objeto com as preferências do usuário
     * @param int|null $usuarioid ID do usuário ou null para usar o usuário atual
     * @return bool Verdadeiro em caso de sucesso
     */
    public static function salvar_preferencias_usuario($preferencias, $usuarioid = null) {
        global $USER, $DB;

        if ($usuarioid === null) {
            $usuarioid = $USER->id;
        }

        $existente = $DB->get_record('local_aguiaplugin_prefs', ['userid' => $usuarioid]);

        $registro = new \stdClass();
        $registro->userid = $usuarioid;
        $registro->fontsize = isset($preferencias->fontsize) ? (int) $preferencias->fontsize : 100;
        $registro->contrast = isset($preferencias->contrast) ? $preferencias->contrast : 'normal';
        $registro->readablefonts = isset($preferencias->readablefonts) ? (int) $preferencias->readablefonts : 0;
        $registro->linespacing = isset($preferencias->linespacing) ? (int) $preferencias->linespacing : 100;
        $registro->speech = isset($preferencias->speech) ? (int) $preferencias->speech : 0;
        $registro->texthelper = isset($preferencias->texthelper) ? (int) $preferencias->texthelper : 0;
        $registro->colorblind = isset($preferencias->colorblind) ? $preferencias->colorblind : 'none';
        $registro->timemodified = time();

        if ($existente) {
            $registro->id = $existente->id;
            return $DB->update_record('local_aguiaplugin_prefs', $registro);
        }

        return (bool) $DB->insert_record('local_aguiaplugin_prefs', $registro);
    }

    /**
     * Converte preferências do formato do banco para o formato JavaScript.
     *
     * @param object $preferenciasBanco Objeto com as preferências do banco de dados
     * @return array Preferências prontas para uso no JavaScript
     */
    public static function converter_banco_para_js($preferenciasBanco) {
        return [
            'fontSize' => (int) $preferenciasBanco->fontsize,
            'highContrast' => ($preferenciasBanco->contrast === 'high'),
            'readableFonts' => (bool) $preferenciasBanco->readablefonts,
            'textToSpeech' => (bool) $preferenciasBanco->speech,
            'readingHelper' => (bool) $preferenciasBanco->texthelper,
            'colorblind' => $preferenciasBanco->colorblind,
            'lineSpacing' => self::obter_nivel_espacamento_linha($preferenciasBanco->linespacing)
        ];
    }

    /**
     * Atualiza uma preferência individual convertendo do formato do JavaScript.
     *
     * @param string $preferencia Nome da preferência
     * @param mixed $valor Valor informado
     * @param object $preferenciasBanco Objeto de preferências do banco de dados
     * @return object Preferências atualizadas
     */
    public static function atualizar_preferencia($preferencia, $valor, $preferenciasBanco) {
        if (function_exists('aguia_format_preference_value')) {
            $valor = aguia_format_preference_value($preferencia, $valor);
        }

        if (function_exists('aguia_debug_log')) {
            aguia_debug_log('Atualizando preferência', [
                'preferencia' => $preferencia,
                'valor' => $valor
            ]);
        }

        switch ($preferencia) {
            case 'fontSize':
                $preferenciasBanco->fontsize = (int) $valor;
                break;
            case 'highContrast':
                $preferenciasBanco->contrast = $valor ? 'high' : 'normal';
                break;
            case 'readableFonts':
            case 'fontMode':
                $preferenciasBanco->readablefonts = (int) $valor;
                break;
            case 'lineSpacing':
                $valor = (int) $valor;
                $percentuais = [100, 150, 200, 250];
                $preferenciasBanco->linespacing = $percentuais[$valor] ?? 100;
                break;
            case 'textToSpeech':
                $preferenciasBanco->speech = $valor ? 1 : 0;
                break;
            case 'readingHelper':
                $preferenciasBanco->texthelper = $valor ? 1 : 0;
                break;
            case 'colorblind':
                $valoresPermitidos = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
                $preferenciasBanco->colorblind = in_array($valor, $valoresPermitidos) ? $valor : 'none';
                break;
            default:
                if (function_exists('aguia_debug_log')) {
                    aguia_debug_log('Preferência não mapeada diretamente', [
                        'preferencia' => $preferencia
                    ]);
                }
                break;
        }

        return $preferenciasBanco;
    }

    /**
     * Converte o percentual de espaçamento para o nível correspondente.
     *
     * @param int $percentual Percentual de espaçamento
     * @return int Nível de espaçamento (0-3)
     */
    public static function obter_nivel_espacamento_linha($percentual) {
        if ($percentual >= 250) {
            return 3;
        }
        if ($percentual >= 200) {
            return 2;
        }
        if ($percentual >= 150) {
            return 1;
        }
        return 0;
    }
}