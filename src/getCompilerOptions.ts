import * as ts from 'typescript';

export function getCompilerOptions() {
  const basePath = process.cwd();
  const configFileName = ts.findConfigFile(
    basePath,
    ts.sys.fileExists,
    'tsconfig.json'
  );
  if (!configFileName) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
  const { options } = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    basePath
  );

  return options;
}
