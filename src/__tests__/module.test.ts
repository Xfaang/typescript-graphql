import { graphql } from 'graphql';
import { resolve } from 'path';
import { getSchemaForCode, gql } from '..';

describe('Application', () => {
  test('sums numbers', async () => {
    const schema = getSchemaForCode({
      queryModulePaths: [resolve(__dirname, './module')],
    });

    // TODO
    // test should check if exports of the specified module
    // - are translated into correct graphql schema
    // - runtime executes the module correctly

    expect(schema).toEqualSchema(gql`
      type Query {
        sum(a: Int, b: Int): Int
        getFullName(firstName: String, lastName: String): String
      }
    `);

    // expect(
    //   await graphql({
    //     schema,
    //     source: gql`
    //       query {
    //         sum(a: 2, b: 2)
    //       }
    //     `,
    //   })
    // ).toEqual({ data: { sum: 4 } });
  });
});
