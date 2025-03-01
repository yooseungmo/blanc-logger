export interface LoggingConfig {
  LOG_DIR: string; // 로그 파일 저장 디렉토리
  CONSOLE_LOG_LEVEL: string; // 콘솔 로그 레벨
  FILE_LOG_LEVEL: string; // 파일 로그 레벨
  ROTATION_DAYS: string; // 로그 파일 보관 기간
  MAX_FILE_SIZE: string; // 단일 파일 최대 크기
}

export const LOGGING_CONFIG: LoggingConfig = {
  LOG_DIR: 'logs', // 로그 파일 저장 디렉토리 (예: 'logs' 또는 '/var/logs')
  CONSOLE_LOG_LEVEL: 'info', // 콘솔 로그 레벨 (예: 'debug', 'info', 'warn', 'error')
  FILE_LOG_LEVEL: 'error', // 파일 로그 레벨
  ROTATION_DAYS: '30d', // 로그 파일 보관 기간
  MAX_FILE_SIZE: '20m', // 단일 파일 최대 크기
};
