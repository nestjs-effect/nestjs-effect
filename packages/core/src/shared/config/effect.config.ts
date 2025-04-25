import { Either } from "effect";
import { ParseError } from "effect/ParseResult";

export type EffectConfig = {
  runtime?: {
    mapValue?: (value: any) => any;
    mapError?: (error: any) => Either.Either<any, any>;
  };
  validation?: {
    strict?: boolean;
    customError?: new (error?: ParseError) => any;
  };
};
