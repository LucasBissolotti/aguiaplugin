<?php
defined('MOODLE_INTERNAL') || die();

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_aguiaplugin_settings', get_string('settings', 'local_aguiaplugin'));

    // Configuração para escolher se o plugin será ativado ou não
    $settings->add(new admin_setting_configcheckbox(
        'local_aguiaplugin/enable',
        get_string('enableplugin', 'local_aguiaplugin'),
        get_string('enableplugin_desc', 'local_aguiaplugin'),
        1
    ));

    // Ativar logs de depuração do plugin (controla aguia_debug_log)
    $settings->add(new admin_setting_configcheckbox(
        'local_aguiaplugin/debuglog',
        get_string('debuglog', 'local_aguiaplugin'),
        get_string('debuglog_desc', 'local_aguiaplugin'),
        0
    ));
    
    // Informação sobre a interface de acessibilidade
    $settings->add(new admin_setting_heading(
        'local_aguiaplugin/interface_info',
        'Interface de Acessibilidade',
        'Este plugin oferece uma interface moderna e completa para melhorar a acessibilidade do seu site.'
    ));

    // Adiciona as configurações à página de administração
    $ADMIN->add('localplugins', $settings);
}
