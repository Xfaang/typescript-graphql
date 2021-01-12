import * as fs from 'fs';
import * as path from 'path';
import { getCompilerOptions } from './getCompilerOptions';
import { processFile } from './processFile';

export async function compile(files: string[], options: { watch?: boolean }) {
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
