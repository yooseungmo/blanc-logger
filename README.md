# Blanc Logger 

Advanced Winston logger with TypeORM support & structured logging.
> **Blanc Logger**는 NestJS 및 TypeORM 애플리케이션을 위한 고급 로깅 라이브러리입니다.  
> 이 라이브러리는 **Winston**을 기반으로 콘솔 및 파일 로깅을 지원하며,  
> 자동 구조화된 JSON 포맷, SQL 쿼리 하이라이팅, 모듈 기반 로그 추적 등 다양한 기능을 제공합니다.

[![npm version](https://img.shields.io/npm/v/blanc-logger.svg?style=flat&color=red)](https://www.npmjs.com/package/blanc-logger)
[![Node.js](https://img.shields.io/badge/Node.js-%3E=18.x-brightgreen?style=flat&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E=4.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/github/license/yooseungmo/blanc-logger?color=blue)](https://github.com/yooseungmo/blanc-logger/blob/main/LICENSE)


---

## Installation

```sh
npm install blanc-logger
```

---

## Usage

> **1. NestJS 전역 Logger 적용 (`main.ts`)**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { blancLogger, BlancLoggerMiddleware } from 'blanc-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: blancLogger, // 전역 Logger 적용
  });

  app.use(new BlancLoggerMiddleware().use); // 글로벌 미들웨어 적용

  await app.listen(3000);
}
bootstrap();
```

> **2. TypeORM Logger 적용 (`AppModule`)**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmBlancLogger } from 'blanc-logger';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // TypeORM 설정
      logger: new TypeOrmBlancLogger(), // TypeORM Logger 적용
    }),
  ],
})
export class AppModule {}
```

> **3. 모듈별 Custom Logger 적용 (`app.module.ts`)**

```typescript
import { Module } from '@nestjs/common';
import { customBlancLogger } from 'blanc-logger';

@Module({
  providers: [
    {
      provide: 'APP_LOGGER',
      useValue: customBlancLogger,
    },
  ],
})
export class AppModule {}
```

---


## Key Features

| Feature                  | Description                                                             |
|--------------------------|-------------------------------------------------------------------------|
| **Multi-Transport Logging** | - 콘솔 로깅 + Rotation 파일(JSON/Text) 지원<br>- 일정 크기(10MB) 또는 주기마다 새 파일 생성 |
| **Structured Logging**    | - UUIDv5 기반 고유 LogID 생성<br>- 표준 JSON 포맷: `{timestamp, level, message}` |
| **Contextual Tracing** | - 미들웨어 기반 모듈 계층 구조 시각화<br>-`[UserService → AuthModule → Subsystem]` 형식 |
| **Dynamic Log Levels**    | - 실시간 로그 레벨 조정 지원<br>- `debug, verbose, info, warn, error` |

---

## Advanced Features

| Feature                     | Description                                                               |
|--------------------------|-------------------------------------------------------------------------|
| **SQL Syntax Highlighting**      | - SQL 구문 색상 강조 (키워드/값/테이블 구분)<br>- 파라미터 값 컨텍스트 인식 강조          |
| **Query Analysis**            | - 성능 문제 탐지 (`SELECT *` 등)<br>- `JOIN without ON`과 같은 비효율적 쿼리 패턴 감지 |
|**Error Diagnostics**            | - 다중 스택 레이어 추적<br>- 상세 오류 메타데이터 자동 수집                         |
|**Performance Monitoring**      | - 100ms 초과 `Slow Query` 자동 감지<br>- 실행 계획(Explain Plan) 리포트 시각화                          |

---


## Log Output Examples


> **SQL Query Log Example**
```sql
╔═ SQL Query ═════════════════════════════════
    SELECT
        "user"."id" AS "userId",
        "user"."email" AS "userEmail"
    FROM "user" "user"
    WHERE "user"."age" > $1
╠═ Parameters ═══════════════════════════════
    [18]
╠═ Analysis ═════════════════════════════════
    ⚠️ Avoid SELECT * - specify columns explicitly
╚═════════════════════════════════════════════
```

---


> **Console Output Log Example**

<p align="left">
  <img src="https://github.com/user-attachments/assets/78132538-f869-4202-881c-14bce5569f22" alt="blanc-logger-output-log" width="600">
</p>

---

> **Console Error Log Example**

<p align="left">
  <img src="https://github.com/user-attachments/assets/7a93475b-d392-4169-9da2-d203f6f23ba2" alt="blanc-logger-error-log" width="600">
</p>

---


## Configuration

> Blanc Logger는 기본 설정을 제공하지만, 필요에 따라 **사용자 설정**을 적용할 수 있습니다.  
> 설정을 변경하려면 프로젝트에 `logger.config.ts` 파일을 생성하고 아래와 같이 `Override`하세요.

```typescript
export const LOGGING_CONFIG = {
  LOG_DIR: 'logs',            // 로그 저장 경로 (기본: 프로젝트 루트/logs)
  CONSOLE_LOG_LEVEL: 'info',  // 콘솔 출력 레벨 (debug, info, warn, error)
  FILE_LOG_LEVEL: 'error',    // 파일 출력 레벨
  ROTATION_DAYS: '30d',       // 로그 파일 보관 기간
  MAX_FILE_SIZE: '20m'        // 단일 파일 최대 크기
};
```

---
 
## Logging Interceptor Example

> **1. Logging Interceptor 구현 (`logging.interceptor.ts`)**

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { customBlancLogger } from 'blanc-logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = customBlancLogger;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const req = context.switchToHttp().getRequest();
    const moduleName = (req as any).moduleName || 'UnknownModule';

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - startTime;
        const message = `Request processed - ${chalk.yellow(req.method)} ${chalk.green(
          req.url,
        )} ${chalk.magenta(delay + 'ms')}`;
        this.logger.log(message, moduleName);
      }),
    );
  }
}
```

> **2. Global Interceptor 적용 (`app.module.ts`)**

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './commons/interceptors/logging.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // 글로벌 인터셉터 적용
    },
  ],
})
export class AppModule {}
```

---

## License

이 프로젝트는 [MIT License](./LICENSE)에 따라 배포 및 사용이 가능합니다.

---
