/* eslint-disable import/prefer-default-export */
import { createRequire } from 'module';
import fs from 'fs';
import { defaultDebug } from './utils.js';

const { promises: fsp } = fs;

export const getLogicDataDownload = (link, pathNewFile, pathDirNewFile) => {
  const require = createRequire(import.meta.url);
  require('axios-debug-log');
  const axios = require('axios');
  return axios.get(link)
    .then(({ data }) => fsp.access(pathDirNewFile, fs.constants.R_OK)
      .then(() => {
        defaultDebug('dataFile %s ', data);
        return fsp.writeFile(pathNewFile, data, 'utf-8');
      })
      .catch((err) => {
        throw new Error(err);
      }));
};
