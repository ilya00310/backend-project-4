#!/usr/bin/env node
import { Command } from 'commander';
import { getGeneralLogic } from '../src/index.js';

const program = new Command();
program
  .name('page-loader')
  .description('Page loader utility')
  .version('0.0.1')
  .argument('<url>')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, options) => getGeneralLogic(url, options.output)
    .then((newPath) => {
      console.log(newPath);
      process.exit();
    }))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
program.parseAsync();
