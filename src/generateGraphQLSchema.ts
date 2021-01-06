import * as fs from 'fs';
import * as graphql from 'graphql';
import * as path from 'path';
import { DocEntry, processFile } from './processFile';
import { ResolverThis } from './types';

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

function getFieldConfigMapForModule(
  absolutePath: string,
  { fieldResolverPaths }: { fieldResolverPaths?: Record<string, string[]> }
): graphql.GraphQLFieldConfigMap<any, any> {
  const fieldConfigMap: graphql.GraphQLFieldConfigMap<any, any> = {};

  const declarations = getDeclarationsForModule(absolutePath);
  const module = require(absolutePath);

  console.log('declarations', JSON.stringify(declarations, null, 2));

  declarations.forEach((declaration) => {
    const args: graphql.GraphQLFieldConfigArgumentMap = {};
    const argIndexMap: Record<string, number> = {};

    let type: graphql.GraphQLScalarType | graphql.GraphQLObjectType;

    if (declaration.calls) {
      const call = declaration.calls[0];

      if (call.retTypeObjProps) {
        const objectName = call.returnType!;
        const fields: graphql.GraphQLFieldConfigMap<any, any> = {};
        call.retTypeObjProps.forEach(({ name, type }) => {
          fields[name] = {
            type: getTypeForString(type),
          };
        });

        // add virtual fields provided by field resolvers
        const objectFieldResolverPaths = fieldResolverPaths?.[objectName];
        if (objectFieldResolverPaths) {
          objectFieldResolverPaths.forEach((objectFieldResolverPath) => {
            Object.assign(
              fields,
              getFieldConfigMapForModule(objectFieldResolverPath, {
                fieldResolverPaths,
              })
            );
          });
        }

        type = new graphql.GraphQLObjectType({
          name: objectName,
          fields,
        });
      } else {
        type = getTypeForString(call.returnType!);
      }

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
      resolve(source, args, context, info) {
        const argsAr: any[] = [];
        Object.entries(args).forEach(([argName, argValue]) => {
          argsAr[argIndexMap[argName]] = argValue;
        });

        const thisArg: ResolverThis<any, any> = {
          parent: source,
          args,
          context,
          info,
        };

        return (module[name] as Function).apply(thisArg, argsAr);
      },
    };

    fieldConfigMap[name] = fieldConfig;
  });

  return fieldConfigMap;
}

export function generateGraphQLSchema({
  queryModulePaths,
  fieldResolverPaths,
}: {
  queryModulePaths: string[];
  fieldResolverPaths?: Record<string, string[]>;
}): graphql.GraphQLSchema {
  const queryFieldsConfig: graphql.GraphQLFieldConfigMap<any, any> = {};

  queryModulePaths.forEach((queryModulePath) => {
    const fieldConfigMap = getFieldConfigMapForModule(queryModulePath, {
      fieldResolverPaths,
    });
    Object.assign(queryFieldsConfig, fieldConfigMap);
  });

  const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
      name: 'Query',
      fields: queryFieldsConfig,
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

function getDeclarationsForModule(absolutePath: string): DocEntry[] {
  if (!path.isAbsolute(absolutePath)) {
    throw new Error(`Expecting an absolute path but received ${absolutePath}`);
  }

  // 1. Check if a .ts file exists for the module
  const tsModulePath = path.format({
    ...path.parse(absolutePath),
    base: undefined,
    ext: '.ts',
  });
  if (fs.existsSync(tsModulePath)) {
    console.log('reading from', tsModulePath);
    return processFile(tsModulePath);
  }

  // 1. Check if a .graphql.json file exists for the module
  const graphqlModulePath = path.format({
    ...path.parse(absolutePath),
    base: undefined,
    ext: '.graphql.json',
  });
  if (fs.existsSync(graphqlModulePath)) {
    console.log('reading from', graphqlModulePath);
    return require(graphqlModulePath);
  }

  throw new Error(
    `Neither a TypeScript source file nor GraphQL JSON was found for ${absolutePath}`
  );
}
