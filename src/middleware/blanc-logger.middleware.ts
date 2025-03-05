import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

/** Request 인터페이스를 확장하여 모듈 이름을 포함 */
interface RequestWithModuleName extends Request {
  moduleName?: string;
}

@Injectable()
export class BlancLoggerMiddleware implements NestMiddleware {
  /** 요청 URL에서 모듈 이름을 추출하여 request 객체에 추가한 후 다음 미들웨어로 전달 */
  use(req: RequestWithModuleName, res: Response, next: NextFunction): void {
    const match = req.url.match(/^\/api\/([^/]+)/);
    req.moduleName = match ? match[1] : 'UnknownModule';
    next();
  }
}