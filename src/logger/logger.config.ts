export interface LoggingConfig {
  LOG_DIR: string; // 로그 파일 저장 디렉토리
  CONSOLE_LOG_LEVEL: string; // 콘솔 로그 레벨
  FILE_LOG_LEVEL: string; // 파일 로그 레벨
  ROTATION_DAYS: string; // 로그 파일 보관 기간
  MAX_FILE_SIZE: string; // 단일 파일 최대 크기
}

const defaultLoggingConfig: LoggingConfig = {
  LOG_DIR: 'logs', // 기본 로그 파일 저장 디렉토리
  CONSOLE_LOG_LEVEL: 'info', // 기본 콘솔 로그 레벨
  FILE_LOG_LEVEL: 'error', // 기본 파일 로그 레벨
  ROTATION_DAYS: '30d', // 기본 로그 파일 보관 기간
  MAX_FILE_SIZE: '20m', // 기본 단일 파일 최대 크기
};

export let LOGGING_CONFIG: LoggingConfig = { ...defaultLoggingConfig };

// 유저가 원하는 값으로 오버라이드
export function setLoggingConfig(userConfig: Partial<LoggingConfig>): void {
  LOGGING_CONFIG = { ...defaultLoggingConfig, ...userConfig };
}