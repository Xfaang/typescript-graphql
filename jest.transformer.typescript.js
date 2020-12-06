const { extname } = require('path');
const ts = require('typescript');

module.exports = {
  process(src, path) {
    const lowerCasePath = path.toLowerCase();
    if (!lowerCasePath.endsWith('.ts') && !lowerCasePath.endsWith('.tsx')) {
      throw new Error(`Invalid file extension: ${extname(path)}`);
    }

    const { config } = ts.readConfigFile('./tsconfig.json', ts.sys.readFile);

    // NOTE this does not fail on type errors
    return ts.transpile(src, config.compilerOptions, path, []);
  },
};
