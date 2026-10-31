import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/features/**/*.{ts,tsx}",
    "!src/features/**/*.types.ts",
    "!src/features/**/*.test.{ts,tsx}",
    "!src/features/users/users.slice.ts",
  ],
};

export default createJestConfig(config);
