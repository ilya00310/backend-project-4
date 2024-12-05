/* eslint-disable import/prefer-default-export */
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import Listr from 'listr';
import { convertStr, defaultDebug } from './utils.js';

const { promises: fsp } = fs;
const getPathImg = (url) => (path.extname(url.pathname) ? path.join(url.host, url.pathname) : `${path.join(url.host, url.pathname)}.html`);

const htmlItems = {
  img: 'src',
  link: 'href',
  script: 'src',
};

const writeItems = (linkURL, pathNewFile, nameNewDir, data) => {
  const $ = cheerio.load(data);
  const infoTasks = [];

  const tagsWithUrls = $('img, link, script').toArray().filter((element) => {
    const tag = element.tagName;
    const attr = htmlItems[tag];
    const attrValue = element.attribs[attr];
    return attrValue && (attrValue.includes(linkURL.host) || attrValue.startsWith('/'));
  });
  tagsWithUrls.forEach((item) => {
    const tag = item.name;
    const attr = htmlItems[item.name];
    const pathImg = getPathImg(new URL(item.attribs[attr], linkURL.origin));
    const namFilePictures = convertStr(pathImg, /\/|\.(?=.*[.])/g);
    $(`${tag}[${attr} = "${item.attribs[attr]}"]`).attr(`${attr}`, path.join(nameNewDir, namFilePictures));
    const pathFile = path.join(pathNewFile, '..', nameNewDir, namFilePictures);
    infoTasks.push({ pathFile, linkFile: pathImg });
  });
  return { file: $.html(), tasks: infoTasks };
};

export const getLogicPicturesDownload = async (link, pathNewFile, nameNewDir, data) => {
  const pathNewDir = path.join(pathNewFile, '..', nameNewDir);
  defaultDebug('newPath %s', pathNewDir);
  return fsp.mkdir(pathNewDir)
    .then(() => {
      const linkURL = new URL(link);
      const { file, tasks } = writeItems(linkURL, pathNewFile, nameNewDir, data);
      const updateTasks = tasks.map(({ pathFile, linkFile }) => ({
        title: `${linkFile}`,
        task: () => axios.get(link, { responseType: 'arraybuffer' })
          .then(({ data: dataFile }) => fsp.writeFile(pathFile, dataFile, 'utf-8')),
      }));
      const newListr = new Listr(updateTasks, { concurrent: true });
      return newListr.run()
        .then(() => fsp.writeFile(pathNewFile, file, 'utf-8'));
    });
};
