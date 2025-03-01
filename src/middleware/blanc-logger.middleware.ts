import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

interface RequestWithModuleName extends Request {
  moduleName?: string;
}

@Injectable()
export class BlancLoggerMiddleware implements NestMiddleware {
  use(req: RequestWithModuleName, res: Response, next: NextFunction): void {
    const match = req.url.match(/^\/api\/([^/]+)/);
    req.moduleName = match ? match[1] : 'UnknownModule';

    next();
  }
}
