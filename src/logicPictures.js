/* eslint-disable import/prefer-default-export */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { convertStr } from './utils.js';

const { promises: fsp } = fs;

export const getLogicPicturesDownload = (pathFile, nameNewDir, link) => {
  const pathNewDir = path.join(pathFile, '..', nameNewDir);
  fsp.mkdir(pathNewDir)
    .finally(fsp.readFile(pathFile, 'utf-8')
      .then((data) => {
        const $ = cheerio.load(data);
        const pictures = $('body').find('img');
        Object.values(pictures).map(async (attr) => {
          if (attr.attribs) {
            const linkHost = new URL(link).host;
            const nameFilePicture = convertStr(path.join(linkHost, attr.attribs.src), /\/|\.(?!png)/g);
            return fsp.writeFile(path.join(pathNewDir, nameFilePicture), attr.attribs.src, 'utf-8')
              .finally(() => {
                $(`img[src ="${attr.attribs.src}"]`).attr('src', path.join(nameNewDir, nameFilePicture));
                return fsp.writeFile(pathFile, $.html(), 'utf-8')
                  .finally(async () => {
                    console.log(await fsp.readFile(pathFile, 'utf-8'));
                    return attr;
                  });
              });
          }
          return attr;
        });
      }));
};
