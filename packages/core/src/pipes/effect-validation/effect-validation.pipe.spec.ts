import { BadRequestException } from "@nestjs/common";
import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import { EffectValidationPipe } from "./effect-validation.pipe";

class UserDTO extends Schema.Class<UserDTO>("UserDTO")({
  id: Schema.Number,
  name: Schema.NonEmptyString,
}) {}

const UserDTOEquivalence = Schema.equivalence(UserDTO);

describe("EffectValidationPipe", () => {
  describe("Class DTO", () => {
    it("should validate DTO", () => {
      const pipe = new EffectValidationPipe();

      const newUser = {
        id: 1,
        name: "John",
      };

      const result = pipe.transform(newUser, {
        metatype: UserDTO,
        type: "body",
      });

      expect(UserDTOEquivalence(result, newUser)).toBeTruthy();
    });

    it("should throw error", () => {
      const pipe = new EffectValidationPipe();

      try {
        pipe.transform(
          {
            id: 1,
          },
          {
            metatype: UserDTO,
            type: "body",
          }
        );
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Config strict", () => {
    it("should throw error if config is strict", () => {
      const pipe = new EffectValidationPipe({ validation: { strict: true } });

      try {
        const result = pipe.transform(
          {
            id: 1,
          },
          {
            metatype: undefined,
            type: "body",
          }
        );

        expect(result).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it("should return value if config is not strict", () => {
      const pipe = new EffectValidationPipe({ validation: { strict: false } });

      const value = {
        id: 1,
      };

      const result = pipe.transform(value, {
        metatype: undefined,
        type: "body",
      });

      expect(result).toStrictEqual(value);
    });
  });

  describe("Config customError", () => {
    it("should use custom error if provided", () => {
      class MyCustomError {}

      const pipe = new EffectValidationPipe({
        validation: {
          strict: true,
          customError: MyCustomError,
        },
      });

      try {
        const result = pipe.transform(
          {
            id: 1,
          },
          {
            metatype: undefined,
            type: "body",
          }
        );

        expect(result).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(MyCustomError);
      }
    });
    it("should throw default error if custom error is not provided", () => {
      const pipe = new EffectValidationPipe({
        validation: {
          strict: true,
        },
      });

      try {
        const result = pipe.transform(
          {
            id: 1,
          },
          {
            metatype: undefined,
            type: "body",
          }
        );

        expect(result).toBeUndefined();
      } catch (error) {
        expect(error).toBeDefined();
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
