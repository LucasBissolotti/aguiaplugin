<?php
/**
 * Página principal do plugin AGUIA
 *
 * Esta página inicializa o contexto do Moodle, garante que o usuário esteja
 * autenticado e injeta os scripts/styles necessários do plugin antes de
 * renderizar o cabeçalho e o conteúdo principal.
 *
 * Comentários padronizados em pt-BR; nenhuma alteração funcional.
 */

require_once('../../config.php');
require_login();

// Configura a página (URL, contexto, título e cabeçalho).
$PAGE->set_url('/local/aguiaplugin/index.php');
$PAGE->set_context(context_system::instance());
$PAGE->set_title(get_string('pluginname', 'local_aguiaplugin'));
$PAGE->set_heading(get_string('pluginname', 'local_aguiaplugin'));

// Garante que os scripts de acessibilidade do plugin sejam carregados.
local_aguiaplugin_require_js();

// Renderiza o cabeçalho da página e o título do plugin.
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('pluginname', 'local_aguiaplugin'));

// TODO: adicionar conteúdo interativo (botões/controles de acessibilidade).

echo $OUTPUT->footer();
