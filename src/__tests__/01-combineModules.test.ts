import { graphql } from 'graphql';
import { resolve } from 'path';
import { getSchemaForCode, gql } from '..';

test('Converts combined query modules', async () => {
  const schema = getSchemaForCode({
    queryModulePaths: [
      resolve(__dirname, './modules/getFullName'),
      resolve(__dirname, './modules/helloWorld'),
    ],
  });

  expect(schema).toEqualSchema(gql`
    type Query {
      getFullName(firstName: String, lastName: String): String
      helloWorld: String
    }
  `);

  expect(
    await graphql({
      schema,
      source: gql`
        query {
          getFullName(firstName: "John", lastName: "Smith")
          helloWorld
        }
      `,
    })
  ).toEqual({
    data: { getFullName: 'John Smith', helloWorld: 'Hello world!' },
  });
});
