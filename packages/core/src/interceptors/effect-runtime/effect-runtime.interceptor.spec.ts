import {
  Context,
  Effect,
  Either,
  Layer,
  ManagedRuntime,
  Runtime,
} from "effect";
import { of } from "rxjs";
import { describe, expect, it } from "vitest";
import { EffectRuntimeInterceptor } from "./effect-runtime.interceptor";

const randomTag = Context.GenericTag<number>("randomTag");
const randomLayer = Layer.succeed(randomTag, 1);

const pureEffect = Effect.succeed(1);

const effect = Effect.gen(function* () {
  const random = yield* randomTag;

  return random;
});

const emptyRuntime = ManagedRuntime.make(Layer.empty);

const fullRuntime = ManagedRuntime.make(randomLayer);

describe("EffectRuntimeInterceptor", () => {
  describe("run", () => {
    it("should run effect", () => {
      const interceptor = new EffectRuntimeInterceptor(emptyRuntime, {});

      const obs = interceptor
        .intercept({} as any, {
          handle: () => of(pureEffect),
        })
        .subscribe(async (value: Promise<number>) => {
          const result = await value;

          expect(result).toBe(1);

          return result;
        });

      expect(obs.closed).toBeTruthy();
    });

    it("should run effect with context", () => {
      const interceptor = new EffectRuntimeInterceptor(fullRuntime, {});

      const obs = interceptor
        .intercept({} as any, {
          handle: () => of(effect),
        })
        .subscribe(async (value: Promise<number>) => {
          const result = await value;

          expect(result).toBe(1);
        });

      expect(obs.closed).toBeTruthy();
    });
  });

  describe("map", () => {
    it("should map effect value", () => {
      const interceptor = new EffectRuntimeInterceptor(emptyRuntime, {
        runtime: {
          mapValue: (value) => value + 1,
        },
      });

      const obs = interceptor
        .intercept({} as any, {
          handle: () => of(pureEffect),
        })
        .subscribe(async (value: Promise<number>) => {
          const result = await value;

          expect(result).toBe(2);
        });

      expect(obs.closed).toBeTruthy();
    });

    it("should fallback with right mapError", () => {
      const interceptor = new EffectRuntimeInterceptor(emptyRuntime, {
        runtime: {
          mapError: (error) => Either.right(error + 1),
        },
      });

      const obs = interceptor
        .intercept({} as any, {
          handle: () => of(Effect.fail(1)),
        })
        .subscribe(async (value: Promise<number>) => {
          const result = await value;

          expect(result).toBe(2);
        });

      expect(obs.closed).toBeTruthy();
    });

    it("should throw with left mapError", () => {
      const interceptor = new EffectRuntimeInterceptor(emptyRuntime, {
        runtime: {
          mapError: (error) => Either.left("error"),
        },
      });

      const obs = interceptor
        .intercept({} as any, {
          handle: () => of(Effect.fail(1)),
        })
        .subscribe(async (value: Promise<number>) => {
          try {
            await value;
          } catch (error) {
            expect(Runtime.isFiberFailure(error)).toBeTruthy();
            expect((error as Runtime.FiberFailure).message).toBe("error");
          }
        });

      expect(obs.closed).toBeTruthy();
    });
  });
});
