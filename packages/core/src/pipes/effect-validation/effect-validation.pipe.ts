import {
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Injectable,
  PipeTransform,
} from "@nestjs/common";
import { Either, Schema } from "effect";
import { EffectConfig } from "../../shared/config/effect.config";
import { EFFECT_CONFIG } from "../../shared/token/effect.token";

@Injectable()
export class EffectValidationPipe implements PipeTransform {
  constructor(
    @Inject(EFFECT_CONFIG)
    private readonly effectConfig?: EffectConfig
  ) {}

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
    if (!this.effectConfig?.validation?.strict) {
      return value;
    }

    this.throwValidationError();
  }

  private throwValidationError(error?: any): void {
    if (this.effectConfig?.validation?.customError) {
      throw new this.effectConfig.validation.customError(error);
    }

    throw new BadRequestException("Validation failed");
  }
}
