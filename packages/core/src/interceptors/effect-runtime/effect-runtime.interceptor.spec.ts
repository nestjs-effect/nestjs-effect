import { Context, Effect, Layer, ManagedRuntime } from "effect";
import { of } from "rxjs";
import { describe, expect, it } from "vitest";
import { EffectRuntimeInterceptor } from "./effect-runtime.interceptor";

class Random extends Context.Tag("Random")<
  Random,
  { readonly next: Effect.Effect<number> }
>() {}

const RandomTest = Layer.succeed(Random, {
  next: Effect.succeed(1),
});

const pureEffect = Effect.succeed(1);

const effect = Effect.gen(function* () {
  const random = yield* Random;

  return yield* random.next;
});

const emptyRuntime = ManagedRuntime.make(Layer.empty);

const fullRuntime = ManagedRuntime.make(
  Layer.empty.pipe(Layer.provideMerge(RandomTest))
);

describe("EffectRuntimeInterceptor", () => {
  describe("run", () => {
    it("should run effect", () => {
      const interceptor = new EffectRuntimeInterceptor(emptyRuntime, {});
      interceptor
        .intercept({} as any, {
          handle: () => of(pureEffect),
        })
        .subscribe(async (value: Promise<number>) => {
          const result = await value;

          expect(result).toBe(1);
        });
    });

    it("should run effect with context", () => {
      const interceptor = new EffectRuntimeInterceptor(fullRuntime, {});

      interceptor
        .intercept({} as any, {
          handle: () => of(effect),
        })
        .subscribe(async (value: Promise<number>) => {
          const result = await value;

          expect(result).toBe(1);
        });
    });
  });

  describe("map", () => {
    it.todo("should map effect value", () => {});
    it.todo("should map effect error", () => {});
  });
});
