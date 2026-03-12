import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AppValidationPipe implements PipeTransform {
  transform(value: unknown): unknown {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      return value;
    }

    return this.validatePlainObject(value as Record<string, unknown>);
  }

  private validatePlainObject(payload: Record<string, unknown>): Record<string, unknown> {
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined) {
        delete payload[key];
        continue;
      }

      if (typeof value === 'number' && !Number.isFinite(value)) {
        throw new BadRequestException(`Field ${key} contains invalid number`);
      }

      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'number' && !Number.isFinite(item)) {
            throw new BadRequestException(`Field ${key}[${index}] contains invalid number`);
          }
        });
      }
    }

    return payload;
  }
}