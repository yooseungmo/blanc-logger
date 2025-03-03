import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface LoggingConfig {
  LOG_DIR: string; // 로그 파일 저장 디렉토리
  CONSOLE_LOG_LEVEL: string; // 콘솔 로그 레벨
  FILE_LOG_LEVEL: string; // 파일 로그 레벨
  ROTATION_DAYS: string; // 로그 파일 보관 기간
  MAX_FILE_SIZE: string; // 단일 파일 최대 크기
}

const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  LOG_DIR: 'logs',
  CONSOLE_LOG_LEVEL: 'info',
  FILE_LOG_LEVEL: 'error',
  ROTATION_DAYS: '30d',
  MAX_FILE_SIZE: '20m',
};

function loadUserConfig(configFileName: string = 'logger-config.yaml'): Partial<LoggingConfig> {
  const configPath = path.resolve(process.cwd(), configFileName);
  if (!fs.existsSync(configPath)) return {};
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents) as Partial<LoggingConfig>;
}

export let LOGGING_CONFIG: LoggingConfig = {
  ...DEFAULT_LOGGING_CONFIG,
  ...loadUserConfig(),
};

export function setLoggingConfig(userConfig: Partial<LoggingConfig>): void {
  LOGGING_CONFIG = { ...DEFAULT_LOGGING_CONFIG, ...userConfig };
}