import { resolve } from 'path';
import { getSchemaForCode, gql } from '..';

describe('Application', () => {
  test('sums numbers', () => {
    const schema = getSchemaForCode({
      queryModulePaths: [resolve(__dirname, './module')],
    });

    // TODO
    // test should check if exports of the specified module
    // - are translated into correct graphql schema
    // - runtime executes the module correctly

    expect(schema).toEqualSchema(gql`
      type Query {
        sum: String
      }
    `);
  });
});
