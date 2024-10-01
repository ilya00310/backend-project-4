/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import path from 'path';

const { promises: fsp } = fs;
export const getLogicDataDownload = (link, pathNewFile, nameNewDir, webSite) => {
  const nameDir = path.join(pathNewFile, '..');
  return Promise.resolve(webSite.data)
    .then((data) => fsp.stat(nameDir)
      .then(() => fsp.writeFile(pathNewFile, data, 'utf-8'))
      .catch(() => {
        throw new Error('don\'t exist direction');
      }))
    .then(() => webSite.downloadPicture(pathNewFile, nameNewDir, link));
};
