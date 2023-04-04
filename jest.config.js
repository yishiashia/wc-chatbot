module.exports = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^.+\\.(css|less|scss)$": "babel-jest"
  },
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
