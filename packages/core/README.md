# @nestjs-effect/core

[![npm version](https://badge.fury.io/js/@nestjs-effect%2Fcore.svg)](https://badge.fury.io/js/@nestjs-effect%2Fcore)

Core module of the @nestjs-effect package, it include everything you need to start using effect within a nestjs application

| Feature                    | Description                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| `EffectModule`             | To initialize Effect, it's **required** to use any of the features |
| `EffectRuntimeInterceptor` | To run and provide Effect on the edge of your application          |
| `EffectValidationPipe`     | To validate incoming data with Effect Schema                       |

# Installation

Install the core package using any package manager

```bash
yarn add @nestjs-effect/core
```

# Initialization

Before using any of the feature you need to import and initialize the module within your main module

```js
import { EffectModule } from "@nestjs-effect/core";

@Module({
  imports: [EffectModule.forRoot()],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

Several option is available for the `EffectModule`

```ts
type Option = {
  /**
   * @true - the runtime will automatically get and provide
   * your effect requirements with the effect services available
   * within the context (both nestjs provider and `services` option)
   *
   * @false - the runtime will only use service provided manually
   * in the `services` option to run the effect
   */
  autoServiceDiscovery?: boolean;
  /**
   * Array of Layer that will be injected within the runtime
   */
  services?: Layer.Layer<any, any, any>[];
  /**
   * Runtime specific option
   */
  runtime?: {
    /**
     * A method that will be used to map the effect value just before being run
     * Useful to normalize output of your app
     */
    mapValue?: (value: any) => any;
    /**
     * A method that will be used to map the effect error just before being run
     *
     * @right - will fallback this value within the effect before being run
     * it can be useful to map deterministic error into a value that can
     * be return to the client for more information
     *
     * @left - will throw this error resulting of an 500
     */
    mapError?: (error: any) => Either.Either<any, any>;
  };
  /**
   * Validation specific option
   */
  validation?: {
    /**
     * @true - if not Effect Schema is provided it will not return anything
     * @false - if no Effect Schema is provided it will return the value without validation
     */
    strict?: boolean;
    /**
     * Class that will be thrown in case where the Effect Schema
     * is failling to decode the incoming value
     *
     * it will pass the failure `ParseError` in the constructor
     */
    customError?: new (error?: ParseError) => any;
  };
};
```

To go futher go to the dedicated documentation

| Package                            | Description                   |
| ---------------------------------- | ----------------------------- |
| [validation](./docs/VALIDATION.md) | To validate Effect with pipes |
| [runtime](./docs/RUNTIME.md)       | To run Effect                 |
