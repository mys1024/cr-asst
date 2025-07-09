import { describe, expect, it } from 'vitest';
import { booleanEnvVar, numberEnvVar, envOptions } from '../env';

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

describe('numberEnvVar()', () => {
  it('int', async () => {
    expect(numberEnvVar('1', 'int')).toBe(1);
    expect(numberEnvVar('1.2', 'int')).toBe(1);
    expect(numberEnvVar('445.85', 'int')).toBe(445);
  });
  it('float', async () => {
    expect(numberEnvVar('2.56', 'float')).toBe(2.56);
    expect(numberEnvVar('3.6', 'float')).toBe(3.6);
    expect(numberEnvVar('233.65', 'float')).toBe(233.65);
  });
  it('undefined', async () => {
    expect(numberEnvVar('', 'int')).toBe(undefined);
    expect(numberEnvVar(undefined, 'int')).toBe(undefined);
    expect(numberEnvVar('foo', 'int')).toBe(undefined);
  });
});

describe('envOptions', () => {
  it('basic', async () => {
    expect(envOptions).toBeTruthy();
  });
});
