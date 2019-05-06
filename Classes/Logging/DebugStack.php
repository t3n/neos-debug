<?php

declare(strict_types=1);

namespace t3n\Neos\Debug\Logging;

/**
 * This file is part of the t3n.Neos.Debugger package.
 *
 * (c) 2019 yeebase media GmbH
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */

use Doctrine\DBAL\Logging\SQLLogger;
use Neos\Flow\Annotations as Flow;

class DebugStack implements SQLLogger
{
    /**
     * @var mixed[]
     */
    public $queries = [];

    /**
     * @var mixed[]
     */
    public $tables = [];

    /**
     * @var int
     */
    public $queryCount = 0;

    /**
     * @var float
     */
    public $executionTime = 0.0;

    /**DebugStack_Original
     * @var float
     */
    protected $startTime = 0;

    /**
     * @var mixed[]
     */
    public $slowQueries = [];

    /**
     * @Flow\InjectConfiguration(path="sql.slowQueryAfter")
     *
     * @var double
     */
    protected $slowQueryAfter;

    /**
     * @param mixed $sql
     * @param mixed[]|null $params
     * @param mixed[]|null $types
     */
    public function startQuery($sql, ?array $params = null, ?array $types = null): void
    {
        $tableName = $this->parseTableName($sql);
        $this->queries[++$this->queryCount] = ['sql' => $sql, 'table' => $tableName, 'params' => $params, 'types' => $types, 'executionMS' => 0];
        $this->startTime = microtime(true);
    }

    public function stopQuery(): void
    {
        $executionTime = (microtime(true) - $this->startTime) * 1000;
        $this->queries[$this->queryCount]['executionMS'] = $executionTime;
        $this->executionTime += $executionTime;

        if ($executionTime > $this->slowQueryAfter) {
            $this->slowQueries[] = $this->queries[$this->queryCount];
        }

        $table = $this->queries[$this->queryCount]['table'];
        if (! array_key_exists($table, $this->tables)) {
            $this->tables[$table] = [
                'queryCount' => 1,
                'executionTime' => $executionTime,
            ];
        } else {
            $this->tables[$table]['queryCount']++;
            $this->tables[$table]['executionTime'] += $executionTime;
        }
    }

    protected function parseTableName(string $sql): string
    {
        $sql = strtolower($sql);
        $start = strpos($sql, 'from ') + 5;
        $end = strpos($sql, ' ', $start);
        $tableName = substr($sql, $start, $end - $start);

        if ($tableName === false) {
            return '';
        }

        return $tableName;
    }
}
