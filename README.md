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

### 1. NestJS 전역 Logger 적용 (`main.ts`)

> _**Blanc Logger를 전역 로거**로 적용하면, 애플리케이션 전체에서 **동일한 로깅 설정**을 사용할 수 있습니다._

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { blancLogger, BlancLoggerMiddleware } from 'blanc-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: blancLogger, // 전역 Logger 적용
  });

  // 미들웨어를 적용하여 요청 시 모듈명 등 컨텍스트 정보를 추가
  app.use(new BlancLoggerMiddleware().use); 

  await app.listen(3000);
}
bootstrap();
```

### 2. TypeORM Logger 적용 (`AppModule`)

> _TypeORM 설정에서 Blanc Logger의 전용 로거를 사용하여, **SQL 쿼리 및 데이터베이스 관련 로그**를 효과적으로 기록할 수 있습니다._
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmBlancLogger } from 'blanc-logger';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ... DB 설정
      logging: true,
      logger: new TypeOrmBlancLogger(), // TypeORM용 로거 사용
    }),
    // 다른 모듈들...
  ],
})
export class AppModule {}
```

## 기존 Logger 대체 방법

> _Blanc Logger를 사용하여 기존의 NestJS 내장 로거를 대체할 수 있습니다._    

### 1. 기존 코드

```typescript
// 기존 NestJS 내장 로거 사용:
this.logger.error('Error message', error.stack);
this.logger.log('Log message');
```

### 2. Blanc Logger 사용

```typescript
// 에러 발생 시, 스택 정보와 함께 기록
blancLogger.error('Error message', { moduleName: 'ModuleName', stack: error.stack });
blancLogger.log('Log message', { moduleName: 'ModuleName' });
blancLogger.warn('Warn message', { moduleName: 'ModuleName' });
blancLogger.verbose('Verbose message', { moduleName: 'ModuleName' });
blancLogger.debug('Debug message', { moduleName: 'ModuleName' });
```

### 3. Logs 파일

> **로그 파일이 자동으로 날짜별로 생성되어 logs 폴더 아래에 다음과 같이 쌓입니다.**

```bash
logs/
├── combined-2025-03-03.log   # 모든 로그 메시지
├── error-2025-03-03.log      # error 레벨 로그
├── exceptions-2025-03-03.log # 처리되지 않은 예외 로그
└── rejections-2025-03-03.log # 미처리된 Promise 거부 로그
```

> **예시 로그 (error-2025-03-03.log 파일):**
```json
{"level":"error","message":"HTTP Exception: DUPLICATION","stack":[{"moduleName":"user","path":"/api/user/profile","stack":"ConflictException: DUPLICATION\n    at UserService.getProfile (/path/to/src/user/user.service.ts:60:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)"}],"timestamp":"2025-03-03 14:29:51"}
```
---

## Overview

| Feature                                    | Description                                                             |
|--------------------------------------------|-------------------------------------------------------------------------|
| **다중 전송 로깅 (Multi-Transport Logging)** | - 콘솔 출력과 파일 저장을 동시에 지원<br>- 일정 크기(예: 20MB) 또는 일정 주기(예: 15일)에 따라 자동으로 로그 파일 회전<br>- 로그 파일 예시: `combined-YYYY-MM-DD.log`, `error-YYYY-MM-DD.log`, `exceptions-YYYY-MM-DD.log`, `rejections-YYYY-MM-DD.log`|
| **구조화된 로그 출력 (Structured Logging)** | - UUIDv5를 사용해 고유 LogID 생성<br>- `{timestamp, level, message}` 형식의 표준 JSON 포맷으로 출력되어 외부 시스템 연동 용이 |
| **모듈별 컨텍스트 추적 (Contextual Tracing)** | - `BlancLoggerMiddleware`를 활용하여 HTTP 요청에서 모듈명 자동 추출<br>- `[UserService → AuthModule → Subsystem]`과 같이 계층 구조로 표시 |
| **동적 로그 레벨 관리 (Dynamic Log Levels)** | - 개발 및 운영 환경에 따라 `debug, verbose, info, warn, error` 로그 레벨을 실시간으로 조절 가능<br>- 필요한 정보만 선별 기록하여 로그의 가독성과 관리 효율성을 향상 |
| **SQL 구문 하이라이팅 (SQL Syntax Highlighting)** | - SQL 쿼리의 키워드, 값, 테이블명을 색상 강조 및 들여쓰기로 구분<br>- 파라미터 값 컨텍스트 인식 강조 |
| **쿼리 성능 분석 (Query Analysis)** | - SQL 성능 저하 유발 패턴 자동 감지 (`SELECT *`, `JOIN 조건 누락` 등) |
| **에러 진단 및 스택 추적 (Error Diagnostics)** | - 에러 발생 시 다중 스택 레이어와 추가 메타데이터를 포함하여 상세한 에러 로그 기록 |
| **성능 모니터링 (Performance Monitoring)** | - HTTP 요청 처리 시간 및 `Slow Query`(예: 100ms) 경고 로그 생성<br>- 실행 계획(Explain Plan) 리포트 시각화  |
| **커스터마이징 (Customization)** | - `logger-config.yaml`파일을 통해 로그 저장 경로, 로그 레벨, 파일 크기, 회전 주기 등을 쉽게 조정 가능 |

---

## Configuration

> Blanc Logger는 기본 설정을 제공하지만, 필요에 따라 **사용자 환경**에 맞게 커스터마이징 할 수 있습니다.  
> 설정을 변경하려면 `프로젝트 루트`에 `logger-config.yaml` 파일을 생성하고 아래와 같이 `Override`할 수 있습니다.

```yaml
LOG_DIR: logs            # 로그 파일 저장 경로 (기본: 프로젝트 루트/logs)
CONSOLE_LOG_LEVEL: info  # 콘솔 출력 로그 레벨 (debug, info, warn, error)
FILE_LOG_LEVEL: error    # 파일 출력 로그 레벨
ROTATION_DAYS: 30d       # 로그 파일 보관 기간 (예: 30일)
MAX_FILE_SIZE: 20m       # 단일 파일 최대 크기 (예: 20MB)

```
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
 
## Using Examples

### 1. Logging Interceptor 구현


>_**HTTP 요청 처리 시간을 측정**하여 로그로 기록하는 인터셉터 예제입니다._     
>_**BlancLoggerMiddleware**를 통해 설정된 모듈명 정보가 자동으로 포함됩니다._    

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import * as chalk from 'chalk';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const req = context.switchToHttp().getRequest();
    const decodedUrl = decodeURIComponent(req.url);
    const moduleName = (req as any).moduleName || 'UnknownModule';

    return next.handle().pipe(
      tap(() => {
        const delay = Date.now() - startTime;
        const delayStr =
          delay > 100 ? chalk.bold.red(`${delay}ms 🚨`) : chalk.magenta(`${delay}ms`);
        const message = `Request processed: ${chalk.yellow(req.method)} ${chalk.green(
          decodedUrl,
        )} ${delayStr}`;
        blancLogger.log(message, moduleName);
      }),
    );
  }
}
```

> **전역 인터셉터로 적용하려면 AppModule에 아래와 같이 등록합니다**

```typescript
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './commons/interceptors/logging.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // 전역 인터셉터로 등록
    },
  ],
})
export class AppModule {}
```

> **Console Output Log Example**         
> _(응답 시간 초과 시 (예: 100ms)강조)_

<p align="left">
  <img src="https://github.com/user-attachments/assets/315ac55c-7f06-44b6-a4bb-66a465186dd3" alt="blanc-logger-output-log" width="600">
</p>

---

### 2. Global Exception Filter 구현


>_**Blanc Logger를 사용하여 예외 발생 시 상세한 에러 정보를 로그로 기록하는 전역 익셉션 필터 예제입니다.**_     
>_**BlancLoggerMiddleware**를 통해 설정된 모듈명 정보가 자동으로 포함됩니다._    

```typescript
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { blancLogger } from 'blanc-logger';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const moduleName = (request as any).moduleName || 'Global';

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resObj = exception.getResponse();
      message =
        typeof resObj === 'object' && resObj !== null
          ? (resObj as any).message || exception.message
          : exception.message;
      blancLogger.error(`HTTP Exception: ${message}`, {
        moduleName,
        path: request.url,
        stack: exception instanceof Error ? exception.stack : '',
      });
    } else if (exception instanceof Error) {
      status = new InternalServerErrorException().getStatus();
      message = 'Internal Server Error';
      blancLogger.error(`Unhandled exception: ${exception.message}`, {
        moduleName,
        path: request.url,
        stack: exception.stack,
      });
    } else {
      status = 500;
      message = 'Unknown error';
      blancLogger.error(`Unknown exception: ${JSON.stringify(exception)}`, {
        moduleName,
        path: request.url,
      });
    }

    response.status(status).json({
      statusCode: status,
      status: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

> **전역 필터로 적용하려면 AppModule에 아래와 같이 등록합니다**

```typescript
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './commons/filters/global-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter, // 전역 필터로 등록
    },
  ],
})
export class AppModule {}
```

> **전역 익셉션 필터를 적용한 후, 다음과 같이 예외를 던질 경우**
```typescript
throw new ConflictException('DUPLICATION');
```

> **Console Output Log Example**
<p align="left">
  <img src="https://github.com/user-attachments/assets/ac4dc526-bf24-4caf-b598-b83274d43eac" alt="blanc-logger-output-log" width="600">
</p>

> **또한, 동일하게 로그 파일도 생성됩니다.**

```json
{"level":"error","message":"HTTP Exception: DUPLICATION","stack":[{"moduleName":"user","path":"/api/user/profile","stack":"ConflictException: DUPLICATION\n    at UserService.getProfile (/path/to/src/user/user.service.ts:60:13)\n    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)"}],"timestamp":"2025-03-03 14:29:51"}
```
---


## License

이 프로젝트는 [MIT License](./LICENSE)에 따라 배포 및 사용이 가능합니다.

---
