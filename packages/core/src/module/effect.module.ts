import { DynamicModule, Module, Provider } from "@nestjs/common";
import { DiscoveryModule, DiscoveryService, ModuleRef } from "@nestjs/core";
import {
  EffectConfig,
  EffectFeatureConfig,
  EffectRootConfig,
} from "../config/effect.config";
import { EFFECT_CONFIG, EFFECT_RUNTIME } from "../shared/token/effect.token";
import { EffectContextBuilder } from "./effect-context.builder";

@Module({
  imports: [DiscoveryModule],
})
export class EffectModule {
  static forRoot(options: EffectRootConfig = {}): DynamicModule {
    const effectContext: Provider = this.getEffectContext(options);
    const effectOptions: Provider = this.getEffectOptions(options);

    return {
      global: true,
      module: EffectModule,
      providers: [effectContext, effectOptions],
      exports: [effectContext, effectOptions],
    };
  }

  static forFeature(options: EffectFeatureConfig): DynamicModule {
    const effectContext: Provider = this.getEffectContext(options);
    const effectOptions: Provider = this.getEffectOptions(options);

    return {
      global: false,
      module: EffectModule,
      providers: [effectContext, effectOptions],
      exports: [effectContext, effectOptions],
    };
  }

  private static getEffectContext(options: EffectConfig): Provider {
    return {
      provide: EFFECT_RUNTIME,
      useFactory: (
        discoveryService: DiscoveryService,
        moduleRef: ModuleRef
      ) => {
        return new EffectContextBuilder(discoveryService, moduleRef, options)
          .runtime;
      },
      inject: [DiscoveryService, ModuleRef],
    };
  }

  private static getEffectOptions(options: EffectConfig): Provider {
    return {
      provide: EFFECT_CONFIG,
      useValue: {
        mapError: options.mapError,
        mapValue: options.mapValue,
      },
    };
  }
}
