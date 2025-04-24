import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Effect, Either, ManagedRuntime, pipe } from "effect";
import { map, Observable } from "rxjs";
import { EffectConfig } from "../../config/effect.config";
import { EFFECT_CONFIG, EFFECT_RUNTIME } from "../../shared/token/effect.token";

@Injectable()
export class EffectRuntimeInterceptor implements NestInterceptor {
  constructor(
    @Inject(EFFECT_RUNTIME)
    private readonly runtime: ManagedRuntime.ManagedRuntime<never, never>,
    @Inject(EFFECT_CONFIG)
    private readonly effectConfig: EffectConfig
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
          this.runtime.runPromise
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
        return this.effectConfig.mapValue
          ? this.effectConfig.mapValue(value.right)
          : value.right;
      }

      const errorMapping = this.effectConfig.mapError
        ? this.effectConfig.mapError(value.left)
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
