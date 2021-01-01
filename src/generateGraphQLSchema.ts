import * as graphql from 'graphql';
import * as path from 'path';
import { DocEntry, processFile } from './processFile';
import * as fs from 'fs';

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

export function generateGraphQLSchema({
  queryModulePath,
}: {
  queryModulePath: string;
}): graphql.GraphQLSchema {
  const declarations = getDeclarationsForModule(queryModulePath);
  console.log('declarations', JSON.stringify(declarations, null, 2));

  const module = require(queryModulePath);

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

    const name = declaration.name!;
    const fieldConfig: graphql.GraphQLFieldConfig<any, any> = {
      type: type!,
      args,
      description: declaration.documentation || undefined,
      resolve(source, args) {
        const argsAr: any[] = [];
        Object.entries(args).forEach(([argName, argValue]) => {
          argsAr[argIndexMap[argName]] = argValue;
        });

        return (module[name] as Function).apply(undefined, argsAr);
      },
    };

    fieldsConfig[name] = fieldConfig;
  });

  const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
      name: 'Query',
      fields: fieldsConfig,
    }),
  });
  return schema;
}

function getModuleFullPath(id: string): string {
  try {
    console.log(1, require.resolve.paths(id));
    return require.resolve(id);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      throw new Error(`Could not resolve module ${id}`);
    }
    throw e;
  }
}

function getDeclarationsForModule(absoultePath: string): DocEntry[] {
  if (!path.isAbsolute(absoultePath)) {
    throw new Error(`Expecting an absolute path but received ${absoultePath}`);
  }

  // 1. Check if a .ts file exists for the module
  const tsModulePath = path.format({
    ...path.parse(absoultePath),
    base: undefined,
    ext: '.ts',
  });
  if (fs.existsSync(tsModulePath)) {
    console.log('reading from', tsModulePath);
    return processFile(tsModulePath);
  }

  // 1. Check if a .graphql.json file exists for the module
  const graphqlModulePath = path.format({
    ...path.parse(absoultePath),
    base: undefined,
    ext: '.graphql.json',
  });
  if (fs.existsSync(graphqlModulePath)) {
    console.log('reading from', graphqlModulePath);
    return require(graphqlModulePath);
  }

  throw new Error(
    `Neither a TypeScript source file nor GraphQL JSON was found for ${absoultePath}`
  );
}
