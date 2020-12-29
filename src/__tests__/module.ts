import type { float, int } from './types';

export function sum(a: int, b: int): int {
  return a + b;
}

export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}
