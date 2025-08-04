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
 * External API para recuperar preferências
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_aguiaplugin\external;

defined('MOODLE_INTERNAL') || die();

require_once("$CFG->libdir/externallib.php");
require_once("$CFG->dirroot/local/aguiaplugin/classes/preferences_manager.php");

use external_api;
use external_function_parameters;
use external_multiple_structure;
use external_single_structure;
use external_value;
use local_aguiaplugin\preferences_manager;

/**
 * Classe que implementa os serviços web para o plugin de acessibilidade
 */
class get_preferences extends external_api {

    /**
     * Parâmetros de entrada para obter preferências
     * @return external_function_parameters
     */
    public static function execute_parameters() {
        return new external_function_parameters([]);
    }

    /**
     * Estrutura de retorno da API
     * @return external_single_structure
     */
    public static function execute_returns() {
        return new external_single_structure([
            'fontsize' => new external_value(PARAM_INT, 'Tamanho da fonte em percentual'),
            'contrast' => new external_value(PARAM_ALPHA, 'Tipo de contraste'),
            'readablefonts' => new external_value(PARAM_INT, 'Fontes mais legíveis'),
            'linespacing' => new external_value(PARAM_INT, 'Espaçamento entre linhas'),
            'speech' => new external_value(PARAM_INT, 'Leitura de texto ativada'),
            'texthelper' => new external_value(PARAM_INT, 'Auxiliar de leitura')
        ]);
    }

    /**
     * Recupera as preferências do usuário
     * @return array Preferências do usuário
     */
    public static function execute() {
        global $USER;

        // Validação de contexto e permissão
        $context = \context_system::instance();
        self::validate_context($context);
        
        // Recupera as preferências
        $preferences = preferences_manager::get_user_preferences();
        
        // Retorna apenas os dados necessários
        return [
            'fontsize' => (int)$preferences->fontsize,
            'contrast' => $preferences->contrast,
            'readablefonts' => (int)$preferences->readablefonts,
            'linespacing' => (int)$preferences->linespacing,
            'speech' => (int)$preferences->speech,
            'texthelper' => (int)$preferences->texthelper
        ];
    }
}
