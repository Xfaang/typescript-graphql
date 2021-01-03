import { graphql } from 'graphql';
import { resolve } from 'path';
import { getSchemaForCode } from '..';
import { gql } from './utils';

test('Converts modules using scalar types', async () => {
  const schema = getSchemaForCode({
    queryModulePaths: [resolve(__dirname, './modules/simpleMath')],
  });

  expect(schema).toEqualSchema(gql`
    type Query {
      """
      adds one number to another
      """
      sum(a: Int, b: Int): Int

      """
      subtracts one number from another
      """
      diff(a: Int, b: Int): Int
    }
  `);

  expect(
    await graphql({
      schema,
      source: gql`
        query {
          sum(a: 2, b: 2)
          diff(a: 2, b: 2)
        }
      `,
    })
  ).toEqual({
    data: { sum: 4, diff: 0 },
  });
});
