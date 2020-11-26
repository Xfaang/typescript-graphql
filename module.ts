// 1. How to retrieve this information from file?
// 2. How to merge it with existing schema

export function plus(a: number, b: number): number {
  return a + b;
}

interface Person {
  firstName: string;
  lastName: string;
  fullName: string;
}

export function concat(firstName: string, lastName: string): Person {
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
  };
}
