import { Injectable } from "@nestjs/common";
import { DiscoveryService, ModuleRef } from "@nestjs/core";
import { Context, Layer, ManagedRuntime } from "effect";
import { EffectModuleConfig } from "../shared/config/effect-module.config";

@Injectable()
export class EffectContextBuilder {
  readonly runtime: ManagedRuntime.ManagedRuntime<never, never>;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    private readonly moduleConfig?: EffectModuleConfig
  ) {
    const allLayers = this.getAllLayers();

    const appLayer = allLayers.reduce(
      (acc, provider) => Layer.provideMerge(acc, provider),
      Layer.empty as unknown as Layer.Layer<any, any, any>
    );

    this.runtime = ManagedRuntime.make(
      appLayer as unknown as Layer.Layer<never, never, never>
    );
  }

  private getAllLayers(): Layer.Layer<any, any, any>[] {
    const services = this.moduleConfig?.services ?? [];

    if (!this.moduleConfig?.autoServiceDiscovery) {
      return services;
    }

    const discoveredProviders: Layer.Layer<any, any, any>[] =
      this.discoveryService
        .getProviders()
        .filter((provider) => Context.isTag(provider.token))
        .map((provider) =>
          this.moduleRef.get(provider.token, { strict: false })
        );

    return [...discoveredProviders, ...services];
  }
}
