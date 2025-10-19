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
 * Upgrade procedure
 *
 * @package    local_aguiaplugin
 * @copyright  2025 AGUIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Upgrade function for plugin
 * @param int
 * @return bool
 */
function xmldb_local_aguiaplugin_upgrade($oldversion) {
    global $DB, $CFG;
    $dbman = $DB->get_manager();
        
    if ($oldversion < 2025080401) {
        // Remove a configuração de estilo obsoleta
        unset_config('use_legacy_style', 'local_aguiaplugin');
        
        // Salvar nova versão
        upgrade_plugin_savepoint(true, 2025080401, 'local', 'aguiaplugin');
    }
    
    if ($oldversion < 2025080402) {        
        // Salvar nova versão
        upgrade_plugin_savepoint(true, 2025080402, 'local', 'aguiaplugin');
    }

    if ($oldversion < 2025101505) {
        $table = new xmldb_table('local_aguiaplugin_prefs');

        // Garante as novas colunas (se não existirem).
        $newfields = [
            new xmldb_field('intensidade_cores', XMLDB_TYPE_INTEGER, '2', null, null, null, '0', 'daltonismo'),
            new xmldb_field('modo_fonte', XMLDB_TYPE_INTEGER, '2', null, null, null, '0', 'intensidade_cores'),
            new xmldb_field('espaco_letras', XMLDB_TYPE_INTEGER, '3', null, null, null, '0', 'modo_fonte'),
            new xmldb_field('destaque_links', XMLDB_TYPE_INTEGER, '1', null, null, null, '0', 'espaco_letras'),
            new xmldb_field('destaque_cabecalho', XMLDB_TYPE_INTEGER, '1', null, null, null, '0', 'destaque_links'),
            new xmldb_field('mascara_leitura_modo', XMLDB_TYPE_INTEGER, '1', null, null, null, '0', 'destaque_cabecalho'),
            new xmldb_field('mascara_horizontal_nivel', XMLDB_TYPE_INTEGER, '2', null, null, null, '0', 'mascara_leitura_modo'),
            new xmldb_field('mascara_vertical_nivel', XMLDB_TYPE_INTEGER, '2', null, null, null, '0', 'mascara_horizontal_nivel'),
            new xmldb_field('cursor_personalizado', XMLDB_TYPE_INTEGER, '1', null, null, null, '0', 'mascara_vertical_nivel'),
        ];
        foreach ($newfields as $field) {
            if (!$dbman->field_exists($table, $field)) {
                try {
                    $dbman->add_field($table, $field);
                } catch (Exception $e) {
                }
            }
        }

        // Garante as chaves sobre usuarioid (se a coluna existir).
        try {
            $newuni = new xmldb_key('usuarioid', XMLDB_KEY_UNIQUE, ['usuarioid']);
            $dbman->add_key($table, $newuni);
        } catch (Exception $e) { /* noop */ }
        try {
            $newfk = new xmldb_key('fk_usuarioid', XMLDB_KEY_FOREIGN, ['usuarioid'], 'user', ['id']);
            $dbman->add_key($table, $newfk);
        } catch (Exception $e) { /* noop */ }
        upgrade_plugin_savepoint(true, 2025101505, 'local', 'aguiaplugin');
    }

    return true;
}