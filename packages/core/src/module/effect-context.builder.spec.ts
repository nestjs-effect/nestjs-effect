import { Context, Effect, Layer, ManagedRuntime } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EffectContextBuilder } from "./effect-context.builder";

describe("EffectContextBuilder", () => {
  const stringTag = Context.GenericTag<string>("string");
  const stringLayer = Layer.succeed(stringTag, "test");
  const anotherStringTag = Context.GenericTag<string>("string2");
  const anotherStringLayer = Layer.succeed(anotherStringTag, "test2");

  let discoveryServiceMock: { getProviders: ReturnType<typeof vi.fn> };
  let moduleRefMock: { get: ReturnType<typeof vi.fn> };
  let runtime: ManagedRuntime.ManagedRuntime<unknown, unknown>;

  beforeEach(() => {
    discoveryServiceMock = { getProviders: vi.fn() };
    moduleRefMock = { get: vi.fn() };
  });

  afterEach(async () => {
    if (runtime) {
      await runtime.dispose();
    }
    vi.clearAllMocks();
  });

  it("should resolve services using auto service discovery", async () => {
    discoveryServiceMock.getProviders.mockReturnValue([{ token: stringTag }]);
    moduleRefMock.get.mockReturnValue(stringLayer);

    runtime = new EffectContextBuilder(
      discoveryServiceMock as any,
      moduleRefMock as any,
      { autoServiceDiscovery: true }
    ).runtime as unknown as ManagedRuntime.ManagedRuntime<unknown, unknown>;

    const result = await runtime.runPromise(stringTag);

    expect(result).toBe("test");
    expect(discoveryServiceMock.getProviders).toHaveBeenCalledTimes(1);
    expect(moduleRefMock.get).toHaveBeenCalledTimes(1);
  });

  it("should resolve services using manual service registration", async () => {
    runtime = new EffectContextBuilder(
      discoveryServiceMock as any,
      moduleRefMock as any,
      { autoServiceDiscovery: false, services: [stringLayer] }
    ).runtime as unknown as ManagedRuntime.ManagedRuntime<unknown, unknown>;

    const result = await runtime.runPromise(stringTag);

    expect(result).toBe("test");
    expect(discoveryServiceMock.getProviders).not.toHaveBeenCalled();
    expect(moduleRefMock.get).not.toHaveBeenCalled();
  });

  it("should resolve services using both auto and manual service discovery", async () => {
    discoveryServiceMock.getProviders.mockReturnValue([{ token: stringTag }]);
    moduleRefMock.get.mockReturnValue(stringLayer);

    runtime = new EffectContextBuilder(
      discoveryServiceMock as any,
      moduleRefMock as any,
      { autoServiceDiscovery: true, services: [anotherStringLayer] }
    ).runtime as unknown as ManagedRuntime.ManagedRuntime<unknown, unknown>;

    const result = await runtime.runPromise(
      Effect.gen(function* () {
        const service1 = yield* stringTag;
        const service2 = yield* anotherStringTag;
        return `${service1} ${service2}`;
      })
    );

    expect(result).toBe("test test2");
    expect(discoveryServiceMock.getProviders).toHaveBeenCalledTimes(1);
    expect(moduleRefMock.get).toHaveBeenCalledTimes(1);
  });
});
