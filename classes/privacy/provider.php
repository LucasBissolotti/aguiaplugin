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

namespace local_aguiaplugin\privacy;

defined('MOODLE_INTERNAL') || die();

use core_privacy\local\metadata\collection;
use core_privacy\local\request\approved_contextlist;
use core_privacy\local\request\approved_userlist;
use core_privacy\local\request\contextlist;
use core_privacy\local\request\userlist;
use core_privacy\local\request\writer;
use core_privacy\local\request\plugin\provider as plugin_provider;
use core_privacy\local\request\userlist_provider;
use context_system;

class provider implements
    \core_privacy\local\metadata\provider,
    \core_privacy\local\request\user_preference_provider,
    plugin_provider,
    userlist_provider {

    public static function get_metadata(collection $items): collection {
        $items->add_database_table('local_aguiaplugin_prefs', [
            'usuarioid' => 'privacy:metadata:usuarioid',
            'tamanho_fonte' => 'privacy:metadata:tamanho_fonte',
            'contraste' => 'privacy:metadata:contraste',
            'fontes_legiveis' => 'privacy:metadata:fontes_legiveis',
            'espaco_linhas' => 'privacy:metadata:espaco_linhas',
            'texto_para_fala' => 'privacy:metadata:texto_para_fala',
            'auxiliar_leitura' => 'privacy:metadata:auxiliar_leitura',
            'daltonismo' => 'privacy:metadata:daltonismo',
            'intensidade_cores' => 'privacy:metadata:intensidade_cores',
            'modo_fonte' => 'privacy:metadata:modo_fonte',
            'espaco_letras' => 'privacy:metadata:espaco_letras',
            'destaque_links' => 'privacy:metadata:destaque_links',
            'destaque_cabecalho' => 'privacy:metadata:destaque_cabecalho',
            'mascara_leitura_modo' => 'privacy:metadata:mascara_leitura_modo',
            'mascara_horizontal_nivel' => 'privacy:metadata:mascara_horizontal_nivel',
            'mascara_vertical_nivel' => 'privacy:metadata:mascara_vertical_nivel',
            'cursor_personalizado' => 'privacy:metadata:cursor_personalizado',
            'modificado_em' => 'privacy:metadata:modificado_em',
        ], 'privacy:metadata:table');
        return $items;
    }

    public static function export_user_preferences(int $userid) {
        global $DB;
        // Exporta um resumo como "User Preferences" para conveniência administrativa.
        $record = $DB->get_record('local_aguiaplugin_prefs', ['usuarioid' => $userid]);
        if (!$record) {
            return;
        }
        // Exporte preferências principais com descrições simples (não dependem de strings).
        $component = 'local_aguiaplugin';
        writer::export_user_preference($component, 'fontSize', (int)($record->tamanho_fonte ?? 100), 'Font size percentage');
        writer::export_user_preference($component, 'highContrast', (int)($record->contraste ?? 0), 'High contrast enabled');
        writer::export_user_preference($component, 'readableFonts', (int)($record->fontes_legiveis ?? 0), 'Readable fonts enabled');
        writer::export_user_preference($component, 'lineSpacing', (int)($record->espaco_linhas ?? 0), 'Line spacing level');
        writer::export_user_preference($component, 'textToSpeech', (int)($record->texto_para_fala ?? 0), 'Text-to-speech enabled');
        writer::export_user_preference($component, 'readingHelper', (int)($record->auxiliar_leitura ?? 0), 'Reading helper enabled');
        writer::export_user_preference($component, 'colorblind', (string)($record->daltonismo ?? 'none'), 'Colorblind mode');
        writer::export_user_preference($component, 'letterSpacing', (int)($record->espaco_letras ?? 0), 'Letter spacing level');
        writer::export_user_preference($component, 'emphasizeLinks', (int)($record->destaque_links ?? 0), 'Emphasize links');
        writer::export_user_preference($component, 'headerHighlight', (int)($record->destaque_cabecalho ?? 0), 'Emphasize headings');
        writer::export_user_preference($component, 'readingMaskMode', (int)($record->mascara_leitura_modo ?? 0), 'Reading mask mode');
        writer::export_user_preference($component, 'horizontalMaskLevel', (int)($record->mascara_horizontal_nivel ?? 0), 'Horizontal mask level');
        writer::export_user_preference($component, 'verticalMaskLevel', (int)($record->mascara_vertical_nivel ?? 0), 'Vertical mask level');
        writer::export_user_preference($component, 'customCursor', (int)($record->cursor_personalizado ?? 0), 'Custom cursor enabled');
    }

    // === Plugin provider (export/delete) ===

    /**
     * Informa os contextos que contêm dados do usuário.
     */
    public static function get_contexts_for_userid(int $userid): contextlist {
        global $DB;
        $contextlist = new contextlist();
        // Os dados são armazenados no contexto de sistema.
        $exists = $DB->record_exists('local_aguiaplugin_prefs', ['usuarioid' => $userid]);
        if ($exists) {
            $contextlist->add_system_context();
        }
        return $contextlist;
    }

    /**
     * Exporta dados do usuário para os contextos aprovados.
     */
    public static function export_user_data(approved_contextlist $contextlist) {
        global $DB;
        $userid = $contextlist->get_user()->id;

        foreach ($contextlist as $context) {
            if ($context->contextlevel !== CONTEXT_SYSTEM) {
                continue;
            }
            $record = $DB->get_record('local_aguiaplugin_prefs', ['usuarioid' => $userid]);
            if (!$record) {
                continue;
            }
            // Constrói uma estrutura amigável para exportação.
            $data = [
                'tamanho_fonte' => (int)($record->tamanho_fonte ?? 100),
                'contraste' => (int)($record->contraste ?? 0),
                'fontes_legiveis' => (int)($record->fontes_legiveis ?? 0),
                'espaco_linhas' => (int)($record->espaco_linhas ?? 0),
                'texto_para_fala' => (int)($record->texto_para_fala ?? 0),
                'auxiliar_leitura' => (int)($record->auxiliar_leitura ?? 0),
                'daltonismo' => (string)($record->daltonismo ?? 'none'),
                'intensidade_cores' => (int)($record->intensidade_cores ?? 0),
                'modo_fonte' => (int)($record->modo_fonte ?? 0),
                'espaco_letras' => (int)($record->espaco_letras ?? 0),
                'destaque_links' => (int)($record->destaque_links ?? 0),
                'destaque_cabecalho' => (int)($record->destaque_cabecalho ?? 0),
                'mascara_leitura_modo' => (int)($record->mascara_leitura_modo ?? 0),
                'mascara_horizontal_nivel' => (int)($record->mascara_horizontal_nivel ?? 0),
                'mascara_vertical_nivel' => (int)($record->mascara_vertical_nivel ?? 0),
                'cursor_personalizado' => (int)($record->cursor_personalizado ?? 0),
                'modificado_em' => (int)($record->modificado_em ?? 0),
            ];
            writer::with_context($context)->export_data(['aguiaplugin'], (object)$data);
        }
    }

    /**
     * Exclui dados de todos os usuários em um contexto.
     */
    public static function delete_data_for_all_users_in_context(\context $context) {
        global $DB;
        if ($context->contextlevel !== CONTEXT_SYSTEM) {
            return;
        }
        $DB->delete_records('local_aguiaplugin_prefs');
    }

    /**
     * Exclui dados de um usuário nos contextos aprovados.
     */
    public static function delete_data_for_user(approved_contextlist $contextlist) {
        global $DB;
        $userid = $contextlist->get_user()->id;
        foreach ($contextlist as $context) {
            if ($context->contextlevel !== CONTEXT_SYSTEM) {
                continue;
            }
            $DB->delete_records('local_aguiaplugin_prefs', ['usuarioid' => $userid]);
        }
    }

    // === Userlist provider (bulk operations) ===

    /**
     * Lista usuários que possuem dados nesse contexto.
     */
    public static function get_users_in_context(userlist $userlist) {
        if ($userlist->get_context()->contextlevel !== CONTEXT_SYSTEM) {
            return;
        }
        $sql = "SELECT usuarioid AS userid FROM {local_aguiaplugin_prefs}";
        $userlist->add_from_sql('userid', $sql, []);
    }

    /**
     * Exclui dados para uma lista aprovada de usuários.
     */
    public static function delete_data_for_users(approved_userlist $userlist) {
        global $DB;
        if ($userlist->get_context()->contextlevel !== CONTEXT_SYSTEM) {
            return;
        }
        $userids = $userlist->get_userids();
        if (empty($userids)) {
            return;
        }
        list($insql, $params) = $DB->get_in_or_equal($userids, SQL_PARAMS_NAMED);
        $DB->delete_records_select('local_aguiaplugin_prefs', "usuarioid $insql", $params);
    }
}
