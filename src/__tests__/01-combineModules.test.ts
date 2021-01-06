import { graphql } from 'graphql';
import { resolve } from 'path';
import { getSchemaForCode } from '..';
import { gql } from './utils';

test('Converts combined query modules', async () => {
  const schema = getSchemaForCode({
    queryModulePaths: [
      resolve(__dirname, './modules/concat'),
      resolve(__dirname, './modules/helloWorld'),
    ],
  });

  expect(schema).toEqualSchema(gql`
    type Query {
      concat(first: String, last: String): String
      helloWorld: String
    }
  `);

  expect(
    await graphql({
      schema,
      source: gql`
        query {
          concat(first: "John", last: "Smith")
          helloWorld
        }
      `,
    })
  ).toEqual({
    data: { concat: 'John Smith', helloWorld: 'Hello world!' },
  });
});
