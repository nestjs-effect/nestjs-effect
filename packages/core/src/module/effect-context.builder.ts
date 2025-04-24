import { Injectable } from "@nestjs/common";
import { DiscoveryService, ModuleRef } from "@nestjs/core";
import { Context, Layer } from "effect";
import { EffectConfig } from "../config/effect.config";

@Injectable()
export class EffectContextBuilder {
  readonly context: Layer.Layer<any, any, any>;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    private readonly options?: EffectConfig
  ) {
    const allLayers = this.getAllLayers();

    this.context = allLayers.reduce(
      (acc, provider) => Layer.provideMerge(acc, provider),
      Layer.empty as unknown as Layer.Layer<any, any, any>
    );
  }

  private getAllLayers(): Layer.Layer<any, any, any>[] {
    const services = this.options?.services ?? [];

    if (!this.options?.autoServiceDiscovery) {
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
