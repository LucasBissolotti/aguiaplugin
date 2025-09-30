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
 * Endpoint para obter preferências de acessibilidade
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Suppress PHP errors/warnings from being output
ini_set('display_errors', 0);

// Habilita o log de erros para debug
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/../../aguia_error.log');

define('AJAX_SCRIPT', true);

// Função para registrar erros em um arquivo de log
function aguia_log_error($message, $exception = null) {
    $logfile = dirname(__FILE__) . '/../../aguia_error.log';
    $timestamp = date('Y-m-d H:i:s');
    $log = "[$timestamp] $message";
    
    if ($exception) {
        $log .= "\nException: " . $exception->getMessage();
        $log .= "\nTrace: " . $exception->getTraceAsString();
    }
    
    $log .= "\n--------------------------------------------------\n";
    
    // Escreve no arquivo de log
    file_put_contents($logfile, $log, FILE_APPEND);
}

// Função para buscar o config.php do Moodle
function find_moodle_config() {
    $possible_paths = [
        '../../config.php',
        '../../../config.php',
        '../../../../config.php',
        $_SERVER['DOCUMENT_ROOT'] . '/config.php',
        $_SERVER['DOCUMENT_ROOT'] . '/moodle/config.php',
        dirname(dirname(dirname(__FILE__))) . '/config.php',
        dirname(dirname(dirname(dirname(__FILE__)))) . '/config.php',
    ];
    
    foreach ($possible_paths as $path) {
        if (file_exists($path)) {
            return $path;
        }
    }
    
    return null;
}

// Tenta carregar o arquivo de configuração do Moodle
$moodleConfigPath = find_moodle_config();
$moodleConfigExists = ($moodleConfigPath !== null);

if ($moodleConfigExists) {
    try {
        require_once($moodleConfigPath);
        aguia_log_error("Moodle config carregado com sucesso de: $moodleConfigPath");
        
        if (isset($CFG) && isset($CFG->dirroot)) {
            $api_path = $CFG->dirroot . '/local/aguiaplugin/preferences/api_preferencias.php';
            $check_tables_path = $CFG->dirroot . '/local/aguiaplugin/preferences/check_tables.php';
            $helpers_path = $CFG->dirroot . '/local/aguiaplugin/preferences/auxiliares.php';
            
            if (file_exists($api_path) && file_exists($check_tables_path) && file_exists($helpers_path)) {
                require_once($api_path);
                require_once($check_tables_path);
                require_once($helpers_path);
            } else {
                aguia_log_error("Arquivos do plugin não encontrados em: $CFG->dirroot/local/aguiaplugin/");
                $moodleConfigExists = false;
            }
        } else {
            aguia_log_error("CFG não disponível após carregar config.php");
            $moodleConfigExists = false;
        }
    } catch (Exception $e) {
        aguia_log_error("Erro ao carregar arquivos do Moodle: " . $e->getMessage(), $e);
        $moodleConfigExists = false;
    }
} else {
    aguia_log_error("Config.php do Moodle não encontrado em nenhum caminho verificado");
}

// Sempre carregamos o armazenamento baseado em arquivo como fallback
require_once(dirname(__FILE__) . '/armazenamento_arquivos.php');

// Configurar resposta como JSON antes de qualquer operação
header('Content-Type: application/json');

// Inicializa variáveis
$userid = 0;
$dbSuccess = false;
$fileSuccess = false;

// Tenta autenticar com o Moodle se disponível
if ($moodleConfigExists) {
    try {
        require_login();
        require_sesskey();
        global $USER;
        $userid = $USER->id;
        aguia_log_error("Usuário autenticado: $userid");
    } catch (Exception $e) {
        aguia_log_error("Usuário não autenticado: " . $e->getMessage());
    }
}

$defaultPreferences = [
    'fontSize' => 100,
    'highContrast' => false,
    'readableFonts' => false,
    'textToSpeech' => false,
    'readingHelper' => false,
    'colorblind' => 'none',
    'lineSpacing' => 0
];

$preferences = $defaultPreferences;
$source = 'default';

if ($moodleConfigExists) {
    try {
        $tablesExist = local_aguiaplugin_check_tables();
        aguia_log_error('Verificação de tabelas: ' . ($tablesExist ? 'OK' : 'Falha'));
        
        if ($tablesExist) {
            $dbPreferences = \local_aguiaplugin\preferences\ApiPreferencias::buscar_preferencias_usuario($userid);
            
            if ($dbPreferences) {
                $preferences = \local_aguiaplugin\preferences\ApiPreferencias::converter_banco_para_js($dbPreferences);
                $dbSuccess = true;
                $source = 'database';
                aguia_log_error('Preferências obtidas do banco com sucesso');
            }
        }
    } catch (Exception $e) {
        aguia_log_error('Erro ao obter preferências do banco', $e);
        $dbSuccess = false;
    }
}

if (!$dbSuccess) {
    try {
    $filePreferences = aguia_obter_preferencias_arquivo($userid);
        
        if ($filePreferences && is_array($filePreferences)) {
            $preferences = array_merge($defaultPreferences, $filePreferences);
            $fileSuccess = true;
            $source = 'file';
            aguia_log_error('Preferências obtidas do arquivo com sucesso');
        }
    } catch (Exception $e) {
        aguia_log_error('Erro ao obter preferências do arquivo', $e);
        $fileSuccess = false;
    }
}

echo json_encode([
    'success' => ($dbSuccess || $fileSuccess),
    'preferences' => $preferences,
    'source' => $source,
    'userid' => $userid
]);
