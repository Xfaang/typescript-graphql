import * as graphql from 'graphql';
import { DocEntry } from './processFile';

export function generateGraphQLSchema(
  declarations: DocEntry[]
): graphql.GraphQLSchema {
  console.log('gen1', declarations);

  const fieldsConfig: graphql.GraphQLFieldConfigMap<any, any> = {};

  declarations.forEach((declaration) => {
    const fieldConfig: graphql.GraphQLFieldConfig<any, any> = {
      type: graphql.GraphQLString,
      resolve() {
        return 'world';
      },
    };

    fieldsConfig[declaration.name!] = fieldConfig;
  });

  const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
      name: 'Query',
      fields: fieldsConfig,
    }),
  });
  return schema;
}
