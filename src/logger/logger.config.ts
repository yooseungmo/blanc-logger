import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export interface LoggingConfig {
  LOG_DIR: string;           // 로그 파일 저장 경로 (기본: 프로젝트 루트/logs)
  CONSOLE_LOG_LEVEL: string; // 콘솔 출력 로그 레벨 (debug, verbose, info, warn, error)
  FILE_LOG_LEVEL: string;    // 파일 출력 로그 레벨 (debug, verbose, info, warn, error)
  ROTATION_DAYS: string;     // 로그 파일 보관 기간 (예: 30일)
  MAX_FILE_SIZE: string;     // 단일 파일 최대 크기 (예: 20MB)
}

/** 기본 로그 설정값을 정의 */
const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  LOG_DIR: 'logs',
  CONSOLE_LOG_LEVEL: 'info',
  FILE_LOG_LEVEL: 'error',
  ROTATION_DAYS: '30d',
  MAX_FILE_SIZE: '20m',
};

/** 지정된 YAML 파일에서 사용자 로그 설정을 로드하여 부분 설정 객체를 반환 */
function loadUserConfig(configFileName: string = 'logger-config.yaml'): Partial<LoggingConfig> {
  const configPath = path.resolve(process.cwd(), configFileName);
  if (!fs.existsSync(configPath)) return {};
  const fileContents = fs.readFileSync(configPath, 'utf8');
  return yaml.load(fileContents) as Partial<LoggingConfig>;
}

/** 기본 설정과 사용자 설정을 병합하여 최종 로그 설정을 생성 */
export let LOGGING_CONFIG: LoggingConfig = {
  ...DEFAULT_LOGGING_CONFIG,
  ...loadUserConfig(),
};

/** 전달받은 사용자 설정과 기본 설정을 병합하여 로그 설정을 업데이트 */
export function setLoggingConfig(userConfig: Partial<LoggingConfig>): void {
  LOGGING_CONFIG = { ...DEFAULT_LOGGING_CONFIG, ...userConfig };
}