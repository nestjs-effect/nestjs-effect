import { ParseError } from "effect/ParseResult";

export interface EffectValidationPipeConfig {
  strict?: boolean;
  customError?: new (error?: ParseError) => any;
}
