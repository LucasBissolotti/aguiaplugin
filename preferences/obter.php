<?php
// Endpoint para obter preferências – versão unificada (pt-BR)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/../../aguia_error.log');
define('AJAX_SCRIPT', true);

header('Content-Type: application/json');

require_once(__DIR__ . '/endpoints_core.php');
$env = aguia_boot_environment();
$result = aguia_get_preferences_result($env);
echo json_encode($result);
exit;
