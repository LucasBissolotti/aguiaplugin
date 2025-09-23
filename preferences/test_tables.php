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
 * Teste para verificar e corrigir problemas com as tabelas do plugin AGUIA
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// Configurações iniciais
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', dirname(__FILE__) . '/../../aguia_error.log');

// Função para criar o diretório de dados
function create_data_directory() {
    $dataDir = dirname(__FILE__) . '/../data';
    
    echo "<h3>Verificando diretório de dados</h3>";
    
    if (!file_exists($dataDir)) {
        echo "<p>O diretório de dados não existe. Tentando criar...</p>";
        
        if (mkdir($dataDir, 0755, true)) {
            echo "<p style='color:green'>✅ Diretório de dados criado com sucesso.</p>";
            return true;
        } else {
            echo "<p style='color:red'>❌ Não foi possível criar o diretório de dados. Verifique permissões.</p>";
            return false;
        }
    } else {
        echo "<p>Diretório de dados já existe.</p>";
        
        // Verifica permissões
        if (is_writable($dataDir)) {
            echo "<p style='color:green'>✅ Diretório de dados tem permissão de escrita.</p>";
            return true;
        } else {
            echo "<p style='color:red'>❌ Diretório de dados NÃO tem permissão de escrita.</p>";
            return false;
        }
    }
}

// Função para testar o armazenamento em arquivo
function test_file_storage() {
    $dataDir = dirname(__FILE__) . '/../data';
    $testFile = $dataDir . '/test_file.json';
    
    echo "<h3>Testando armazenamento em arquivo</h3>";
    
    // Tenta criar um arquivo de teste
    $testData = [
        'userid' => 0,
        'preferences' => ['test' => 'value'],
        'timestamp' => time()
    ];
    
    $result = file_put_contents($testFile, json_encode($testData));
    
    if ($result !== false) {
        echo "<p style='color:green'>✅ Arquivo de teste criado com sucesso.</p>";
        
        // Tenta ler o arquivo
        $content = file_get_contents($testFile);
        if ($content !== false) {
            echo "<p style='color:green'>✅ Arquivo de teste lido com sucesso.</p>";
            unlink($testFile); // Remove o arquivo de teste
            return true;
        } else {
            echo "<p style='color:red'>❌ Não foi possível ler o arquivo de teste.</p>";
            return false;
        }
    } else {
        echo "<p style='color:red'>❌ Não foi possível criar o arquivo de teste.</p>";
        return false;
    }
}

// Função para buscar possíveis localizações do config.php do Moodle
function find_moodle_config() {
    $possible_paths = [
        '../../config.php',                  // Caminho relativo padrão
        '../../../config.php',               // Um nível acima
        '../../../../config.php',            // Dois níveis acima
        $_SERVER['DOCUMENT_ROOT'] . '/config.php',            // Root do servidor web
        $_SERVER['DOCUMENT_ROOT'] . '/moodle/config.php',     // Subdiretório moodle
        dirname(dirname(dirname(__FILE__))) . '/config.php',  // Baseado no caminho atual
        dirname(dirname(dirname(dirname(__FILE__)))) . '/config.php', // Um nível acima
    ];
    
    $results = [];
    foreach ($possible_paths as $path) {
        $results[$path] = file_exists($path);
    }
    
    return $results;
}

// Função para mostrar o cabeçalho da página
function show_header() {
    echo "<!DOCTYPE html>
<html>
<head>
    <title>Teste de Tabelas AGUIA</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #2271ff; }
        pre { background-color: #f5f5f5; padding: 10px; overflow: auto; border: 1px solid #ddd; }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        .code { font-family: monospace; background-color: #f5f5f5; padding: 2px 4px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .fix-button { background-color: #4CAF50; border: none; color: white; padding: 10px 15px; 
                     text-align: center; text-decoration: none; display: inline-block; 
                     font-size: 14px; margin: 4px 2px; cursor: pointer; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Teste de Tabelas do Plugin AGUIA</h1>
    <p>Esta página verifica e tenta corrigir problemas com as tabelas do plugin AGUIA.</p>";
}

// Função para mostrar o rodapé da página
function show_footer() {
    echo "</body>
</html>";
}

// Função para verificar get.php e save.php
function check_preference_files() {
    $getPhpFile = __DIR__ . '/get.php';
    $savePhpFile = __DIR__ . '/save.php';
    
    $results = [
        'get.php' => [
            'exists' => file_exists($getPhpFile),
            'config_check' => false,
            'content' => file_exists($getPhpFile) ? file_get_contents($getPhpFile) : ''
        ],
        'save.php' => [
            'exists' => file_exists($savePhpFile),
            'config_check' => false,
            'content' => file_exists($savePhpFile) ? file_get_contents($savePhpFile) : ''
        ]
    ];
    
    // Verifica se há verificação de existência do config.php
    $results['get.php']['config_check'] = strpos($results['get.php']['content'], 'file_exists') !== false && 
                                         strpos($results['get.php']['content'], 'config.php') !== false;
    $results['save.php']['config_check'] = strpos($results['save.php']['content'], 'file_exists') !== false && 
                                          strpos($results['save.php']['content'], 'config.php') !== false;
    
    return $results;
}

// Função principal
function main() {
    show_header();
    
    // Verifica caminhos possíveis para o config.php do Moodle
    $configPaths = find_moodle_config();
    $configExists = in_array(true, $configPaths);
    $correctPath = array_search(true, $configPaths);
    
    echo "<h2>1. Diagnóstico do Problema do Config.php</h2>";
    
    echo "<table>
        <tr>
            <th>Caminho Verificado</th>
            <th>Status</th>
        </tr>";
    
    foreach ($configPaths as $path => $exists) {
        echo "<tr>
            <td><span class='code'>" . htmlspecialchars($path) . "</span></td>
            <td>" . ($exists ? "<span class='success'>✅ Encontrado</span>" : "<span class='error'>❌ Não encontrado</span>") . "</td>
        </tr>";
    }
    
    echo "</table>";
    
    if ($configExists) {
        echo "<p class='success'>✅ Arquivo config.php do Moodle encontrado em: <span class='code'>" . htmlspecialchars($correctPath) . "</span></p>";
    } else {
        echo "<p class='error'>❌ Arquivo config.php do Moodle não encontrado em nenhum dos caminhos verificados.</p>";
        echo "<p>Isto pode indicar que:</p>
              <ul>
                <li>O plugin não está instalado no diretório correto</li>
                <li>O Moodle não está instalado corretamente</li>
                <li>O plugin está sendo acessado fora do contexto do Moodle</li>
              </ul>";
    }
    
    // Verifica os arquivos de preferências
    $prefFiles = check_preference_files();
    
    echo "<h2>2. Verificação dos Arquivos de Preferências</h2>";
    
    echo "<table>
        <tr>
            <th>Arquivo</th>
            <th>Existe</th>
            <th>Verifica config.php</th>
        </tr>
        <tr>
            <td><span class='code'>get.php</span></td>
            <td>" . ($prefFiles['get.php']['exists'] ? "<span class='success'>✅ Sim</span>" : "<span class='error'>❌ Não</span>") . "</td>
            <td>" . ($prefFiles['get.php']['config_check'] ? "<span class='success'>✅ Sim</span>" : "<span class='error'>❌ Não</span>") . "</td>
        </tr>
        <tr>
            <td><span class='code'>save.php</span></td>
            <td>" . ($prefFiles['save.php']['exists'] ? "<span class='success'>✅ Sim</span>" : "<span class='error'>❌ Não</span>") . "</td>
            <td>" . ($prefFiles['save.php']['config_check'] ? "<span class='success'>✅ Sim</span>" : "<span class='error'>❌ Não</span>") . "</td>
        </tr>
    </table>";
    
    echo "<h2>3. Verificando componentes de armazenamento</h2>";
    
    // Verifica o diretório de dados
    $dataDirectoryOk = create_data_directory();
    
    // Testa o armazenamento em arquivo
    $fileStorageOk = test_file_storage();
    
    echo "<h2>4. Verificando tabelas do banco de dados</h2>";
    
    $dbTestComplete = false;
    // Tenta usar o caminho do config.php se encontrado
    if ($configExists) {
        try {
            require_once($correctPath);
            echo "<p class='success'>✅ Arquivo config.php do Moodle carregado com sucesso.</p>";
            
            // Carrega os arquivos necessários
            try {
                require_once('check_tables.php');
                echo "<p class='success'>✅ Arquivo check_tables.php carregado.</p>";
                
                // Verifica se a função está disponível
                if (function_exists('local_aguiaplugin_check_tables')) {
                    echo "<p class='success'>✅ Função local_aguiaplugin_check_tables encontrada.</p>";
                    
                    // Tenta verificar e criar as tabelas
                    $result = local_aguiaplugin_check_tables();
                    
                    if ($result) {
                        echo "<p class='success'>✅ Tabela verificada/criada com sucesso!</p>";
                        
                        // Tenta fazer uma consulta de teste
                        global $DB;
                        try {
                            $records = $DB->get_records('local_aguiaplugin_prefs', [], '', 'id', 0, 1);
                            echo "<p class='success'>✅ Consulta de teste executada com sucesso.</p>";
                            echo "<p>Registros encontrados: " . count($records) . "</p>";
                            $dbTestComplete = true;
                        } catch (Exception $e) {
                            echo "<p class='error'>❌ Erro ao executar consulta de teste: " . $e->getMessage() . "</p>";
                        }
                    } else {
                        echo "<p class='error'>❌ Não foi possível verificar/criar a tabela.</p>";
                    }
                } else {
                    echo "<p class='error'>❌ Função local_aguiaplugin_check_tables não encontrada.</p>";
                }
            } catch (Exception $e) {
                echo "<p class='error'>❌ Erro ao carregar check_tables.php: " . $e->getMessage() . "</p>";
            }
        } catch (Exception $e) {
            echo "<p class='error'>❌ Erro ao carregar config.php: " . $e->getMessage() . "</p>";
        }
    } else {
        echo "<p class='warning'>⚠️ Arquivo config.php do Moodle não encontrado. Não é possível verificar o banco de dados.</p>";
    }
    
    echo "<h2>5. Resultado dos Testes</h2>";
    echo "<table>
        <tr>
            <th>Componente</th>
            <th>Status</th>
        </tr>
        <tr>
            <td>Config.php do Moodle</td>
            <td>" . ($configExists ? "<span class='success'>✅ Encontrado</span>" : "<span class='error'>❌ Não encontrado</span>") . "</td>
        </tr>
        <tr>
            <td>Diretório de dados</td>
            <td>" . ($dataDirectoryOk ? "<span class='success'>✅ OK</span>" : "<span class='error'>❌ Falha</span>") . "</td>
        </tr>
        <tr>
            <td>Armazenamento em arquivo</td>
            <td>" . ($fileStorageOk ? "<span class='success'>✅ OK</span>" : "<span class='error'>❌ Falha</span>") . "</td>
        </tr>
        <tr>
            <td>Banco de dados</td>
            <td>" . ($dbTestComplete ? "<span class='success'>✅ OK</span>" : "<span class='error'>❌ Não testado</span>") . "</td>
        </tr>
    </table>";
    
    echo "<h2>6. Problemas Identificados e Soluções</h2>";
    
    if (!$configExists) {
        echo "<div class='error'>
            <h3>Problema #1: Config.php não encontrado</h3>
            <p>O arquivo de configuração do Moodle não foi encontrado nos caminhos verificados.</p>
            
            <h4>Soluções Possíveis:</h4>
            <ol>
                <li>Verifique se o plugin está instalado no diretório correto do Moodle (<code>moodle/local/aguiaplugin</code>)</li>
                <li>Certifique-se de que você está acessando esta página através do Moodle e não diretamente</li>
                <li>Modifique os arquivos get.php e save.php para usarem um método mais robusto de localizar o config.php</li>
            </ol>
        </div>";
    }
    
    if (!$prefFiles['get.php']['config_check'] || !$prefFiles['save.php']['config_check']) {
        echo "<div class='error'>
            <h3>Problema #2: get.php e/ou save.php não verificam a existência do config.php</h3>
            <p>Estes arquivos estão tentando incluir o config.php sem verificar se ele existe primeiro.</p>
            
            <h4>Solução:</h4>
            <p>Modifique os arquivos para verificar a existência do config.php antes de incluí-lo, como no exemplo abaixo:</p>
            <pre>
// Tenta carregar o arquivo de configuração do Moodle
\$moodleConfigExists = file_exists('../../config.php');
if (\$moodleConfigExists) {
    try {
        require_once('../../config.php');
        // ... código adicional
    } catch (Exception \$e) {
        // Tratamento de erro
    }
}</pre>
        </div>";
    }
    
    if (!$dataDirectoryOk || !$fileStorageOk) {
        echo "<div class='warning'>
            <h3>Problema #3: Sistema de armazenamento em arquivo não está funcionando</h3>
            <p>O diretório de dados não existe ou não tem permissões de escrita.</p>
            
            <h4>Solução:</h4>
            <p>Crie manualmente o diretório <code>local/aguiaplugin/data</code> e dê permissões de escrita:</p>
            <pre>
mkdir -p " . htmlspecialchars(dirname(dirname(__FILE__))) . "/data
chmod 755 " . htmlspecialchars(dirname(dirname(__FILE__))) . "/data</pre>
        </div>";
    }
    
    echo "<h2>7. Recomendações Finais</h2>";
    
    echo "<p>Baseado nos resultados dos testes, recomendamos:</p>";
    echo "<ol>";
    
    if (!$configExists) {
        echo "<li class='error'>Corrija o problema do config.php não encontrado primeiro</li>";
    }
    
    if (!$prefFiles['get.php']['config_check'] || !$prefFiles['save.php']['config_check']) {
        echo "<li class='error'>Modifique get.php e save.php para verificarem a existência do config.php antes de incluí-lo</li>";
    }
    
    if (!$dataDirectoryOk) {
        echo "<li class='warning'>Crie o diretório de dados para o armazenamento em arquivo</li>";
    }
    
    echo "<li>Verifique se o JavaScript está usando localStorage como fallback quando o servidor falha</li>";
    echo "<li>Consulte o arquivo <a href='../INSTRUCOES_PREFERENCIAS.md'>INSTRUCOES_PREFERENCIAS.md</a> para mais informações</li>";
    echo "</ol>";
    
    echo "<p>Para mais informações sobre como resolver problemas com o plugin AGUIA, consulte o arquivo <a href='../INSTRUCOES_PREFERENCIAS.md'>INSTRUCOES_PREFERENCIAS.md</a>.</p>";
    
    show_footer();
}

// Executa a função principal
main();