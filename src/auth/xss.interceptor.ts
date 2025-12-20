import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as xss from 'xss';

@Injectable()
export class XssInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // 1. Lọc Body
    if (request.body) {
      this.cleanObject(request.body);
    }
    // 2. Lọc Query Params
    if (request.query) {
      this.cleanObject(request.query);
    }
    // 3. Lọc Params
    if (request.params) {
      this.cleanObject(request.params);
    }
    return next.handle();
  }

  private cleanObject(obj: any): any {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss.filterXSS(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.cleanObject(obj[key]);
      }
    }
    return obj;
  }
}