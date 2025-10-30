<?php
defined('MOODLE_INTERNAL') || die();

/**
 * Configurações do plugin AGUIA
 *
 * Registra as opções exibidas na página de administração do Moodle
 * para o plugin de acessibilidade (local_aguiaplugin).
 */

if ($hassiteconfig) {
    $settings = new admin_settingpage('local_aguiaplugin_settings', get_string('settings', 'local_aguiaplugin'));

    // Habilita/desabilita o plugin globalmente (chave: local_aguiaplugin/enable).
    $settings->add(new admin_setting_configcheckbox(
        'local_aguiaplugin/enable',
        get_string('enableplugin', 'local_aguiaplugin'),
        get_string('enableplugin_desc', 'local_aguiaplugin'),
        1
    ));

    // Ativa o registro de depuração do plugin (chave: local_aguiaplugin/debuglog).
    $settings->add(new admin_setting_configcheckbox(
        'local_aguiaplugin/debuglog',
        get_string('debuglog', 'local_aguiaplugin'),
        get_string('debuglog_desc', 'local_aguiaplugin'),
        0
    ));
    
    // Cabeçalho informativo sobre a interface de acessibilidade do plugin.
    $settings->add(new admin_setting_heading(
        'local_aguiaplugin/interface_info',
        'Interface de Acessibilidade',
        'Este plugin oferece uma interface moderna e completa para melhorar a acessibilidade do seu site.'
    ));

    // Chave de API para integração com Gemini (campo mascarado).
    $settings->add(new admin_setting_configpasswordunmask(
        'local_aguiaplugin/gemini_api_key',
        get_string('gemini_api_key', 'local_aguiaplugin'),
        get_string('gemini_api_key_desc', 'local_aguiaplugin'),
        ''
    ));

    // Lista de modelos Gemini conhecidos; inclui 'custom' para inserir identificador próprio.
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

    // Se o valor salvo não estiver nas opções atuais (ex.: chaves legadas), adiciona-o
    // para evitar que o Moodle exiba aviso de "Valor atual inválido".
    $currentmodel = get_config('local_aguiaplugin', 'gemini_model');
    if (!empty($currentmodel) && !array_key_exists($currentmodel, $modeloptions)) {
        // Mantém o valor exato como chave e informa que é um valor legado no rótulo.
        $modeloptions[$currentmodel] = $currentmodel . ' (' . get_string('gemini_model_option_legacy', 'local_aguiaplugin') . ')';
    }
    $settings->add(new admin_setting_configselect(
        'local_aguiaplugin/gemini_model',
        get_string('gemini_model', 'local_aguiaplugin'),
        get_string('gemini_model_desc', 'local_aguiaplugin'),
        'gemini-pro',
        $modeloptions
    ));

    // Campo para inserir identificador de modelo personalizado quando 'custom' for selecionado.
    $settings->add(new admin_setting_configtext(
        'local_aguiaplugin/gemini_model_custom',
        get_string('gemini_model_custom', 'local_aguiaplugin'),
        get_string('gemini_model_custom_desc', 'local_aguiaplugin'),
        '',
        PARAM_TEXT
    ));

    // Registra a página de configurações no menu de administração (categoria: localplugins).
    $ADMIN->add('localplugins', $settings);
}
