import * as fs from 'fs';
import * as path from 'path';
import yargs from 'yargs';
import { processFile } from './processFile';
const { hideBin } = require('yargs/helpers');

export { getSchemaForCode } from './getSchemaForCode';
export { gql } from './gql';

yargs(hideBin(process.argv)).command<{ path: string }>(
  'module <path>',
  'prepares the module for graphql',
  () => {},
  (argv) => {
    console.info(argv);

    const declarations = processFile(argv.path);
    console.log(1, JSON.stringify(declarations, undefined, 4));

    const currentDirectory = process.cwd();
    const fullPath = path.join(currentDirectory, path.basename(argv.path));
    const ext = path.extname(fullPath);

    // TODO use dist path from tsconfig file
    const savedFilePath = path.format({
      ...path.parse(fullPath),
      base: undefined,
      ext: `${ext}.graphql.json`,
    });

    console.log(`Written data to file ${savedFilePath}`);
    fs.writeFileSync(savedFilePath, JSON.stringify(declarations, undefined, 4));

    // const schema = generateGraphQLSchema(declarations);
    // console.log(printSchema(schema));
  }
).argv;
