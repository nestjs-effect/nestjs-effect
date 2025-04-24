import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [],
    expect: {
      requireAssertions: true,
    },
  },
});
