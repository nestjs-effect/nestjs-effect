import { Either, Layer } from "effect";
import { ParseError } from "effect/ParseResult";

type ModuleBaseConfig = {
  autoServiceDiscovery?: boolean;
  runtime?: {
    mapValue?: (value: any) => any;
    mapError?: (error: any) => Either.Either<any, any>;
  };
  validation?: {
    strict?: boolean;
    customError?: new (error?: ParseError) => any;
  };
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
