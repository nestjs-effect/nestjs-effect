import { DynamicModule, Module, Provider } from "@nestjs/common";
import { DiscoveryModule, DiscoveryService, ModuleRef } from "@nestjs/core";
import {
  EffectModuleConfig,
  EffectModuleFeatureConfig,
  EffectModuleRootConfig,
} from "../shared/config/effect-module.config";
import { EFFECT_CONFIG, EFFECT_RUNTIME } from "../shared/token/effect.token";
import { EffectContextBuilder } from "./effect-context.builder";

@Module({
  imports: [DiscoveryModule],
})
export class EffectModule {
  static forRoot(moduleConfig: EffectModuleRootConfig = {}): DynamicModule {
    const effectRuntime: Provider = this.getEffectRuntime(moduleConfig);
    const effectConfig: Provider = this.getEffectConfig(moduleConfig);

    return {
      global: true,
      module: EffectModule,
      providers: [effectRuntime, effectConfig],
      exports: [effectRuntime, effectConfig],
    };
  }

  static forFeature(moduleConfig: EffectModuleFeatureConfig): DynamicModule {
    const effectContext: Provider = this.getEffectRuntime(moduleConfig);
    const effectOptions: Provider = this.getEffectConfig(moduleConfig);

    return {
      global: false,
      module: EffectModule,
      providers: [effectContext, effectOptions],
      exports: [effectContext, effectOptions],
    };
  }

  private static getEffectRuntime(moduleConfig: EffectModuleConfig): Provider {
    return {
      provide: EFFECT_RUNTIME,
      useFactory: (
        discoveryService: DiscoveryService,
        moduleRef: ModuleRef
      ) => {
        return new EffectContextBuilder(
          discoveryService,
          moduleRef,
          moduleConfig
        ).runtime;
      },
      inject: [DiscoveryService, ModuleRef],
    };
  }

  private static getEffectConfig(moduleConfig: EffectModuleConfig): Provider {
    return {
      provide: EFFECT_CONFIG,
      useValue: {
        runtime: moduleConfig.runtime,
        validation: moduleConfig.validation,
      },
    };
  }
}
