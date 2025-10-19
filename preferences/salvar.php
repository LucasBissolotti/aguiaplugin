<?php
// Endpoint para salvar preferência – versão unificada (pt-BR)
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/../../aguia_error.log');
define('AJAX_SCRIPT', true);

header('Content-Type: application/json');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data || empty($data['preference']) || !array_key_exists('value', $data)) {
    echo json_encode(['success' => false, 'message' => 'Parâmetros inválidos']);
    exit;
}

require_once(__DIR__ . '/endpoints_core.php');
$env = aguia_boot_environment();

// Validar sesskey se fornecida e Moodle disponível (mantém fallback em arquivo se falhar)
if (!empty($env['moodle'])) {
    $sesskey = isset($_GET['sesskey']) ? $_GET['sesskey'] : (isset($data['sesskey']) ? $data['sesskey'] : null);
    if ($sesskey && empty($_REQUEST['sesskey'])) {
        $_REQUEST['sesskey'] = $sesskey;
        $_GET['sesskey'] = $sesskey;
    }
    try { require_sesskey(); } catch (Exception $e) { /* continua com fallback */ }
}

$result = aguia_save_preference_result($env, $data['preference'], $data['value']);
echo json_encode($result);
exit;
