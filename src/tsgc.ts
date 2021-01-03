import { program } from 'commander';
import { compile } from './compile';

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

    try {
      await compile(files, options);
    } catch (e) {
      console.error(e);
    }
  })
  .parse(process.argv);
