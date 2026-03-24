import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  clearMocks: true,
  collectCoverage: false,
};

export default config;
