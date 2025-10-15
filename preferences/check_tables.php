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
 * Verificação mínima das tabelas do plugin.
 * Mantido intencionalmente simples para não bloquear o salvamento caso a instalação já tenha sido feita via install.xml/upgrade.php.
 *
 * @package    local_aguiaplugin
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if (!function_exists('local_aguiaplugin_check_tables')) {
    /**
     * Retorna true para não bloquear o fluxo de salvamento. A criação/alteração de tabelas é responsabilidade do install.xml/upgrade.
     * Você pode estender esta função para validar a existência da tabela se desejar.
     *
     * @return bool
     */
    function local_aguiaplugin_check_tables(): bool {
        return true;
    }
}
