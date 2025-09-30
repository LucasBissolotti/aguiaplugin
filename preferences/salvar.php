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
 * Endpoint para salvar preferências de acessibilidade
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/../../aguia_error.log');

define('AJAX_SCRIPT', true);

function aguia_log_error($message, $exception = null) {
    $logfile = dirname(__FILE__) . '/../../aguia_error.log';
    $timestamp = date('Y-m-d H:i:s');
    $log = "[$timestamp] $message";

    if ($exception) {
        $log .= "\nException: " . $exception->getMessage();
        $log .= "\nTrace: " . $exception->getTraceAsString();
    }

    $log .= "\n--------------------------------------------------\n";
    file_put_contents($logfile, $log, FILE_APPEND);
}

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

$moodleConfigPath = find_moodle_config();
$moodleConfigExists = ($moodleConfigPath !== null);

if ($moodleConfigExists) {
    try {
        require_once($moodleConfigPath);
        aguia_log_error("Moodle config carregado com sucesso de: $moodleConfigPath");

        if (isset($CFG) && isset($CFG->dirroot)) {
            $api_path = $CFG->dirroot . '/local/aguiaplugin/preferences/api_preferencias.php';
            $helpers_path = $CFG->dirroot . '/local/aguiaplugin/preferences/auxiliares.php';
            $check_tables_path = $CFG->dirroot . '/local/aguiaplugin/preferences/check_tables.php';
            $file_storage_path = $CFG->dirroot . '/local/aguiaplugin/preferences/armazenamento_arquivos.php';

            if (file_exists($api_path) && file_exists($helpers_path) && file_exists($check_tables_path) && file_exists($file_storage_path)) {
                require_once($api_path);
                require_once($helpers_path);
                require_once($check_tables_path);
                require_once($file_storage_path);
            } else {
                aguia_log_error('Arquivos necessários do plugin não encontrados');
                $moodleConfigExists = false;
            }
        } else {
            aguia_log_error('CFG não disponível após carregar config.php');
            $moodleConfigExists = false;
        }
    } catch (Exception $e) {
        aguia_log_error('Erro ao carregar arquivos do Moodle: ' . $e->getMessage(), $e);
        $moodleConfigExists = false;
    }
} else {
    aguia_log_error('Config.php do Moodle não encontrado');
}

require_once(dirname(__FILE__) . '/armazenamento_arquivos.php');

header('Content-Type: application/json');

$requestBody = file_get_contents('php://input');
$data = json_decode($requestBody);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'success' => false,
        'message' => 'Dados inválidos'
    ]);
    exit;
}

$userid = 0;
$authenticated = false;

if ($moodleConfigExists) {
    try {
        require_login();
        require_sesskey();
        global $USER;
        $userid = $USER->id;
        $authenticated = true;
        aguia_log_error("Usuário autenticado: $userid");
    } catch (Exception $e) {
        aguia_log_error('Usuário não autenticado: ' . $e->getMessage());
        $authenticated = false;
    }
}

$preference = isset($data->preference) ? $data->preference : null;
$value = isset($data->value) ? $data->value : null;

if ($preference === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Preferência não informada'
    ]);
    exit;
}

$preferences = new \stdClass();
$dbSuccess = false;
$fileSuccess = false;

if ($authenticated) {
    try {
        $preferences = \local_aguiaplugin\preferences\ApiPreferencias::buscar_preferencias_usuario($userid);
        $preferences = \local_aguiaplugin\preferences\ApiPreferencias::atualizar_preferencia($preference, $value, $preferences);
        $dbSuccess = \local_aguiaplugin\preferences\ApiPreferencias::salvar_preferencias_usuario($preferences, $userid);
    } catch (Exception $e) {
        aguia_log_error('Erro ao salvar preferências no banco: ' . $e->getMessage(), $e);
        $dbSuccess = false;
    }
}

try {
    $fileSuccess = aguia_atualizar_preferencia_arquivo($userid, $preference, $value);
} catch (Exception $e) {
    aguia_log_error('Erro ao salvar preferências em arquivo: ' . $e->getMessage(), $e);
    $fileSuccess = false;
}

echo json_encode([
    'success' => ($dbSuccess || $fileSuccess),
    'message' => 'Preferência processada',
    'database' => $dbSuccess,
    'file' => $fileSuccess
]);
