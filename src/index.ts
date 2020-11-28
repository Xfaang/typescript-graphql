import * as fs from 'fs';
import * as path from 'path';
import { printSchema } from 'graphql';
import yargs from 'yargs';
import { generateGraphQLSchema } from './generateGraphQLSchema';
import { processFile } from './processFile';
const { hideBin } = require('yargs/helpers');

yargs(hideBin(process.argv)).command<{ url: string }>(
  'curl <url>',
  'fetch the contents of the URL',
  () => {},
  (argv) => {
    console.info(argv);

    const declarations = processFile(argv.url);
    console.log(1, JSON.stringify(declarations, undefined, 4));

    const currentDirectory = process.cwd();
    const fullPath = path.join(currentDirectory, path.basename(argv.url));
    const ext = path.extname(fullPath);
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
