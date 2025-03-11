import { describe, expect, it } from 'vitest';
import { booleanEnvVar, floatEnvVar, envOptions } from '../env';

describe('booleanEnvVar()', () => {
  it('case 1', async () => {
    expect(booleanEnvVar('true')).toBe(true);
  });
  it('case 2', async () => {
    expect(booleanEnvVar('false')).toBe(false);
  });
  it('case 3', async () => {
    expect(booleanEnvVar('foo')).toBe(undefined);
  });
  it('case 4', async () => {
    expect(booleanEnvVar('')).toBe(undefined);
  });
  it('case 5', async () => {
    expect(booleanEnvVar(undefined)).toBe(undefined);
  });
});

describe('floatEnvVar()', () => {
  it('case 1', async () => {
    expect(floatEnvVar('1')).toBe(1);
  });
  it('case 2', async () => {
    expect(floatEnvVar('2.56')).toBe(2.56);
  });
  it('case 3', async () => {
    expect(floatEnvVar('foo')).toBe(undefined);
  });
  it('case 4', async () => {
    expect(floatEnvVar('')).toBe(undefined);
  });
  it('case 5', async () => {
    expect(floatEnvVar(undefined)).toBe(undefined);
  });
});

describe('envOptions', () => {
  it('basic', async () => {
    expect(envOptions).toBeTruthy();
  });
});
