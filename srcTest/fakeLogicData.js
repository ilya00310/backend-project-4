/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';

const { promises: fsp } = fs;
const getWebSite = (data) => Promise.resolve({ data });

const saveDataInFile = (data, pathForDownload) => {
  const pathDirectory = path.join(pathForDownload, '..');
  return fsp.stat(pathDirectory)
    .then(() => fsp.writeFile(pathForDownload, data, 'utf-8'))
    .catch(() => {
      throw new Error('don\'t exist direction');
    });
};
export const logicDataDownload = (link, pathForDownload, context) => getWebSite(context.data)
  .then((webSite) => {
    const { data } = webSite;
    return saveDataInFile(data, pathForDownload)
      .then(() => Promise.resolve());
  });
