import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Effect, Either, Layer, pipe } from "effect";
import { map, Observable } from "rxjs";
import { EffectConfig } from "../../config/effect.config";

@Injectable()
export class EffectRuntimeInterceptor implements NestInterceptor {
  constructor(
    @Inject("EFFECT_CONTEXT")
    private readonly effectContext: Layer.Layer<any>,
    @Inject("EFFECT_OPTIONS")
    private readonly effectOptions: EffectConfig
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> {
    return next.handle().pipe(
      map((value) => {
        if (!this.isEffect(value)) {
          return value;
        }

        return pipe(
          this.mapEffect(value) as Effect.Effect<any, any, never>,
          Effect.provide(this.effectContext),
          Effect.runPromise
        );
      })
    );
  }

  private mapEffect(
    effect: Effect.Effect<unknown, unknown, never>
  ): Effect.Effect<any, any, never> {
    return Effect.gen(this, function* () {
      const value = yield* Effect.either(effect);

      if (Either.isRight(value)) {
        return this.effectOptions.mapValue
          ? this.effectOptions.mapValue(value.right)
          : value.right;
      }

      const errorMapping = this.effectOptions.mapError
        ? this.effectOptions.mapError(value.left)
        : Either.left(value.left);

      if (Either.isRight(errorMapping)) {
        return errorMapping.right;
      }

      yield* Effect.fail(errorMapping.left);
    });
  }

  private isEffect(
    value: any
  ): value is Effect.Effect<unknown, unknown, never> {
    return Effect.isEffect(value);
  }
}
