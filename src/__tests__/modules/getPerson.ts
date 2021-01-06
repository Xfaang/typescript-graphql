// alternatively:
// interface Person {
//
// Note isClassOrInterface returns true for interface but false for type
//
// type Person = {
//   firstName: string;
//   lastName: string;
// };

import { Person } from './person';

// this function is not exported and therefore will not be visible in the schema
function getPersonPrivate(): Person | null {
  return null;
}

// TODO can hide properties with a type/interface?
// TODO how to add a field resolver?
// TODO handle inline return type

// TODO object as argument
// - expand first input argument if an object (-> make this an optional behavior)

export function getPerson(): Person {
  return {
    firstName: 'John',
    lastName: 'Smith',
  };
}

// fullName resolver

// Parent: {
//   fullName;
// }

// export function fullName(): string {
//   return ''; // `${firstName} ${lastName}`
// }

// function getParent<A>(): A {
//   return (null as any) as A;
// }

// export function fullName(): string {
//   // const a = getParent();
//   // const person: Person = getRoot(this);
//   return ''; // `${firstName} ${lastName}`
// }

// // TODO WIP
// // type FieldResolver<Root, Args extends any[], Result> = (
// //   root: Root,
// //   ...args: Args
// // ) => Result;
// // export const fullName: FieldResolver<Person, [], null>
// // __Person__fullName
// // TODO add via getSchemaForCode()
// // use getRoot inside

// // TODO#2
// // expand first input argument if an object (-> make this an optional behavior)
