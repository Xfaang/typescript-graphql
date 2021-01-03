import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { getCompilerOptions, processFile } from './processFile';

export { getSchemaForCode } from './getSchemaForCode';
export { gql } from './gql';
export * from './types';

async function compile(files: string[], options: { watch?: boolean }) {
  const [filePath] = files;

  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  const { rootDir, outDir } = getCompilerOptions();
  if (!rootDir) {
    throw new Error('Your tsconfig file must specify rootDir');
  }
  if (!outDir) {
    throw new Error('Your tsconfig file must specify outDir');
  }

  const relativePath = path.relative(rootDir, fullPath);
  if (relativePath.startsWith('..')) {
    throw new Error(
      `Specified file ${fullPath} is not under the rootDir ${rootDir}`
    );
  }

  // TODO
  // each file that contains definitions used by the modules should
  // include its own .graphql.json file for easier merges

  const outFilePath = path.join(outDir, relativePath);
  const jsonFilePath = path.format({
    ...path.parse(outFilePath),
    base: undefined,
    ext: '.graphql.json',
  });

  updateJsonFile();

  // enter watch mode
  if (options.watch) {
    fs.watch(fullPath, () => {
      console.log(`Change to ${fullPath} detected.`);
      updateJsonFile();
    });
  }

  function updateJsonFile() {
    const declarations = processFile(fullPath);
    fs.writeFileSync(jsonFilePath, JSON.stringify(declarations, undefined, 4));
    console.log(`Data written to file ${jsonFilePath}`);
  }
}

program
  .version(require('../package').version, '-v, --version')
  .arguments('[files...]')
  .description('Compile TypeScript files for GraphQL integration')
  .option('-w, --watch', 'Watch input files.')
  .action(async function (files: string[], options: { watch?: boolean }) {
    if (files.length === 0) {
      program.outputHelp();
      return;
    }

    return compile(files, options);
  })
  .parse(process.argv);
