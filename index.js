"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const { hideBin } = require('yargs/helpers');
const processFile_1 = require("./processFile");
yargs_1.default(hideBin(process.argv)).command('curl <url>', 'fetch the contents of the URL', () => { }, (argv) => {
    console.info(argv);
    processFile_1.processFile(argv.url);
}).argv;
