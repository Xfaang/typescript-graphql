// alternatively:
// interface Person {
//
// Note isClassOrInterface returns true for interface but false for type
//
type Person = {
  firstName: string;
  lastName: string;
};

// TODO can hide properties with a type/interface?
// TODO how to add a field resolver?
// TODO handle inline return type

export function getPerson(): Person {
  return {
    firstName: 'John',
    lastName: 'Smith',
  };
}

// TODO WIP
// type FieldResolver<Root, Args extends any[], Result> = (
//   root: Root,
//   ...args: Args
// ) => Result;
// export const fullName: FieldResolver<Person, [], null>
// __Person__fullName
// TODO add via getSchemaForCode()
// use getRoot inside

// TODO#2
// expand first input argument if an object (-> make this an optional behavior)
