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
  .action((url, options) => {
    console.log(url);
    getGeneralLogic(url, options.output)
      .then((newPath) => {
        console.log(newPath);
      });
  });
program.parseAsync();
