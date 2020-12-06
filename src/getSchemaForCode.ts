import * as graphql from 'graphql';
import { generateGraphQLSchema } from './generateGraphQLSchema';
import { processFile } from './processFile';
import { isAbsolute } from 'path';

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

  const [queryModulePath] = queryModulePaths;
  const docEntries = processFile(queryModulePath);
  const schema = generateGraphQLSchema(docEntries);
  return schema;
}
