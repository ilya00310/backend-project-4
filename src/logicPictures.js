/* eslint-disable import/prefer-default-export */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { convertStr } from './utils.js';

const { promises: fsp } = fs;
const getPathImg = (url) => (path.extname(url.pathname) ? path.join(url.host, url.pathname) : `${path.join(url.host, url.pathname)}.png`);

export const getLogicPicturesDownload = (pathFile, nameNewDir, link) => {
  const pathNewDir = path.join(pathFile, '..', nameNewDir);

  return fsp.mkdir(pathNewDir)
    .then(() => fsp.readFile(pathFile, 'utf-8'))
    .then((data) => {
      const $ = cheerio.load(data);
      const dataPicturesFilter = Object.values($('body').find('img')).filter((item) => item.attribs);
      const promises = dataPicturesFilter.map((item) => {
        const linkURL = new URL(link);
        const newURL = new URL(item.attribs.src, linkURL.origin);
        const pathImg = getPathImg(newURL);
        const nameFilePicture = convertStr(pathImg, /\/|\.(?=.*[.])/g);
        // if (newURL.host !== linkURL.host) {
        //   return Promise.resolve();
        // }
        console.log(newURL.href)
        return axios.get(newURL.href, { responseType: 'arraybuffer' })
          .then((loadImg) => fsp.writeFile(path.join(pathNewDir, nameFilePicture), loadImg.data, 'utf-8'))
          .then(() => {
            $(`img[src = "${item.attribs.src}"]`).attr('src', path.join(nameNewDir, nameFilePicture));
            return fsp.writeFile(pathFile, $.html(), 'utf-8')
              .then(() => Promise.resolve());
          });
      });
      return Promise.all(promises)
        .finally(() => Promise.resolve());
    });
};
