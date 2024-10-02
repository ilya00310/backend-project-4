/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const { promises: fsp } = fs;

export const getLogicDataDownload = (link, pathNewFile) => {
  const nameDir = path.join(pathNewFile, '..');

  return axios.get(link)
    .then(({ data }) => fsp.stat(nameDir)
      .then(() => fsp.writeFile(pathNewFile, data, 'utf-8'))
      .catch(() => {
        throw new Error('don\'t exist direction');
      }));
};
