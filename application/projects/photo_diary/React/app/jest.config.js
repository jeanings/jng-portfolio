/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  extensionsToTreatAsEsm: [".ts"],
  preset: "ts-jest/presets/js-with-ts-esm",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  },
  globals: {
    "ts-jest": {
      "tsconfig": "<rootDir>/tsconfig.json",
      "isolatedModules": true,
      "useESM": true
    }
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.(css|sass)$": "identity-obj-proxy",
  },
  resetMocks: true,
  setupFiles: ["<rootDir>/src/setupTestEnv.js"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"]
};

/*  
preset: "/presets/js-with-ts"
 preset: "ts-jest/presets/js-with-ts-esm",
transform: {
    "node_modules/variables/.+\\.(j|t)sx?$": "ts-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!variables/.*)"
  ],*/