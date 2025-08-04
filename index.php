<?php
// Definindo o acesso ao plugin
require_once('../../config.php');
require_login();

// Carrega o título da página
$PAGE->set_url('/local/aguiaplugin/index.php');
$PAGE->set_context(context_system::instance());
$PAGE->set_title(get_string('pluginname', 'local_aguiaplugin'));
$PAGE->set_heading(get_string('pluginname', 'local_aguiaplugin'));

// Requer o JavaScript de acessibilidade
local_aguiaplugin_require_js();

// Exibe o conteúdo principal do plugin
echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('pluginname', 'local_aguiaplugin'));

// Adicione as instruções, botões, ou qualquer conteúdo de interação aqui

echo $OUTPUT->footer();
