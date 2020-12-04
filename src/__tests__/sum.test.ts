function sum(a: number, b: number) {
  return a + b;
}

describe('Application', () => {
  test('sums numbers', () => {
    expect(sum(2, 2)).toBe(4);
  });
});
