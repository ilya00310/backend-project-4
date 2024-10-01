/* eslint-disable import/prefer-default-export */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { convertStr } from './utils.js';

const { promises: fsp } = fs;

export const getLogicPicturesDownload = (pathFile, nameNewDir, link) => {
  const pathNewDir = path.join(pathFile, '..', nameNewDir);

  return fsp.mkdir(pathNewDir)
    .then(() => fsp.readFile(pathFile, 'utf-8'))
    .then((data) => {
      const $ = cheerio.load(data);
      const dataPicturesFilter = Object.values($('body').find('img')).filter((item) => item.attribs);
      const promises = dataPicturesFilter.map((item) => {
        const pathImg = path.join(new URL(link).host, item.attribs.src);
        const nameFilePicture = convertStr(pathImg, /\/|\.(?!png)/g);
        const linkURL = new URL(link);
        const newURL = new URL(item.attribs.src, linkURL.origin);
        // if () {
        //   return Promise.resolve();
        // }
        // console.log(new URL(item.attribs.src, linkURL.origin))
        return axios.get(newURL.href, { responseType: 'utf-8' })
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
