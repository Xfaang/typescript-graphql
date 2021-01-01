import * as graphql from 'graphql';
import { isAbsolute } from 'path';
import { generateGraphQLSchema } from './generateGraphQLSchema';

interface Options {
  queryModulePaths: string[];
  mutationModulePaths?: string[];
}

/** Converts code into GraphQLSchema */
export function getSchemaForCode({
  queryModulePaths,
  mutationModulePaths = [],
}: Options): graphql.GraphQLSchema {
  queryModulePaths.forEach((path) => {
    if (!isAbsolute(path)) {
      throw new Error(`Expecting absolute path in ${path}`);
    }
  });

  const schema = generateGraphQLSchema({
    queryModulePaths,
  });
  return schema;
}
