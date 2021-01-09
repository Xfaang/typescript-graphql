import * as fs from 'fs';
import * as graphql from 'graphql';
import * as path from 'path';
import { isAbsolute } from 'path';
import { DocEntry, processFile } from './processFile';

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

function getFieldConfigMapForModule({
  declarations,
  module,
  fieldName,
}: {
  declarations: Record<string, DocEntry[]>;
  module: any;
  fieldName: string;
}): graphql.GraphQLFieldConfigMap<any, any> {
  const fieldConfigMap: graphql.GraphQLFieldConfigMap<any, any> = {};

  declarations[fieldName].forEach((declaration) => {
    const args: graphql.GraphQLFieldConfigArgumentMap = {};

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
        if (declarations[objectName]) {
          Object.assign(
            fields,
            getFieldConfigMapForModule({
              declarations,
              module,
              fieldName: objectName,
            })
          );
        }

        type = new graphql.GraphQLObjectType({
          name: objectName,
          fields,
        });
      } else {
        type = getTypeForString(call.returnType ?? call.checkerReturnType!);
      }

      // take only secod argument which is for args
      if (call.parameters?.[1]) {
        const argParam = call.parameters![1].param;
        if (!argParam) {
          throw new Error(`Expecting param in second argument of resolver`);
        }
        Object.entries(argParam.objectProps).forEach(([name, value]) => {
          args[name] = { type: getTypeForString(value) };
        });
      }
    }

    const name = declaration.name!;
    const fieldConfig: graphql.GraphQLFieldConfig<any, any> = {
      type: type!,
      args,
      description: declaration.documentation || undefined,
      resolve(source, args, context, info) {
        return (module[fieldName][name] as Function).call(
          undefined,
          source,
          args,
          context,
          info
        );
      },
    };

    fieldConfigMap[name] = fieldConfig;
  });

  return fieldConfigMap;
}

/** Converts code into GraphQLSchema */
export function buildSchemaFromCode({
  modulePath,
}: {
  modulePath: string;
}): graphql.GraphQLSchema {
  if (!isAbsolute(modulePath)) {
    throw new Error(`Expecting absolute path in ${modulePath}`);
  }

  const declarations: Record<string, DocEntry[]> = getDeclarationsForModule(
    modulePath
  ) as any;
  const module = require(modulePath);

  console.log('declarations', JSON.stringify(declarations, null, 2));

  const queryFieldsConfig: graphql.GraphQLFieldConfigMap<
    any,
    any
  > = getFieldConfigMapForModule({ declarations, module, fieldName: 'Query' });

  const mutationFieldsConfig: graphql.GraphQLFieldConfigMap<
    any,
    any
  > = getFieldConfigMapForModule({
    declarations,
    module,
    fieldName: 'Mutation',
  });

  const schema = new graphql.GraphQLSchema({
    query: new graphql.GraphQLObjectType({
      name: 'Query',
      fields: queryFieldsConfig,
    }),
    mutation: new graphql.GraphQLObjectType({
      name: 'Mutation',
      fields: mutationFieldsConfig,
    }),
  });

  return schema;
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
    return processFile(tsModulePath) as any;
  }

  // 2. Check if a index file exists for the module
  const tsModuleIndexPath = path.join(absolutePath, './index.ts');
  if (fs.existsSync(tsModuleIndexPath)) {
    console.log('reading from', tsModuleIndexPath);
    return processFile(tsModuleIndexPath) as any;
  }

  // 3. Check if a .graphql.json file exists for the module
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
