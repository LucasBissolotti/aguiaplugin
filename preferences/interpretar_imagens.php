<?php
/**
 * Endpoint para interpretar imagens usando Gemini (Google Generative Language API)
 *
 * Aceita upload via multipart/form-data (campo 'image') ou POST com 'imageUrl'.
 * Retorna JSON contendo 'success', 'description' (texto gerado) e 'api_response'
 * com o conteúdo bruto retornado pela API externa.
 */

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/../../aguia_error.log');
define('AJAX_SCRIPT', true);

header('Content-Type: application/json');

require_once(__DIR__ . '/endpoints_core.php');
$env = aguia_boot_environment();

try {
    $imageData = null;
    // Primeiro tenta receber arquivo enviado via multipart/form-data.
    if (!empty($_FILES['image']) && isset($_FILES['image']['tmp_name']) && is_uploaded_file($_FILES['image']['tmp_name'])) {
        $imageData = @file_get_contents($_FILES['image']['tmp_name']);
    }

    // Se não houver arquivo, tenta buscar via URL informada no campo 'imageUrl'.
    if (empty($imageData) && !empty($_POST['imageUrl'])) {
        $imageUrl = trim($_POST['imageUrl']);
        if (!empty($imageUrl)) {
            $ch = curl_init($imageUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            $fdata = curl_exec($ch);
            $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $err = curl_error($ch);
            curl_close($ch);
            if ($fdata && $status >= 200 && $status < 300) {
                $imageData = $fdata;
            } else {
                // Fallback para file_get_contents quando curl falhar.
                try {
                    $f2 = @file_get_contents($imageUrl);
                    if ($f2) $imageData = $f2;
                } catch (Exception $e) {}
            }
        }
    }

    if (empty($imageData)) {
        echo json_encode(['success' => false, 'error' => 'Nenhuma imagem recebida ou não foi possível buscá-la.']);
        exit;
    }

    // Obtém a chave/config do Gemini (prioriza variável de ambiente).
    $apiKey = getenv('GEMINI_API_KEY');
    if (!$apiKey && function_exists('get_config')) {
        $apiKey = get_config('local_aguiaplugin', 'gemini_api_key');
    }
    $model = 'gemini-image-1';
    if (function_exists('get_config')) {
        $cfgmodel = get_config('local_aguiaplugin', 'gemini_model');
        if (!empty($cfgmodel)) $model = $cfgmodel;
        $cfgcustom = get_config('local_aguiaplugin', 'gemini_model_custom');
        if (!empty($model) && $model === 'custom' && !empty($cfgcustom)) {
            $model = $cfgcustom;
        }
    }

    $defaultMaxOutput = 2048;
    $defaultRerunMaxOutput = 8192; 
    $maxOutputTokens = $defaultMaxOutput;
    $rerunMaxOutputTokens = $defaultRerunMaxOutput;
    if (function_exists('get_config')) {
        $cfgMax = (int)get_config('local_aguiaplugin', 'gemini_max_output_tokens');
        $cfgRerun = (int)get_config('local_aguiaplugin', 'gemini_rerun_max_output_tokens');
        if ($cfgMax > 0) $maxOutputTokens = $cfgMax;
        if ($cfgRerun > 0) $rerunMaxOutputTokens = $cfgRerun;
    }

    $model = preg_replace('#^models/#i', '', trim($model));

    if (empty($apiKey)) {
        echo json_encode(['success' => false, 'error' => 'Gemini API key não configurada. Defina a variável de ambiente GEMINI_API_KEY ou a configuração do plugin (gemini_api_key).']);
        exit;
    }

    $b64 = base64_encode($imageData);
    $mime = null;
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo) {
            $m = finfo_buffer($finfo, $imageData);
            if ($m) $mime = $m;
            finfo_close($finfo);
        }
    }
    if (empty($mime)) {
        $info = @getimagesizefromstring($imageData);
        if (!empty($info['mime'])) $mime = $info['mime'];
    }
    if (empty($mime)) $mime = 'image/jpeg';

    $prompt = "Em português (pt-BR). Forneça uma descrição objetiva e concisa (30-60 palavras) do que a imagem representa. Use até 5 itens em tópicos curtos, sem explicações longas.";
    $payload = [
        'contents' => [
            [
                'role' => 'user',
                'parts' => [
                    [ 'inline_data' => [ 'mime_type' => $mime, 'data' => $b64 ] ],
                    [ 'text' => $prompt ]
                ]
            ]
        ],
        'generationConfig' => [ 'temperature' => 0.2, 'maxOutputTokens' => $maxOutputTokens, 'responseMimeType' => 'text/plain' ]
    ];

    // Detecta tipo de autenticação: OAuth token ou API key simples.
    $is_oauth_token = preg_match('/^ya29\./', $apiKey) || preg_match('/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/', $apiKey);

    // Monta endpoint e cabeçalhos, escapando o nome do modelo quando necessário.
    $modelEscaped = implode('/', array_map('rawurlencode', explode('/', $model)));
    // Alguns modelos 2.x usam a versão v1beta da API.
    $apiver = (preg_match('/^gemini-2(\.|-)/i', $model) || stripos($model, '2.5') !== false || stripos($model, '2.0') !== false)
        ? 'v1beta'
        : 'v1';
    $base = 'https://generativelanguage.googleapis.com/' . $apiver . '/models/' . $modelEscaped;
    if ($is_oauth_token) {
        $endpoint = $base . ':generateContent';
        $headers = ['Content-Type: application/json', 'Authorization: Bearer ' . $apiKey];
    } else {
        $endpoint = $base . ':generateContent?key=' . urlencode($apiKey);
        $headers = ['Content-Type: application/json'];
    }

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_TIMEOUT, 60);
    $response = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $curlerr = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        aguia_log_error('Erro ao contatar Gemini: ' . $curlerr);
        echo json_encode(['success' => false, 'error' => 'Erro ao contatar o serviço Gemini. Verifique a configuração da chave e rede.']);
        exit;
    }

    $respJson = json_decode($response, true);
    if ($respJson === null) {
        aguia_log_error('Gemini generateContent: resposta não pôde ser decodificada como JSON. HTTP ' . $httpcode . ' body (trunc): ' . substr($response, 0, 2000));
        $respJson = ['__raw' => substr($response ?? '', 0, 2000), '__http_code' => $httpcode, '__used_auth' => ($is_oauth_token ? 'oauth' : 'api_key')];
    } else {
        $respJson['__http_code'] = $httpcode;
        $respJson['__used_auth'] = ($is_oauth_token ? 'oauth' : 'api_key');
    }

    if ($httpcode >= 400) {
        $payload2 = [
            'instances' => [ ['image' => ['imageBytes' => $b64]] ],
            'parameters' => [ 'maxOutputTokens' => 256, 'temperature' => 0.2 ]
        ];
        if ($is_oauth_token) {
            $endpoint2 = 'https://generativelanguage.googleapis.com/' . $apiver . '/models/' . $modelEscaped . ':predict';
        } else {
            $endpoint2 = 'https://generativelanguage.googleapis.com/' . $apiver . '/models/' . $modelEscaped . ':predict?key=' . urlencode($apiKey);
        }
        $ch2 = curl_init($endpoint2);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($payload2));
        curl_setopt($ch2, CURLOPT_TIMEOUT, 20);
        $response2 = curl_exec($ch2);
        $httpcode2 = curl_getinfo($ch2, CURLINFO_RESPONSE_CODE);
        $curlerr2 = curl_error($ch2);
        curl_close($ch2);
        if ($response2 === false) {
            aguia_log_error('Gemini fallback predict falhou: ' . $curlerr2);
            echo json_encode(['success' => false, 'error' => 'Erro ao contatar o serviço Gemini (fallback).']);
            exit;
        }
        $respJson = json_decode($response2, true);
        if ($respJson === null) {
            aguia_log_error('Gemini predict fallback: resposta não pôde ser decodificada como JSON. HTTP ' . $httpcode2);
            $respJson = ['__raw' => substr($response2 ?? '', 0, 2000), '__http_code' => $httpcode2, '__used_auth' => ($is_oauth_token ? 'oauth' : 'api_key'), '__fallback' => true];
        } else {
            $respJson['__http_code'] = $httpcode2;
            $respJson['__used_auth'] = ($is_oauth_token ? 'oauth' : 'api_key');
            $respJson['__fallback'] = true;
        }
    }

    $description = null;
    if (is_array($respJson)) {
        if (!empty($respJson['predictions']) && is_array($respJson['predictions'])) {
            foreach ($respJson['predictions'] as $p) {
                if (is_string($p)) { $description = $p; break; }
                if (is_array($p)) {
                    if (!empty($p['content']) && is_string($p['content'])) { $description = $p['content']; break; }
                    if (!empty($p['description']) && is_string($p['description'])) { $description = $p['description']; break; }
                }
            }
        }
        if (!$description && !empty($respJson['candidates']) && is_array($respJson['candidates'])) {
            $c = reset($respJson['candidates']);
            if (!empty($c['content']) && is_array($c['content']) && !empty($c['content']['parts']) && is_array($c['content']['parts'])) {
                $texts = [];
                foreach ($c['content']['parts'] as $part) {
                    if (is_array($part) && !empty($part['text']) && is_string($part['text'])) { $texts[] = $part['text']; }
                }
                if (!empty($texts)) { $description = trim(implode("\n\n", $texts)); }
            }
            if (!$description && !empty($c['content']) && is_string($c['content'])) $description = $c['content'];
            if (!$description && !empty($c['text']) && is_string($c['text'])) $description = $c['text'];
            if (!$description && !empty($c['finishReason'])) {
                $description = 'A resposta não trouxe texto. Motivo de término: ' . $c['finishReason'] . '. Tente novamente.';
            }
        }
        if (!$description && !empty($respJson['output'])) {
            if (is_string($respJson['output'])) $description = $respJson['output'];
            elseif (is_array($respJson['output'])) {
                foreach ($respJson['output'] as $o) {
                    if (is_string($o)) { $description = $o; break; }
                    if (is_array($o) && !empty($o['content']) && is_string($o['content'])) { $description = $o['content']; break; }
                }
            }
        }
        if (!$description && !empty($respJson['results']) && is_array($respJson['results'])) {
            foreach ($respJson['results'] as $r) {
                if (!empty($r['content']) && is_array($r['content'])) {
                    foreach ($r['content'] as $c) {
                        if (is_string($c)) { $description = $c; break 2; }
                        if (is_array($c) && !empty($c['text']) && is_string($c['text'])) { $description = $c['text']; break 2; }
                    }
                }
            }
        }
    }

    if (empty($description)) {
        $try_rerun = false;
        if (is_array($respJson) && !empty($respJson['candidates']) && is_array($respJson['candidates'])) {
            $firstc = reset($respJson['candidates']);
            if (!empty($firstc['finishReason']) && strtoupper($firstc['finishReason']) === 'MAX_TOKENS') {
                $try_rerun = true;
            }
        }

        if ($try_rerun) {
            aguia_log_error('Gemini: resposta truncada por MAX_TOKENS — tentando re-request com mais maxOutputTokens');
            $followPrompt = "Em português (pt-BR). Forneça uma descrição objetiva e concisa (máx 60 palavras) do que essa imagem representa, em até 5 tópicos curtos.";
            $followPayload = [
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            [ 'inline_data' => [ 'mime_type' => $mime, 'data' => $b64 ] ],
                            [ 'text' => $followPrompt ]
                        ]
                    ]
                ],
                'generationConfig' => [ 'temperature' => 0.0, 'maxOutputTokens' => $rerunMaxOutputTokens, 'responseMimeType' => 'text/plain', 'candidateCount' => 1 ]
            ];

            $ch_r = curl_init($endpoint);
            curl_setopt($ch_r, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch_r, CURLOPT_POST, true);
            curl_setopt($ch_r, CURLOPT_HTTPHEADER, $headers);
            curl_setopt($ch_r, CURLOPT_POSTFIELDS, json_encode($followPayload));
            curl_setopt($ch_r, CURLOPT_TIMEOUT, 60);
            $response_r = curl_exec($ch_r);
            $httpcode_r = curl_getinfo($ch_r, CURLINFO_RESPONSE_CODE);
            $curlerr_r = curl_error($ch_r);
            curl_close($ch_r);

            if ($response_r !== false) {
                $respRJson = json_decode($response_r, true);
                if (is_array($respRJson)) {
                    if (!empty($respRJson['candidates']) && is_array($respRJson['candidates'])) {
                        $c2 = reset($respRJson['candidates']);
                        if (!empty($c2['content']) && is_array($c2['content']) && !empty($c2['content']['parts'])) {
                            $texts2 = [];
                            foreach ($c2['content']['parts'] as $p2) {
                                if (is_array($p2) && !empty($p2['text']) && is_string($p2['text'])) $texts2[] = $p2['text'];
                            }
                            if (!empty($texts2)) {
                                $description = trim(implode("\n\n", $texts2));
                            }
                        }
                        if (!$description && !empty($c2['text']) && is_string($c2['text'])) $description = $c2['text'];
                    }
                    if (!$description && !empty($respRJson['output'])) {
                        if (is_string($respRJson['output'])) $description = $respRJson['output'];
                    }
                } else {
                    aguia_log_error('Gemini re-request: resposta não decodificável HTTP ' . $httpcode_r . ' body: ' . substr($response_r, 0, 2000));
                }
            } else {
                aguia_log_error('Gemini re-request falhou (curl): ' . $curlerr_r);
            }
        }

        if (empty($description)) {
            $description = 'Verifique se a imagem tem um formato válido, como JPEG ou PNG. Caso o problema persista, tente outro modelo Gemini nas configurações do plugin.';
        }
    }

    echo json_encode(['success' => true, 'description' => $description, 'api_response' => $respJson]);
    exit;

} catch (Exception $e) {
    aguia_log_error('Erro no endpoint interpretar_imagens: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Erro interno: ' . $e->getMessage()]);
    exit;
}
