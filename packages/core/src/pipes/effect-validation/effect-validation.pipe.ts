import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { Either, Schema } from "effect";
import { EffectValidationPipeConfig } from "./effect-validation.config";

@Injectable()
export class EffectValidationPipe implements PipeTransform {
  constructor(private config?: EffectValidationPipeConfig) {}

  transform(value: unknown, metadata: ArgumentMetadata): any {
    if (Schema.isSchema(metadata.metatype)) {
      return this.validateWithSchema(value, metadata.metatype);
    }

    return this.handleNonSchemaValue(value);
  }

  private validateWithSchema(value: unknown, schema: any): any {
    const result = Schema.decodeUnknownEither(schema)(value);

    if (Either.isRight(result)) {
      return result.right;
    }

    this.throwValidationError(result.left);
  }

  private handleNonSchemaValue(value: unknown): any {
    if (!this.config?.strict) {
      return value;
    }

    this.throwValidationError();
  }

  private throwValidationError(error?: any): void {
    if (this.config?.customError) {
      throw new this.config.customError(error);
    }

    throw new BadRequestException("Validation failed");
  }
}
