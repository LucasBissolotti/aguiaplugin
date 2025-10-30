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
 * Função externa para obter preferências de acessibilidade do usuário
 *
 * Implementa as especificações do external_api do Moodle para disponibilizar
 * as preferências do usuário via webservice/WS. As chaves retornadas seguem o
 * formato legado esperado pelo frontend para compatibilidade.
 *
 * @package    local_aguiaplugin
 * @copyright  2025
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_aguiaplugin\external;

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->libdir.'/externallib.php');

use external_api;
use external_function_parameters;
use external_single_structure;
use external_value;

class get_preferences extends external_api {
    /**
     * Parâmetros do webservice: nenhum parâmetro é necessário para esta chamada.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([]);
    }

    /**
     * Estrutura retornada pelo webservice (array associativo de preferências).
     * As descrições são em inglês por compatibilidade com a API do Moodle.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'fontsize' => new external_value(PARAM_INT, 'Font size percentage'),
            'contrast' => new external_value(PARAM_ALPHA, 'Contrast type'),
            'readablefonts' => new external_value(PARAM_INT, 'Readable fonts flag'),
            'linespacing' => new external_value(PARAM_INT, 'Line spacing percentage'),
            'speech' => new external_value(PARAM_INT, 'Text-to-speech flag'),
            'texthelper' => new external_value(PARAM_INT, 'Reading helper flag'),
            'colorblind' => new external_value(PARAM_ALPHA, 'Colorblind mode')
        ]);
    }

    /**
     * Executa a chamada e retorna as preferências do usuário atual.
     * Utiliza a API de domínio `ApiPreferencias` para obter os dados.
     *
     * @return array Dados no formato esperado pelo frontend.
     */
    public static function execute(): array {
        \core_external\external_api::validate_context(\context_system::instance());

        // Reaproveita a API de domínio para obter valores (DB ou defaults).
        $preferences = \local_aguiaplugin\preferences\ApiPreferencias::buscar_preferencias_usuario();

        return [
            'fontsize' => (int)($preferences->fontsize ?? ($preferences->tamanho_fonte ?? 100)),
            'contrast' => (string)($preferences->contrast ?? ($preferences->contraste ?? 'normal')),
            'readablefonts' => (int)($preferences->readablefonts ?? ($preferences->fontes_legiveis ?? 0)),
            'linespacing' => (int)($preferences->linespacing ?? ($preferences->espaco_linhas ?? 100)),
            'speech' => (int)($preferences->speech ?? ($preferences->texto_para_fala ?? 0)),
            'texthelper' => (int)($preferences->texthelper ?? ($preferences->auxiliar_leitura ?? 0)),
            'colorblind' => (string)($preferences->colorblind ?? ($preferences->daltonismo ?? 'none'))
        ];
    }
}
