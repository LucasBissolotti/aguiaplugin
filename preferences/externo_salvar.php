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
 * Serviço externo para salvar preferências
 *
 * @package    local_aguiaplugin
 */

namespace local_aguiaplugin\preferences;

defined('MOODLE_INTERNAL') || die();

require_once("$CFG->libdir/externallib.php");
require_once("$CFG->dirroot/local/aguiaplugin/preferences/api_preferencias.php");

use external_api;
use external_function_parameters;
use external_single_structure;
use external_value;
use moodle_exception;

/**
 * Classe que implementa os serviços web para salvar preferências
 */
class ExternoSalvar extends external_api {

    /**
     * Parâmetros de entrada para salvar preferências
     * @return external_function_parameters
     */
    public static function execute_parameters() {
        return new external_function_parameters([
            'fontsize' => new external_value(PARAM_INT, 'Tamanho da fonte em percentual', VALUE_DEFAULT, 100),
            'contrast' => new external_value(PARAM_ALPHA, 'Tipo de contraste', VALUE_DEFAULT, 'normal'),
            'readablefonts' => new external_value(PARAM_INT, 'Fontes mais legíveis', VALUE_DEFAULT, 0),
            'linespacing' => new external_value(PARAM_INT, 'Espaçamento entre linhas', VALUE_DEFAULT, 100),
            'speech' => new external_value(PARAM_INT, 'Leitura de texto ativada', VALUE_DEFAULT, 0),
            'texthelper' => new external_value(PARAM_INT, 'Auxiliar de leitura', VALUE_DEFAULT, 0),
            'colorblind' => new external_value(PARAM_ALPHA, 'Modo de daltonismo', VALUE_DEFAULT, 'none')
        ]);
    }

    /**
     * Estrutura de retorno da API
     * @return external_single_structure
     */
    public static function execute_returns() {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Status da operação'),
            'message' => new external_value(PARAM_RAW, 'Mensagem de retorno')
        ]);
    }

    /**
     * Salva as preferências do usuário
     */
    public static function execute($fontsize = 100, $contrast = 'normal', $readablefonts = 0,
                                  $linespacing = 100, $speech = 0, $texthelper = 0, $colorblind = 'none') {
        $context = \context_system::instance();
        self::validate_context($context);
        require_capability('moodle/user:editownprofile', $context);

        $preferences = new \stdClass();
        $preferences->fontsize = $fontsize;
        $preferences->contrast = $contrast;
        $preferences->readablefonts = $readablefonts;
        $preferences->linespacing = $linespacing;
        $preferences->speech = $speech;
        $preferences->texthelper = $texthelper;
        $preferences->colorblind = $colorblind;

        try {
            $resultado = ApiPreferencias::salvar_preferencias_usuario($preferences);

            if ($resultado) {
                return [
                    'success' => true,
                    'message' => 'Preferências salvas com sucesso'
                ];
            }

            return [
                'success' => false,
                'message' => 'Erro ao salvar preferências'
            ];
        } catch (moodle_exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
