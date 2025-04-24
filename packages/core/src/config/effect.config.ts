import { Either, Layer } from "effect";

type BaseConfig = {
  autoServiceDiscovery?: boolean;
  mapValue?: (value: any) => any;
  mapError?: (error: any) => Either.Either<any, any>;
};

export type EffectRootConfig = {
  services?: Layer.Layer<any, any, any>[];
} & BaseConfig;

export type EffectFeatureConfig = {
  services: Layer.Layer<any, any, any>[];
} & BaseConfig;

export type EffectConfig = EffectRootConfig | EffectFeatureConfig;
