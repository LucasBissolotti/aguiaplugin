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
 * Armazenamento de preferências em arquivos (fallback)
 *
 * Quando o plugin não estiver rodando dentro de um Moodle funcional, ou quando
 * o acesso ao banco de dados não estiver disponível, este módulo fornece um
 * mecanismo simples baseado em JSON por usuário no diretório `local_aguiaplugin/data`.
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Caso chamado fora do Moodle define MOODLE_INTERNAL para false.
if (!defined('MOODLE_INTERNAL')) {
    define('MOODLE_INTERNAL', false);
}

/**
 * Salva as preferências do usuário em um arquivo JSON.
 *
 * @param int $userid ID do usuário
 * @param array $preferences Array associativo com as preferências
 * @return bool True se salvou com sucesso
 */
function aguia_salvar_preferencias_arquivo($userid, $preferences) {
    $dir = dirname(__FILE__) . '/../data';
    $file = $dir . '/user_' . $userid . '.json';
    
    // Cria o diretório se não existir
    if (!file_exists($dir)) {
        if (!mkdir($dir, 0755, true)) {
            aguia_log_error("Não foi possível criar o diretório de dados");
            return false;
        }
    }
    
    // Adiciona timestamp
    $data = [
        'userid' => $userid,
        'preferences' => $preferences,
        'timestamp' => time()
    ];
    
    // Salva no arquivo
    $result = file_put_contents($file, json_encode($data));
    
    return ($result !== false);
}

/**
 * Carrega as preferências do usuário de um arquivo JSON.
 *
 * @param int $userid ID do usuário
 * @return array|null Array associativo com as preferências ou null se não existir
 */
function aguia_obter_preferencias_arquivo($userid) {
    $file = dirname(__FILE__) . '/../data/user_' . $userid . '.json';
    
    if (!file_exists($file)) {
        return null;
    }
    
    $content = file_get_contents($file);
    if ($content === false) {
        return null;
    }
    
    $data = json_decode($content, true);
    if (!$data || !isset($data['preferences'])) {
        return null;
    }
    
    return $data['preferences'];
}

/**
 * Atualiza uma preferência específica no arquivo JSON.
 *
 * @param int $userid ID do usuário
 * @param string $key Nome da preferência
 * @param mixed $value Valor da preferência
 * @return bool True se atualizou com sucesso
 */
function aguia_atualizar_preferencia_arquivo($userid, $key, $value) {
    // Carrega as preferências existentes
    $preferences = aguia_obter_preferencias_arquivo($userid);
    
    // Se não existir, inicializa um array vazio
    if ($preferences === null) {
        $preferences = [];
    }
    
    // Atualiza a preferência específica
    $preferences[$key] = $value;
    
    // Salva as preferências atualizadas
    return aguia_salvar_preferencias_arquivo($userid, $preferences);
}