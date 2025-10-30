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
 * Função externa para salvar preferências de acessibilidade do usuário
 *
 * Implementa o webservice que recebe as preferências e as persiste usando
 * a API de domínio (`ApiPreferencias`). Mantém descrições em inglês nas
 * declarações de parâmetros por compatibilidade com o Moodle externallib.
 *
 * @package    local_aguiaplugin
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

class save_preferences extends external_api {
    /**
     * Parâmetros aceitos pelo webservice (com valores padrão quando aplicável).
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([
            'fontsize' => new external_value(PARAM_INT, 'Font size percentage', VALUE_DEFAULT, 100),
            'contrast' => new external_value(PARAM_ALPHA, 'Contrast type', VALUE_DEFAULT, 'normal'),
            'readablefonts' => new external_value(PARAM_INT, 'Readable fonts flag', VALUE_DEFAULT, 0),
            'linespacing' => new external_value(PARAM_INT, 'Line spacing percentage', VALUE_DEFAULT, 100),
            'speech' => new external_value(PARAM_INT, 'Text-to-speech flag', VALUE_DEFAULT, 0),
            'texthelper' => new external_value(PARAM_INT, 'Reading helper flag', VALUE_DEFAULT, 0),
            'colorblind' => new external_value(PARAM_ALPHA, 'Colorblind mode', VALUE_DEFAULT, 'none')
        ]);
    }

    /**
     * Estrutura de retorno do webservice (status e mensagem).
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'success' => new external_value(PARAM_BOOL, 'Operation status'),
            'message' => new external_value(PARAM_RAW, 'Result message')
        ]);
    }

    /**
     * Executa o salvamento das preferências do usuário.
     * Verifica permissões e invoca a API de domínio para persistência.
     *
     * @return array Resultado com 'success' e 'message'.
     */
    public static function execute($fontsize = 100, $contrast = 'normal', $readablefonts = 0,
                                  $linespacing = 100, $speech = 0, $texthelper = 0, $colorblind = 'none'): array {
        $context = \context_system::instance();
        self::validate_context($context);
        // Capability mínima para editar o próprio perfil/preferências.
        require_capability('moodle/user:editownprofile', $context);

        $preferences = (object) [
            'fontsize' => $fontsize,
            'contrast' => $contrast,
            'readablefonts' => $readablefonts,
            'linespacing' => $linespacing,
            'speech' => $speech,
            'texthelper' => $texthelper,
            'colorblind' => $colorblind,
        ];

        try {
            $ok = \local_aguiaplugin\preferences\ApiPreferencias::salvar_preferencias_usuario($preferences);
            return [
                'success' => (bool)$ok,
                'message' => $ok ? get_string('preferences_saved', 'local_aguiaplugin') : get_string('preferences_error', 'local_aguiaplugin')
            ];
        } catch (\moodle_exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
