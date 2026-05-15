import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import * as xss from 'xss';

@Injectable()
export class XssValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Only sanitize bodies/queries/params
    if (
      metadata.type !== 'body' &&
      metadata.type !== 'query' &&
      metadata.type !== 'param'
    ) {
      return value;
    }

    return this.sanitize(value);
  }

  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return xss.filterXSS(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (obj !== null && typeof obj === 'object') {
      // Create a clean object to avoid prototype pollution
      const cleanObj: Record<string, any> = {};
      for (const [key, val] of Object.entries(obj)) {
        cleanObj[key] = this.sanitize(val);
      }
      return cleanObj;
    }

    // Numbers, booleans, etc. pass through unchanged
    return obj;
  }
}
