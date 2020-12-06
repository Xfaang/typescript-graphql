import * as graphql from 'graphql';

/** GraphQL Schema Definiton template tag */
export function gql(
  template: TemplateStringsArray,
  ...substitutions: any[]
): graphql.GraphQLSchema {
  const source = String.raw(template, ...substitutions);
  return graphql.buildSchema(source);
}
