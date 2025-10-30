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
 * Funções auxiliares do plugin AGUIA
 *
 * Contém helpers para logging, formatação de preferências e verificações
 * de configuração. Comentários padronizados em pt-BR.
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Verifica se o log de depuração do plugin está habilitado nas configurações.
 * @return bool
 */
function aguia_is_debug_enabled(): bool {
    if (function_exists('get_config')) {
        $val = get_config('local_aguiaplugin', 'debuglog');
        return ($val === '1' || $val === 1 || $val === true);
    }
    return false;
}

/**
 * Registra mensagens de depuração quando explicitamente habilitado.
 *
 * @param string $message Mensagem descritiva
 * @param mixed $data Dados adicionais (string/array/object)
 */
function aguia_debug_log($message, $data = null) {
    // Só registra quando a configuração do plugin estiver explicitamente habilitada.
    if (!aguia_is_debug_enabled()) {
        return;
    }
    $suffix = '';
    if ($data !== null) {
        $suffix = ' - ' . (is_array($data) || is_object($data) ? json_encode($data) : $data);
    }
    error_log('AGUIA Debug: ' . $message . $suffix);
}

/**
 * Formata o valor de uma preferência para o formato correto do banco de dados.
 *
 * Converte tipos conhecidos (inteiro, booleano) e validador para o caso de
 * preferências específicas (ex.: daltonismo).
 *
 * @param string $preference Nome da preferência
 * @param mixed $value Valor da preferência
 * @return mixed Valor formatado para o banco de dados
 */
function aguia_format_preference_value($preference, $value) {
    $integerPreferences = ['fontSize', 'fontMode', 'lineSpacing', 'letterSpacing', 'highlightedLetters', 
                           'colorIntensityMode', 'horizontalMaskLevel', 'verticalMaskLevel'];
                           
    $booleanPreferences = ['highContrast', 'readableFonts', 'textToSpeech', 'readingHelper', 
                           'emphasizeLinks', 'headerHighlight', 'hideImages', 'customCursor'];
    
    // Formata o valor baseado no tipo da preferência
    if (in_array($preference, $integerPreferences)) {
        return (int)$value;
    } else if (in_array($preference, $booleanPreferences)) {
        return $value ? 1 : 0;
    } else if ($preference === 'colorblind') {
        // Verifica se é um dos valores permitidos
        $allowedValues = ['none', 'protanopia', 'deuteranopia', 'tritanopia'];
        return in_array($value, $allowedValues) ? $value : 'none';
    }
    
    // Se não for um tipo conhecido, retorna o valor como está
    return $value;
}