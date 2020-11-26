import yargs from 'yargs';
const { hideBin } = require('yargs/helpers');

import { processFile } from './processFile';

yargs(hideBin(process.argv)).command<{ url: string }>(
  'curl <url>',
  'fetch the contents of the URL',
  () => {},
  (argv) => {
    console.info(argv);

    processFile(argv.url);
  }
).argv;
