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

    // Configurações para integração com Gemini (Generative AI)
    $settings->add(new admin_setting_configpasswordunmask(
        'local_aguiaplugin/gemini_api_key',
        get_string('gemini_api_key', 'local_aguiaplugin'),
        get_string('gemini_api_key_desc', 'local_aguiaplugin'),
        ''
    ));

    // For convenience, provide a select of known Gemini model identifiers and allow a custom value.
    $modeloptions = [
        'gemini-pro' => 'gemini-pro',
        'gemini-1.5-pro' => 'gemini-1.5-pro',
        'gemini-1.5-flash' => 'gemini-1.5-flash',
        'gemini-1.5-flash-lite' => 'gemini-1.5-flash-lite',
        'gemini-2-pro' => 'gemini-2-pro',
        'gemini-2.5-pro' => 'gemini-2.5-pro',
        'gemini-2.5-flash' => 'gemini-2.5-flash',
        'gemini-2.5-flash-lite' => 'gemini-2.5-flash-lite',
        'custom' => get_string('gemini_model_option_custom', 'local_aguiaplugin')
    ];
    // If the saved value is not present in the current options (e.g. older keys like 'models/gemini-2.5-image'),
    // add it to the options so Moodle won't show the "Valor atual inválido" warning. Keep label clear for admins.
    $currentmodel = get_config('local_aguiaplugin', 'gemini_model');
    if (!empty($currentmodel) && !array_key_exists($currentmodel, $modeloptions)) {
        // Keep the exact stored value as the key and show a friendly label indicating it's a previous value.
        $modeloptions[$currentmodel] = $currentmodel . ' (' . get_string('gemini_model_option_legacy', 'local_aguiaplugin') . ')';
    }
    $settings->add(new admin_setting_configselect(
        'local_aguiaplugin/gemini_model',
        get_string('gemini_model', 'local_aguiaplugin'),
        get_string('gemini_model_desc', 'local_aguiaplugin'),
        'gemini-pro',
        $modeloptions
    ));

    // Allow admins to specify an explicit custom model string when 'custom' is selected above.
    $settings->add(new admin_setting_configtext(
        'local_aguiaplugin/gemini_model_custom',
        get_string('gemini_model_custom', 'local_aguiaplugin'),
        get_string('gemini_model_custom_desc', 'local_aguiaplugin'),
        '',
        PARAM_TEXT
    ));

    // Adiciona as configurações à página de administração
    $ADMIN->add('localplugins', $settings);
}
