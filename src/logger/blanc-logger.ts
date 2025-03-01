// blanc-logger.ts
import * as chalk from 'chalk';
import { WinstonModule } from 'nest-winston';
import * as util from 'util';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { generateUUID } from '../helper/uuid';
import { LOGGING_CONFIG } from './logger.config';

const { LOG_DIR, CONSOLE_LOG_LEVEL, FILE_LOG_LEVEL, ROTATION_DAYS, MAX_FILE_SIZE } = LOGGING_CONFIG;

const MAX_OBJECT_DEPTH = 5;
const MAX_OBJECT_WIDTH = 120;

export interface CustomTransformableInfo extends winston.Logform.TransformableInfo {
  rawLevel?: string;
  logId?: string;
  requestId?: string;
  moduleName?: string;
  context?: { moduleName?: string } | string;
}

const deepInspector = (obj: unknown): string =>
  util.inspect(obj, {
    colors: true,
    depth: MAX_OBJECT_DEPTH,
    breakLength: MAX_OBJECT_WIDTH,
    compact: false,
    sorted: true,
  });

const emojiMap: Record<string, string> = {
  error: '🚨',
  warn: '⚠️',
  info: '🍀',
  verbose: '📢',
  debug: '🐛',
};

const levelColorMap: Record<string, (text: string) => string> = {
  error: chalk.hex('#FF6B6B'),
  warn: chalk.hex('#FFD93D'),
  info: chalk.hex('#845EC2'),
  debug: chalk.hex('#4D96FF'),
  verbose: chalk.hex('#6BCB77'),
};

const moduleHierarchyFormat = winston.format(
  (info: CustomTransformableInfo): CustomTransformableInfo => {
    if (typeof info.moduleName === 'string') {
      info.moduleName = info.moduleName
        .split('/')
        .map((part: string) => chalk.cyan(part))
        .join(chalk.dim(' → '));
    }
    return info;
  },
);

const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json(),
);

const createDailyRotateFileTransport = (filename: string, level: string): DailyRotateFile =>
  new DailyRotateFile({
    dirname: LOG_DIR,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    level,
    zippedArchive: true,
    maxSize: MAX_FILE_SIZE,
    maxFiles: ROTATION_DAYS,
    format: fileLogFormat,
  });

const addMetaData = winston.format((info: CustomTransformableInfo): CustomTransformableInfo => {
  if (!info.logId) {
    info.logId = generateUUID();
  }
  return info;
});

const customConsoleFormat = winston.format.combine(
  addMetaData(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  moduleHierarchyFormat(),
  winston.format((info: CustomTransformableInfo): CustomTransformableInfo => {
    info.rawLevel = info.level;
    info.level = `${emojiMap[info.level] || ''} ${info.level.toUpperCase()}`.padEnd(5);
    return info;
  })(),
  winston.format.printf((info: CustomTransformableInfo): string => {
    const colorFunc =
      levelColorMap[info.rawLevel ?? ''] || ((text: string): string => chalk.bold.white(text));
    const coloredLevel = colorFunc(info.level);
    const simpleLogId = info.logId ? chalk.hex('#00008B')(`[${info.logId.substring(0, 8)}]`) : '';
    let moduleName: string | undefined;
    if (!info.moduleName && info.context) {
      if (
        typeof info.context === 'object' &&
        info.context !== null &&
        'moduleName' in info.context
      ) {
        moduleName = (info.context as { moduleName?: string }).moduleName;
      } else if (typeof info.context === 'string') {
        moduleName = info.context;
      }
    } else {
      moduleName = info.moduleName;
    }
    const moduleStr = moduleName ? `[${moduleName}]` : '';
    let message: unknown = info.stack || info.message;
    if (typeof message === 'object') {
      message = deepInspector(message);
    }
    return `${simpleLogId} ${chalk.dim(
      info.timestamp,
    )} ${coloredLevel} ${moduleStr} - ${chalk.blueBright(message as string)}`;
  }),
);

export const blancLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: CONSOLE_LOG_LEVEL,
      format: customConsoleFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
    createDailyRotateFileTransport('error', 'error'),
    createDailyRotateFileTransport('combined', FILE_LOG_LEVEL),
  ],
  exceptionHandlers: [createDailyRotateFileTransport('exceptions', 'error')],
  rejectionHandlers: [createDailyRotateFileTransport('rejections', 'error')],
});
