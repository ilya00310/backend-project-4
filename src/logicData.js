/* eslint-disable import/prefer-default-export */
import { createRequire } from 'module';
import fs from 'fs';
import axios from 'axios';
import { defaultDebug } from './utils.js';

const { promises: fsp } = fs;

export const getLogicDataDownload = (link, pathDirNewFile) => {
  const require = createRequire(import.meta.url);
  require('axios-debug-log');
  return fsp.access(pathDirNewFile, fs.constants.R_OK)
    .then(() => axios.get(link))
    .then(({ data }) => {
      defaultDebug('dataFile %s ', data);
      return data;
    });
};
