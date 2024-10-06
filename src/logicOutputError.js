/* eslint-disable import/prefer-default-export */
import fs from 'fs';

const { promises: fsp } = fs;

export const getOutputError = (error, pathNewFile, pathDirNewFile) => {
  console.log(error);
  if (Object.hasOwn(error, 'config')) {
    const link = error.config.url;
    const { status } = error;
    return Promise.resolve(`status answer from ${link}: ${status}`);
  }

  return fsp.stat(pathNewFile)
    .then(() => `Don't have access for directory ${pathDirNewFile}`)
    .catch(() => `Directory ${pathDirNewFile} don't exist`);
};
