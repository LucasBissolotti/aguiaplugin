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
 * Classe para gerenciar preferências de acessibilidade de usuários
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_aguiaplugin;

defined('MOODLE_INTERNAL') || die();

/**
 * Class preferences_manager
 * 
 * Gerencia as preferências de acessibilidade dos usuários
 */
class preferences_manager {

    /**
     * Obtém as preferências do usuário atual
     *
     * @param int $userid ID do usuário ou null para usar o usuário atual
     * @return \stdClass Objeto com as preferências do usuário
     */
    public static function get_user_preferences($userid = null) {
        global $USER, $DB;
        
        if ($userid === null) {
            $userid = $USER->id;
        }
        
        // Valores padrão
        $defaults = [
            'fontsize' => 100,
            'contrast' => 'normal',
            'readablefonts' => 0,
            'linespacing' => 100,
            'speech' => 0,
            'texthelper' => 0,
            'colorblind' => 'none' // Modo de daltonismo: none, protanopia, deuteranopia, tritanopia, achromatopsia
        ];
        
        // Tenta obter os dados do usuário do banco
        $record = $DB->get_record('local_aguiaplugin_prefs', ['userid' => $userid]);
        
        if ($record) {
            // Retorna os dados existentes
            return $record;
        } else {
            // Retorna valores padrão
            $defaults = (object)$defaults;
            $defaults->userid = $userid;
            return $defaults;
        }
    }
    
    /**
     * Salva as preferências do usuário
     *
     * @param \stdClass $preferences Objeto com as preferências do usuário
     * @param int $userid ID do usuário ou null para usar o usuário atual
     * @return bool True se salvou com sucesso
     */
    public static function save_user_preferences($preferences, $userid = null) {
        global $USER, $DB;
        
        if ($userid === null) {
            $userid = $USER->id;
        }
        
        // Verifica se o usuário já tem preferências salvas
        $existing = $DB->get_record('local_aguiaplugin_prefs', ['userid' => $userid]);
        
        // Prepara o objeto para inserção/atualização
        $record = new \stdClass();
        $record->userid = $userid;
        $record->fontsize = isset($preferences->fontsize) ? (int)$preferences->fontsize : 100;
        $record->contrast = isset($preferences->contrast) ? $preferences->contrast : 'normal';
        $record->readablefonts = isset($preferences->readablefonts) ? (int)$preferences->readablefonts : 0;
        $record->linespacing = isset($preferences->linespacing) ? (int)$preferences->linespacing : 100;
        $record->speech = isset($preferences->speech) ? (int)$preferences->speech : 0;
        $record->texthelper = isset($preferences->texthelper) ? (int)$preferences->texthelper : 0;
        $record->timemodified = time();
        
        // Atualiza ou insere o registro
        if ($existing) {
            $record->id = $existing->id;
            return $DB->update_record('local_aguiaplugin_prefs', $record);
        } else {
            return $DB->insert_record('local_aguiaplugin_prefs', $record) ? true : false;
        }
    }
}
