import * as graphql from 'graphql';
import { DocEntry } from './processFile';

function getTypeForString(typename: string): graphql.GraphQLScalarType {
  switch (typename) {
    case 'number':
      return graphql.GraphQLInt;

    default:
      throw new Error(`Unknown type ${typename}`);
  }
}

export function generateGraphQLSchema(
  declarations: DocEntry[]
): graphql.GraphQLSchema {
  console.log('gen1', JSON.stringify(declarations, null, 2));

  const fieldsConfig: graphql.GraphQLFieldConfigMap<any, any> = {};

  declarations.forEach((declaration) => {
    const args: graphql.GraphQLFieldConfigArgumentMap = {};

    let type: graphql.GraphQLScalarType;

    if (declaration.calls) {
      const call = declaration.calls[0];

      type = getTypeForString(call.returnType!);

      call.parameters?.forEach((parameter) => {
        args[parameter.name!] = {
          type: getTypeForString(parameter.type!),
        };
      });
    }

    const fieldConfig: graphql.GraphQLFieldConfig<any, any> = {
      type: type!,
      args,
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
