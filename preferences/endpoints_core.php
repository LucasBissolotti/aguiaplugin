<?php
/**
 * Núcleo dos endpoints AJAX do plugin AGUIA
 *
 * Aqui ficam helpers que inicializam o ambiente (tenta detectar Moodle),
 * logging condicional, e funções que montam os resultados de GET/POST para as
 * preferências, com fallback para armazenamento em arquivo.
 *
 * Comentários padronizados em pt-BR; preserva a lógica existente.
 */

defined('MOODLE_INTERNAL') || define('MOODLE_INTERNAL', false);

if (!function_exists('aguia_log_error')) {
    function aguia_log_error($message, $exception = null) {
        // Respeita configuração de debug do plugin quando disponível.
        $enabled = false;
        if (function_exists('get_config')) {
            $val = get_config('local_aguiaplugin', 'debuglog');
            $enabled = ($val === '1' || $val === 1 || $val === true);
        }
        if (!$enabled) {
            return;
        }
        $logfile = dirname(__FILE__) . '/../../aguia_error.log';
        $timestamp = date('Y-m-d H:i:s');
        $log = "[$timestamp] $message";
        if ($exception) {
            $log .= "\nException: " . $exception->getMessage();
            $log .= "\nTrace: " . $exception->getTraceAsString();
        }
        $log .= "\n--------------------------------------------------\n";
        @file_put_contents($logfile, $log, FILE_APPEND);
    }
}

if (!function_exists('aguia_find_moodle_config')) {
    function aguia_find_moodle_config() {
        $possible_paths = [
            '../../config.php',
            '../../../config.php',
            '../../../../config.php',
            (isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : '') . '/config.php',
            (isset($_SERVER['DOCUMENT_ROOT']) ? $_SERVER['DOCUMENT_ROOT'] : '') . '/moodle/config.php',
            dirname(dirname(dirname(__FILE__))) . '/config.php',
            dirname(dirname(dirname(dirname(__FILE__)))) . '/config.php',
        ];
        foreach ($possible_paths as $path) {
            if ($path && file_exists($path)) {
                return $path;
            }
        }
        return null;
    }
}

/**
 * Inicializa o ambiente do endpoint: detecta se existe um Moodle no caminho
 * esperado, carrega config.php quando possível e retorna informações úteis
 * (se está rodando dentro do Moodle, id do usuário e se está autenticado).
 *
 * @return array{moodle:bool, userid:int, authenticated:bool}
 */
function aguia_boot_environment() {
    $moodleConfigPath = aguia_find_moodle_config();
    $moodle = ($moodleConfigPath !== null);
    $userid = 0;
    $authenticated = false;

    if ($moodle) {
        try {
            require_once($moodleConfigPath);
            aguia_log_error("Moodle config carregado: $moodleConfigPath");
            if (isset($GLOBALS['CFG']) && isset($GLOBALS['CFG']->dirroot)) {
                $CFG = $GLOBALS['CFG'];
                $apipath = $CFG->dirroot . '/local/aguiaplugin/classes/preferences/api_preferencias.php';
                $auxpath = $CFG->dirroot . '/local/aguiaplugin/preferences/auxiliares.php';
                $filepath = $CFG->dirroot . '/local/aguiaplugin/preferences/armazenamento_arquivos.php';
                $chkpath = $CFG->dirroot . '/local/aguiaplugin/preferences/check_tables.php';

                foreach ([$apipath, $auxpath, $filepath] as $p) {
                    if (!file_exists($p)) {
                        aguia_log_error("Arquivo ausente: $p");
                        $moodle = false;
                        break;
                    }
                }
                if ($moodle) {
                    require_once($apipath);
                    require_once($auxpath);
                    require_once($filepath);
                    if (file_exists($chkpath)) {
                        require_once($chkpath);
                    }
                }
            } else {
                aguia_log_error('CFG indisponível após config.php');
                $moodle = false;
            }
        } catch (Exception $e) {
            aguia_log_error('Falha ao carregar Moodle/config', $e);
            $moodle = false;
        }
    }

    if ($moodle) {
        try {
            require_login();
            global $USER;
            $userid = $USER->id;
            $authenticated = true;
        } catch (Exception $e) {
            aguia_log_error('Usuário não autenticado: ' . $e->getMessage());
            $authenticated = false;
        }
    } else {
        require_once(dirname(__FILE__) . '/armazenamento_arquivos.php');
    }

    return ['moodle' => $moodle, 'userid' => $userid, 'authenticated' => $authenticated];
}

/**
 * Monta o resultado de GET de preferências (ordem de prioridade: DB -> arquivo -> defaults).
 *
 * @param array $env Resultado de `aguia_boot_environment()`.
 * @return array Resultado com sucesso, preferências e origem.
 */
function aguia_get_preferences_result(array $env) {
    $default = [
        'fontSize' => 100,
        'highContrast' => false,
        'readableFonts' => false,
        'textToSpeech' => false,
        'readingHelper' => false,
        'colorblind' => 'none',
        'lineSpacing' => 0,
        'colorIntensityMode' => 0,
        'fontMode' => 0,
        'letterSpacing' => 0,
        'emphasizeLinks' => false,
        'headerHighlight' => false,
        'readingMaskMode' => 0,
        'horizontalMaskLevel' => 0,
        'verticalMaskLevel' => 0,
        'customCursor' => false,
    'reduceAnimations' => false,
    'highlightedLetters' => 0,
    ];
    $preferences = $default;
    $source = 'default';
    $dbSuccess = false;
    $fileSuccess = false;
    $userid = (int)$env['userid'];

    if (!empty($env['moodle'])) {
        try {
            $tablesExist = function_exists('local_aguiaplugin_check_tables') ? local_aguiaplugin_check_tables() : true;
            if ($tablesExist) {
                $dbPreferences = \local_aguiaplugin\preferences\ApiPreferencias::buscar_preferencias_usuario($userid);
                if ($dbPreferences) {
                    $preferences = \local_aguiaplugin\preferences\ApiPreferencias::converter_banco_para_js($dbPreferences);
                    $dbSuccess = true;
                    $source = 'database';
                }
            }
        } catch (Exception $e) {
            aguia_log_error('Erro ao obter preferências do banco', $e);
        }
    }

    if (!$dbSuccess) {
        try {
            $filePreferences = function_exists('aguia_obter_preferencias_arquivo') ? aguia_obter_preferencias_arquivo($userid) : null;
            if ($filePreferences && is_array($filePreferences)) {
                $preferences = array_merge($default, $filePreferences);
                $fileSuccess = true;
                $source = 'file';
            }
        } catch (Exception $e) {
            aguia_log_error('Erro ao obter preferências do arquivo', $e);
        }
    }

    return [
        'success' => ($dbSuccess || $fileSuccess),
        'preferences' => $preferences,
        'source' => $source,
        'userid' => $userid
    ];
}

/**
 * Processa salvamento de uma preferência específica com fallback para arquivo.
 *
 * @param array $env Ambiente retornado por `aguia_boot_environment()`
 * @param string $preference Nome da preferência
 * @param mixed $value Valor a ser salvo
 * @return array Resultado padronizado com status e mensagem
 */
function aguia_save_preference_result(array $env, $preference, $value) {
    $userid = (int)$env['userid'];
    $dbSuccess = false;
    $fileSuccess = false;

    if (!empty($env['moodle']) && !empty($env['authenticated'])) {
        try {
            $tablesExist = function_exists('local_aguiaplugin_check_tables') ? local_aguiaplugin_check_tables() : true;
            if ($tablesExist) {
                $preferences = \local_aguiaplugin\preferences\ApiPreferencias::buscar_preferencias_usuario($userid);
                $preferences = \local_aguiaplugin\preferences\ApiPreferencias::atualizar_preferencia($preference, $value, $preferences);
                $dbSuccess = \local_aguiaplugin\preferences\ApiPreferencias::salvar_preferencias_usuario($preferences, $userid);
            }
        } catch (Exception $e) {
            aguia_log_error('Erro ao salvar no banco', $e);
        }
    }

    if (!$dbSuccess) {
        try {
            $fileSuccess = function_exists('aguia_atualizar_preferencia_arquivo') ? aguia_atualizar_preferencia_arquivo($userid, $preference, $value) : false;
        } catch (Exception $e) {
            aguia_log_error('Erro ao salvar em arquivo', $e);
        }
    }

    if ($dbSuccess) {
        return [
            'success' => true,
            'message' => 'Preferência salva com sucesso no banco de dados',
            'preference' => $preference,
            'value' => $value,
            'storage' => 'database'
        ];
    } elseif ($fileSuccess) {
        return [
            'success' => true,
            'message' => 'Preferência salva com sucesso em arquivo local',
            'preference' => $preference,
            'value' => $value,
            'storage' => 'file',
            'fallback' => true
        ];
    }

    return [
        'success' => false,
        'message' => 'Não foi possível salvar a preferência. Use o armazenamento do navegador.',
        'preference' => $preference,
        'fallback' => true
    ];
}
