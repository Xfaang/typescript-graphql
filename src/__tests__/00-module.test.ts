import { graphql } from 'graphql';
import { buildSchemaFromCode } from '..';
import { int } from '../types';
import { gql } from './utils';

test('Converts modules using scalar types', async () => {
  const schema = buildSchemaFromCode({
    modulePath: __filename,
  });

  expect(schema).toEqualSchema(gql`
    type Query {
      """
      adds two numbers together
      """
      sum(a: Int, b: Int): Int
      concat(first: String, last: String): String
      getPerson: Person
    }

    type Person {
      firstName: String
      lastName: String
      fullName: String
    }

    type Mutation {
      inc: Int
    }
  `);

  expect(
    await graphql({
      schema,
      source: gql`
        query {
          sum(a: 2, b: 2)
          concat(first: "John", last: "Smith")
          getPerson {
            firstName
            lastName
            fullName
          }
        }
      `,
    })
  ).toEqual({
    data: {
      sum: 4,
      concat: 'John Smith',
      getPerson: {
        firstName: 'John',
        lastName: 'Smith',
        fullName: 'John Smith',
      },
    },
  });
});

type Person = {
  firstName: string;
  lastName: string;
};

function getPerson(): Person {
  return {
    firstName: 'John',
    lastName: 'Smith',
  };
}

function fullName(person: Person) {
  const { firstName, lastName } = person;
  return `${firstName} ${lastName}`;
}

export const Query = {
  /** adds two numbers together */
  sum(_: void, { a, b }: { a: int; b: int }): int {
    return a + b;
  },
  concat(_: void, { first, last }: { first: string; last: string }) {
    return `${first} ${last}`;
  },
  getPerson,
};

export const Mutation = {
  inc(): int {
    return 0;
  },
};

export const Person = {
  fullName,
};

// TODO cover case where export is separate and where functions are separate
// export { Query };

// TODO#1 can hide properties with a type/interface?
// TODO#2 handle inline return object type
// TODO#3 object as argument
// - expand first input argument if an object (-> make this an optional behavior)
