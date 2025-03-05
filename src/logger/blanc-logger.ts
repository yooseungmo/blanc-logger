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

/** util.inspect의 사전 정의된 옵션을 사용하여 객체를 문자열로 포맷팅 */
const deepInspector = (obj: unknown): string =>
  util.inspect(obj, {
    colors: true,
    depth: MAX_OBJECT_DEPTH,
    breakLength: MAX_OBJECT_WIDTH,
    compact: false,
    sorted: true,
  });

/** 로그 레벨에 해당하는 이모지를 매핑 */
const emojiMap: Record<string, string> = {
  error: '🚨',
  warn: '⚠️',
  info: '🍀',
  verbose: '📢',
  debug: '🐛',
};

/** 로그 레벨에 해당하는 chalk 색상 함수를 매핑 */
const levelColorMap: Record<string, (text: string) => string> = {
  error: chalk.hex('#FF6B6B'),
  warn: chalk.hex('#FFD93D'),
  info: chalk.hex('#845EC2'),
  debug: chalk.hex('#4D96FF'),
  verbose: chalk.hex('#6BCB77'),
};

/** 모듈 경로를 색상이 적용된 계층적 문자열로 변환 */
const moduleHierarchyTransform = (info: CustomTransformableInfo): CustomTransformableInfo => {
  info.moduleName =
    info.moduleName?.split('/')?.map((part: string) => chalk.cyan(part))?.join(chalk.dim(' → ')) ??
    info.moduleName;
  return info;
};

/** 파일 로그에 대한 타임스탬프와 JSON 포맷을 결합 */
const fileLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.json()
);

/** 로그 파일 순환을 위한 DailyRotateFile 전송 객체를 생성 */
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

/** 로그 메타데이터에 고유한 logId가 없으면 추가 */
const addMetaDataTransform = (info: CustomTransformableInfo): CustomTransformableInfo => {
  info.logId ??= generateUUID();
  return info;
};

/** 제공된 moduleName 또는 context 속성을 사용하여 모듈 이름을 포맷팅 */
const formatModuleName = (info: CustomTransformableInfo): string => {
  const moduleName =
    info.moduleName ?? (typeof info.context === 'object' ? info.context?.moduleName : info.context);
  return moduleName ? `[${moduleName}]` : '';
};

/** 로그 메시지를 포맷팅하며, 객체인 경우 deepInspector를 사용하여 포맷팅 */
const formatMessage = (info: CustomTransformableInfo): string => {
  const message = info.stack || info.message;
  return typeof message === 'object' ? deepInspector(message) : String(message);
};

/** 이모지를 추가하고 대문자로 변환하여 로그 레벨을 변환 */
const transformLogLevel = (info: CustomTransformableInfo): CustomTransformableInfo => {
  info.rawLevel = info.level;
  info.level = `${emojiMap[info.level] || ''} ${info.level.toUpperCase()}`.padEnd(5);
  return info;
};

/** 다양한 포맷팅 함수를 결합하여 최종 콘솔 로그 포맷을 생성 */
const customConsoleFormat = winston.format.combine(
  winston.format(addMetaDataTransform)(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format(moduleHierarchyTransform)(),
  winston.format(transformLogLevel)(),
  winston.format.printf((info: CustomTransformableInfo): string => {
    const colorFunc =
      levelColorMap[info.rawLevel ?? ''] || ((text: string): string => chalk.bold.white(text));
    const coloredLevel = colorFunc(info.level);
    const simpleLogId = info.logId ? chalk.hex('#00008B')(`[${info.logId.substring(0, 8)}]`) : '';
    const moduleStr = formatModuleName(info);
    const messageStr = formatMessage(info);
    return `${simpleLogId} ${chalk.dim(info.timestamp)} ${coloredLevel} ${moduleStr} - ${chalk.blueBright(
      messageStr
    )}`;
  })
);

/** 구성된 전송 및 포맷을 사용하여 WinstonModule로 blancLogger를 생성 */
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