import { Either } from "effect";

export type EffectConfig = {
  mapValue?: (value: any) => any;
  mapError?: (error: any) => Either.Either<any, any>;
};
