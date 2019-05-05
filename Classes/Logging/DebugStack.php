<?php

declare(strict_types=1);

namespace t3n\Neos\Debug\Logging;

use Doctrine\DBAL\Logging\SQLLogger;

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

    /**
     * @var float
     */
    protected $startTime = 0;

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
        return substr($sql, $start, $end - $start);
    }
}
