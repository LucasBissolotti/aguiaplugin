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
 * API helpers para o AGUIA plugin
 * 
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Adiciona logs de debug para diagnóstico do plugin AGUIA
 *
 * @param string $message Mensagem para registrar
 * @param string|array $data Dados opcionais para registrar
 */
function aguia_debug_log($message, $data = null) {
    error_log('AGUIA Debug: ' . $message . ($data !== null ? ' - ' . (is_array($data) || is_object($data) ? json_encode($data) : $data) : ''));
}

/**
 * Formata o valor de uma preferência para o formato correto do banco de dados
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