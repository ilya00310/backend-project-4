/* eslint-disable import/prefer-default-export */
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const { promises: fsp } = fs;
const getWebSite = (link) => axios.get(link);
const saveDataInFile = (data, pathNewFile) => {
  const pathDirectory = path.join(pathNewFile, '..');
  return fsp.stat(pathDirectory)
    .then(() => fsp.writeFile(pathNewFile, data, 'utf-8'))
    .catch(() => {
      throw new Error('don\'t exist direction');
    });
};

export const getLogicDataDownload = (link, pathNewFile) => getWebSite(link)
  .then((webSite) => {
    const { data } = webSite;
    return saveDataInFile(data, pathNewFile);
  });
