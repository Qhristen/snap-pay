import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body) this.sanitizeInPlace(req.body);
    if (req.query) this.sanitizeInPlace(req.query);
    if (req.params) this.sanitizeInPlace(req.params);
    next();
  }

  private sanitizeInPlace(data: any): void {
    if (typeof data !== 'object' || data === null) return;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];

        if (typeof value === 'string') {
          data[key] = this.sanitizeString(value);
        } else if (Array.isArray(value)) {
          data[key] = value.map(item => 
            typeof item === 'string' ? this.sanitizeString(item) : item
          );
        } else if (typeof value === 'object' && value !== null) {
          this.sanitizeInPlace(value);
        }
      }
    }
  }

  private sanitizeString(str: string): string {
    // Basic XSS protection: escape < > " ' &
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
