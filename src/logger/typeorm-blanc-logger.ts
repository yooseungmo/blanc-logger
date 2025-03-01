import * as chalk from 'chalk';
import { Logger, QueryRunner } from 'typeorm';
import * as util from 'util';
import { addQueryAnalysis, formatParameters, indent, sqlHighlighter } from '../helper/sqlFormatter';
import { blancLogger } from './blanc-logger';

export class TypeOrmBlancLogger implements Logger {
  private formatQuery(query: string, params?: unknown[]): string {
    const highlightedQuery = sqlHighlighter(query);
    const indentedQuery = indent(highlightedQuery);
    const paramsText = formatParameters(params ?? []);
    const analysisText = addQueryAnalysis(query);
    return [
      chalk.dim('╔═ SQL Query ═════════════════════════════════'),
      indentedQuery,
      paramsText ? chalk.dim('╠═ Parameters ═══════════════════════════════') : '',
      paramsText ? indent(paramsText) : '',
      analysisText ? chalk.dim('╠═ Analysis ═════════════════════════════════') : '',
      analysisText ? indent(analysisText) : '',
      chalk.dim('╚═════════════════════════════════════════════\n'),
    ]
      .filter((line) => line.trim() !== '')
      .join('\n');
  }

  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner): void {
    const message = this.formatQuery(query, parameters);
    blancLogger.log('info', `[SQL Execute]\n${message}`);
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner,
  ): void {
    const errMsg = error instanceof Error ? error.message : error;
    const formattedError = chalk.redBright.bold(errMsg);
    const message = [
      chalk.dim('╔═ SQL Error ════════════════════════════════'),
      `Error: ${formattedError}`,
      chalk.dim('╠═ Stack Trace ═══════════════════════════════'),
      chalk.gray(util.inspect(error instanceof Error ? error.stack : '', { depth: 2 })),
      this.formatQuery(query, parameters),
      chalk.dim('╚═════════════════════════════════════════════\n'),
    ].join('\n');
    blancLogger.log('error', message);
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    queryRunner?: QueryRunner,
  ): void {
    const formattedTime = chalk.magenta(`${time}ms`);
    const message = [
      chalk.dim('╔═ Slow Query Warning (Threshold >100ms) ═══════'),
      `Execution Time: ${formattedTime}`,
      chalk.dim('╠═ SQL Query ═════════════════════════════════'),
      indent(sqlHighlighter(query)),
      parameters && parameters.length > 0
        ? chalk.dim('╠═ Parameters ═══════════════════════════════')
        : '',
      parameters && parameters.length > 0 ? indent(formatParameters(parameters)) : '',
      chalk.dim('╚═════════════════════════════════════════════\n'),
    ]
      .filter((line) => line.trim() !== '')
      .join('\n');
    blancLogger.log('warn', message);
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    const schemaMessage = [
      chalk.dim('╔═ Schema Build ═════════════════════════════'),
      chalk.green(message),
      chalk.dim('╚═════════════════════════════════════════════\n'),
    ].join('\n');
    blancLogger.log('info', schemaMessage);
  }

  logMigration(message: string, queryRunner?: QueryRunner): void {
    const migrationMessage = [
      chalk.dim('╔═ Database Migration ═════════════════════'),
      chalk.green(message),
      chalk.dim('╚═════════════════════════════════════════════\n'),
    ].join('\n');
    blancLogger.log('info', migrationMessage);
  }

  log(level: 'log' | 'info' | 'warn', message: unknown, queryRunner?: QueryRunner): void {
    const header = chalk.dim(`╔═ TypeORM ${level.toUpperCase()} ═════════════════════`);
    const footer = chalk.dim('╚═════════════════════════════════════════════\n');
    const formattedMessage =
      level === 'warn' ? chalk.yellow(String(message)) : chalk.white(String(message));
    blancLogger.log(level, `${header}\n${formattedMessage}\n${footer}`);
  }
}
