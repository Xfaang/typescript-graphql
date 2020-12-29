import * as graphql from 'graphql';
import { DocEntry } from './processFile';

function getTypeForString(typename: string): graphql.GraphQLScalarType {
  switch (typename) {
    case 'number':
      throw new Error(
        'Ambiguous type "number": please use either float or int'
      );

    case 'int':
      return graphql.GraphQLInt;

    case 'float':
      return graphql.GraphQLFloat;

    case 'string':
      return graphql.GraphQLString;

    case 'boolean':
      return graphql.GraphQLBoolean;

    case 'id':
      return graphql.GraphQLID;

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
    const argIndexMap: Record<string, number> = {};

    let type: graphql.GraphQLScalarType;

    if (declaration.calls) {
      const call = declaration.calls[0];

      type = getTypeForString(call.returnType!);

      call.parameters?.forEach((parameter, index) => {
        const name = parameter.name!;
        args[name] = {
          type: getTypeForString(parameter.param!.typeName),
        };
        argIndexMap[name] = index;
      });
    }

    const fieldConfig: graphql.GraphQLFieldConfig<any, any> = {
      type: type!,
      args,
      resolve(source, args) {
        console.log('source', source);
        console.log('args', args);
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
