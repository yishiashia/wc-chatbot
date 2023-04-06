module.exports = {
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "babel-jest"
  },
  // setupFiles: [`<rootDir>/jest-shim.js`],
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  coverageProvider: "v8",
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/types/**/*',
    '!src/index.ts',
  ]
}
