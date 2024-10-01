/* eslint-disable import/prefer-default-export */

import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Console } from 'console';
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
        const linkURL = new URL(link);
        const pathImg = path.join(new URL(link).host, item.attribs.src);
        const nameFilePicture = convertStr(pathImg, /\/|\.(?!png)/g);
        const newURL = new URL(item.attribs.src, linkURL.origin);
        // console.log(newURL, linkURL)
        if (newURL.origin !== linkURL.origin) {
          return Promise.resolve;
        }
        console.log(newURL.href)
        return axios.get(newURL.href, { responseType: 'utf-8' })
          .then((loadImg) => fsp.writeFile(path.join(pathNewDir, nameFilePicture), loadImg.data, 'utf-8'))
          .finally(() => {
            $(`img[src = "${item.attribs.src}"]`).attr('src', path.join(nameNewDir, nameFilePicture));
            return fsp.writeFile(pathFile, $.html(), 'utf-8')
              .then(() => Promise.resolve());
          });
      });
      return Promise.all(promises)
        .finally(() => Promise.resolve());
    });
};
// https://cdn2.hexlet.io/assets/partners_logos/tinkoff-23252dd2fdde061db6881b91a5c48da614c5aadb5961a5ff3ad356949de8c96b.svg
