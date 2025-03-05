import * as chalk from 'chalk';
import { Logger, QueryRunner } from 'typeorm';
import * as util from 'util';
import { addQueryAnalysis, formatParameters, indent, sqlHighlighter } from '../helper/sql-formatter';
import { blancLogger } from './blanc-logger';

export class TypeOrmBlancLogger implements Logger {
  /** SQL 쿼리를 포맷팅하여 강조된 문자열을 반환 */
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

  /** SQL 쿼리를 로그에 기록 */
  logQuery(query: string, parameters?: unknown[], queryRunner?: QueryRunner): void {
    const message = this.formatQuery(query, parameters);
    blancLogger.log('info', `[SQL Execute]\n${message}`);
  }

  /** SQL 쿼리 실행 중 발생한 오류를 로그에 기록 */
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

  /** 느린 SQL 쿼리 실행을 경고 로그로 기록 */
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

  /** 스키마 빌드 관련 메시지를 로그에 기록 */
  logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
    const schemaMessage = [
      chalk.dim('╔═ Schema Build ═════════════════════════════'),
      chalk.green(message),
      chalk.dim('╚═════════════════════════════════════════════\n'),
    ].join('\n');
    blancLogger.log('info', schemaMessage);
  }

  /** 데이터베이스 마이그레이션 관련 메시지를 로그에 기록 */
  logMigration(message: string, queryRunner?: QueryRunner): void {
    const migrationMessage = [
      chalk.dim('╔═ Database Migration ═════════════════════'),
      chalk.green(message),
      chalk.dim('╚═════════════════════════════════════════════\n'),
    ].join('\n');
    blancLogger.log('info', migrationMessage);
  }

  /** 지정된 레벨의 일반 로그 메시지를 기록 */
  log(level: 'log' | 'info' | 'warn', message: unknown, queryRunner?: QueryRunner): void {
    const header = chalk.dim(`╔═ TypeORM ${level.toUpperCase()} ═════════════════════`);
    const footer = chalk.dim('╚═════════════════════════════════════════════\n');
    const formattedMessage =
      level === 'warn' ? chalk.yellow(String(message)) : chalk.white(String(message));
    blancLogger.log(level, `${header}\n${formattedMessage}\n${footer}`);
  }
}