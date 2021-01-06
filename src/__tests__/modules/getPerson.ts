import { Person } from './person';

// this function is not exported and therefore will not be visible in the schema
function getPersonPrivate(): Person | null {
  return null;
}

// TODO#1 can hide properties with a type/interface?
// TODO#2 handle inline return object type
// TODO#3 object as argument
// - expand first input argument if an object (-> make this an optional behavior)

export function getPerson(): Person {
  return {
    firstName: 'John',
    lastName: 'Smith',
  };
}
