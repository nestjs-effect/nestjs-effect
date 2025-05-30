# Validation / DTO

Helper to validate [DTOs](https://en.wikipedia.org/wiki/Data_transfer_object) with [Effect](https://effect.website/) in a [NestJS](https://nestjs.com/) application

# How to use

There is 2 ways of creating DTO using Effect.

## Class DTOs

Using the [Class APIs](https://effect.website/docs/schema/classes/)

```js
import { Schema } from "effect";

class UserDTO extends Schema.Class<UserDTO>("UserDTO")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}
```

Then you can import it in your Nest controller as _type_ of your DTO

```js
@Post()
createUser(@Body() userDTO: UserDTO) {
   //
}
```

## Struct DTOs

Using the [Struct APIs](https://effect.website/docs/schema/getting-started/)

> [!WARNING]  
> Struct DTOs are NOT runtime-safe, see more in [Why prefering Class over Struct](#why-prefering-class-over-struct)

```js
import { Schema } from "effect";

const UserDTO = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

interface UserDTO extends Schema.Schema.Type<typeof UserDTO> {}
```

Then you can import it in your Nest controller as _type_ of your DTO

```js
@Post()
createUser(@Body() userDTO: UserDTO) {
   //
}
```

## Validation Pipe

In order to validate the DTO we need to either add the custom effect validation pipe at the route/controller level

```js
import { EffectValidationPipe } from '@nestjs-effect/core';

@Post()
@UsePipes(EffectValidationPipe)
createUser(@Body() userDTO: UserDTO) {
   //
}
```

Or at the global level within the module

```js
import { EffectValidationPipe } from "@nestjs-effect/core";
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: EffectValidationPipe,
    },
  ],
})
export class AppModule {}
```

# Q/A

## Why prefering Class over Struct

In NestJS validation is done by the [PipeTransform](https://docs.nestjs.com/pipes#custom-pipes) Class Helper

it will extract the _Type_ given to our DTO as a `metatype` within the `metadata` object

```js
// Controller.ts
@Post()
createUser(@Body() userDTO: UserDTO) {}

// MyCustomPipe.ts
class MyCustomPipe implements PipeTransform {
  transform(
    value: any,
    metadata: ArgumentMetadata // metadata.metatype == UserDTO
  ) {}
}
```

The value of the metatype will depends of the DTO type

| Type of DTO            | Value of metatype            |
| ---------------------- | ---------------------------- |
| Class                  | Class                        |
| String, Number, Object | Primitive JS Function        |
| TS Type/Interface      | Primitive JS Object Function |

Since, the _Class APIs_ already use _Class_, there is no problem for the validator to handle that.

In case of a _Struct_, what we give to the DTO is a TS `type`, which disapear at runtime. This would provide the metatype as _Object_ and will then not properly validate the DTO with the actual Struct Schema.

The _Exception_ is, if you have both the _type_ and _schema object_ of the DTO within the same file, with the same name

```js
const UserDTO = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

interface UserDTO extends Schema.Schema.Type<typeof UserDTO> {}
```

then, the metatype would be the UserDTO Schema Struct. This is due to how Typescript is compilling into Javascript.

In addition, a mixing approach where you define your DTO Schema as a Struct and then extends it in a class is possible

```js
const UserSchema = Schema.Struct({
  name: Schema.String,
  age: Schema.Number,
});

class UserDTO extends UserSchema {}
```

# Resources

- [Effect docs](https://effect.website/)
- [NestJS docs](https://nestjs.com/)
- [DTOs](https://en.wikipedia.org/wiki/Data_transfer_object)
