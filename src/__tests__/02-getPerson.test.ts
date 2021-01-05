import { graphql, printSchema } from 'graphql';
import { resolve } from 'path';
import { getSchemaForCode } from '..';
import { gql } from './utils';

test('Converts combined query modules', async () => {
  const schema = getSchemaForCode({
    queryModulePaths: [resolve(__dirname, './modules/getPerson')],
  });

  expect(schema).toEqualSchema(gql`
    type Query {
      getPerson: Person
    }

    type Person {
      firstName: String
      lastName: String
    }
  `);

  expect(
    await graphql({
      schema,
      source: gql`
        query {
          getPerson {
            firstName
            lastName
          }
        }
      `,
    })
  ).toEqual({
    data: { getPerson: { firstName: 'John', lastName: 'Smith' } },
  });
});
