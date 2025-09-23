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
class api {

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
        $record->colorblind = isset($preferences->colorblind) ? $preferences->colorblind : 'none';
        $record->timemodified = time();
        
        // Atualiza ou insere o registro
        if ($existing) {
            $record->id = $existing->id;
            return $DB->update_record('local_aguiaplugin_prefs', $record);
        } else {
            return $DB->insert_record('local_aguiaplugin_prefs', $record) ? true : false;
        }
    }

    /**
     * Converte preferências do formato do banco para o formato do JavaScript
     *
     * @param object $dbPreferences Objeto com as preferências do banco de dados
     * @return array Preferências no formato do JavaScript
     */
    public static function convert_db_to_js($dbPreferences) {
        return [
            'fontSize' => (int)$dbPreferences->fontsize,
            'highContrast' => ($dbPreferences->contrast === 'high'),
            'readableFonts' => (bool)$dbPreferences->readablefonts,
            'textToSpeech' => (bool)$dbPreferences->speech,
            'readingHelper' => (bool)$dbPreferences->texthelper,
            'colorblind' => $dbPreferences->colorblind,
            'lineSpacing' => self::get_line_spacing_level($dbPreferences->linespacing)
        ];
    }

    /**
     * Converte preferências do formato do JavaScript para o formato do banco
     *
     * @param string $preference Nome da preferência
     * @param mixed $value Valor da preferência
     * @param object $dbPreferences Objeto de preferências do banco de dados
     * @return object Objeto atualizado com a preferência
     */
    public static function update_preference($preference, $value, $dbPreferences) {
        // Formata e valida o valor da preferência
        if (function_exists('aguia_format_preference_value')) {
            $value = aguia_format_preference_value($preference, $value);
        }
        
        // Log para debug
        if (function_exists('aguia_debug_log')) {
            aguia_debug_log('Atualizando preferência', ['preference' => $preference, 'value' => $value]);
        }
        
        switch ($preference) {
            case 'fontSize':
                $dbPreferences->fontsize = (int)$value;
                break;
            case 'highContrast':
                $dbPreferences->contrast = $value ? 'high' : 'normal';
                break;
            case 'readableFonts':
            case 'fontMode':
                $dbPreferences->readablefonts = (int)$value;
                break;
            case 'lineSpacing':
                // Converte o nível de espaçamento para percentual
                $value = (int)$value;
                $percentages = [100, 150, 200, 250]; // Corresponde aos níveis 0, 1, 2, 3
                $dbPreferences->linespacing = isset($percentages[$value]) ? $percentages[$value] : 100;
                break;
            case 'textToSpeech':
                $dbPreferences->speech = $value ? 1 : 0;
                break;
            case 'readingHelper':
                $dbPreferences->texthelper = $value ? 1 : 0;
                break;
            case 'colorblind':
                // Assegura que seja um valor permitido
                $allowedValues = ['none', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'];
                $dbPreferences->colorblind = in_array($value, $allowedValues) ? $value : 'none';
                break;
            default:
                // Para preferências não mapeadas diretamente, podemos considerar adicionar uma coluna JSON no futuro
                if (function_exists('aguia_debug_log')) {
                    aguia_debug_log('Preferência não mapeada diretamente', ['preference' => $preference]);
                }
                break;
        }
        return $dbPreferences;
    }

    /**
     * Converte o percentual de espaçamento para o nível correspondente
     * 
     * @param int $percentage Percentual de espaçamento
     * @return int Nível de espaçamento (0-3)
     */
    public static function get_line_spacing_level($percentage) {
        if ($percentage >= 250) return 3;
        if ($percentage >= 200) return 2;
        if ($percentage >= 150) return 1;
        return 0;
    }
}