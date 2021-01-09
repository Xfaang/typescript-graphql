import type { float, int } from '../types';

/** adds two numbers */
function plus({ a, b }: { a: float; b: float }): float {
  return a + b;
}

/** subtracts two numbers */
function minus({ a, b }: { a: int; b: int }): int {
  return a - b;
}

export const Query = {
  plus,
  minus,
};
