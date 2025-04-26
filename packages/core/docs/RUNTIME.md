# Runtime
Helper to run [Effect](https://effect.website/) in a [NestJS](https://nestjs.com/) application

# How to use
Effect can be run automatically at the edge of your application (Controller, Gateway...) by specifying the custom `EffectRuntimeInterceptor`

You can add it at the Edge level
```js
@Controller()
@UseInterceptors(EffectRuntimeInterceptor) // <--
export class AppController {
  constructor() {}

  @Get()
  getHello() {
    return Effect.void;
  }
}
```
or at the global level
```js
@Module({
  imports: [EffectModule.forRoot()],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EffectRuntimeInterceptor, // <--
    },
  ],
})
export class AppModule {}
```

You can now return Effect from your controller directly without running them

```js
@Controller()
@UseInterceptors(EffectRuntimeInterceptor)
export class AppController {
  constructor() {}

  @Get()
  getHello(): Effect.Effect<string, never, never> {
    return Effect.succeed('Hello World!');
  }
}
```

it will return the value within the effect
```bash
$ curl http://localhost:3000
# Hello World!
```

## Dependency Injection (DI)

In your effect you might have [requirements](https://effect.website/docs/requirements-management/services/#managing-services-with-effect)

while you'll usually provide your effect before running with `provideService`, there is no need for that with this library

Services will be automatically provided to your effect if they're __available__ within the NestJS context.

To do so, let's first create the service
```js
@Injectable()
// Token/Interface
export class Random extends Context.Tag('MyRandomService')< 
  Random,
  { readonly next: Effect.Effect<number> }
>() {}

// Implementation of the service interface.
export const RandomLive = Layer.succeed( 
  Random,
  Random.of({ next: Effect.succeed(Math.random()) }),
);

```
then we can import it and make it available for the NestJS context by providing it as a provider, same as a nest standard service. 

> [!IMPORTANT]  
> The service should be provided as a `useValue` or `useFactory` and __not__ a `useClass` since it's not a class.

```js
import { Random, RandomLive } from './modules/random/random.service';

@Module({
  imports: [
    EffectModule.forRoot({
      autoServiceDiscovery: true, // this must be set to true to allow auto service discovery of your service
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: Random,
      useValue: RandomLive,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: EffectRuntimeInterceptor,
    },
  ],
})
export class AppModule {}
```

alternatively, if you don't want to use the NestJS DI you can directly inject the Service implementation directly inside the module config
```js
@Module({
  imports: [
    EffectModule.forRoot({
      services: [RandomLive], // Inject service implementation
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EffectRuntimeInterceptor,
    },
  ],
})
export class AppModule {}
```

## Error handling

if for some reason your effect fail
```js
  @Get()
  getHello(): Effect.Effect<never, string, never> {
    return Effect.fail('I will fail');
  }
```

then it will return 
```json
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

Same if you throw an `Error`
```js
  @Get()
  getHello(): Effect.Effect<never, Error, never> {
    return Effect.fail(new Error('I will fail'));
  }
```

return 
```json
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

To customize error you can provide the option `mapError` within the `EffectModule`
```js
@Module({
  imports: [
    EffectModule.forRoot({
      runtime: {
        mapError(error) { // here
          return Either.right({
            ok: false,
            data: error.message,
          });
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: EffectRuntimeInterceptor,
    },
  ],
})
export class AppModule {}
```
it will return 
```json
{
    "ok": false,
    "data": "I will fail"
}
```

More information about the mapError function can be found in the [core docs](https://github.com/nestjs-effect/nestjs-effect/tree/main/packages/core#initialization)
