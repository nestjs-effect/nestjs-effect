import { Either, Layer } from "effect";

type ModuleBaseConfig = {
  autoServiceDiscovery?: boolean;
  mapValue?: (value: any) => any;
  mapError?: (error: any) => Either.Either<any, any>;
};

export type EffectModuleRootConfig = {
  services?: Layer.Layer<any, any, any>[];
} & ModuleBaseConfig;

export type EffectModuleFeatureConfig = {
  services: Layer.Layer<any, any, any>[];
} & ModuleBaseConfig;

export type EffectModuleConfig =
  | EffectModuleRootConfig
  | EffectModuleFeatureConfig;
