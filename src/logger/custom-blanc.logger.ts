import { LoggerService } from '@nestjs/common';
import { blancLogger } from './blanc-logger';

/** Nest의 LoggerService를 대체하여 blancLogger를 통해 로그를 기록하는 커스텀 로거 */
export const customBlancLogger: LoggerService = {
  log: (message: unknown, context?: string): void =>
    blancLogger.log('info', message, { moduleName: context }),
  error: (message: unknown, trace?: string, context?: string): void =>
    blancLogger.error('error', message, { moduleName: context, stack: trace }),
  warn: (message: unknown, context?: string): void =>
    blancLogger.log('warn', message, { moduleName: context }),
  debug: (message: unknown, context?: string): void =>
    blancLogger.log('debug', message, { moduleName: context }),
  verbose: (message: unknown, context?: string): void =>
    blancLogger.log('verbose', message, { moduleName: context }),
};
