import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import getGeneralLogic from '../index.js';
import { getURL } from '../src/utils.js';

const { promises: fsp } = fs;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (fileName) => path.resolve(__dirname, '..', '__fixtures__', fileName);

nock.disableNetConnect();

const expectedHTML = await fsp.readFile(getFixturePath('file1.txt', 'utf-8'));
const afterHTML = await fsp.readFile(getFixturePath('file2.txt'), 'utf-8');
const expectedImg = await fsp.readFile(getFixturePath('assets/professions/nodejs.png', null));
let currentPath;
const link = 'https://ru.hexlet.io/courses';
const getNock = (pathData, expectedData) => nock(/ru\.hexlet\.io/)
  .get(pathData)
  .times(Infinity)
  .reply(200, expectedData);
beforeEach(async () => {
  currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});
beforeAll(() => {
  getNock(/\/courses/, expectedHTML);
  getNock(/\/assets\/professions\/nodejs.png/, expectedImg);
  getNock(/\/assets\/application.css/, expectedHTML);
  getNock(/\/packs\/js\/runtime.js/);
});
test('Test download data', async () => {
  const pathDownloadSite = await getGeneralLogic(link, currentPath);
  const newFile = await fsp.readFile(pathDownloadSite, 'utf-8');
  const regex = /\/tmp\/page-loader-X*\w*\/ru-hexlet-io-courses\.html/;
  expect(newFile).toBe(afterHTML);
  expect(pathDownloadSite).toMatch(regex);
  await expect(() => getGeneralLogic(link, `${currentPath}/err`).toThrow('don\'t exist direction'));
});
test('test download pictures', async () => {
  const pathDownloadSite = await getGeneralLogic(link, currentPath);
  const pathFilePicture = path.join(pathDownloadSite, '..', getURL(link, '_files'), 'ru-hexlet-io-assets-professions-nodejs.png');
  await expect(() => fsp.stat(pathFilePicture).resolve.not.toThrow());
  await expect(() => fsp.readFile(pathFilePicture, 'utf-8').toBe('ru-hexlet-io-assets-professions-nodejs.png'));
});
test('test download ', async () => {
  const pathDownloadSite = await getGeneralLogic(link, currentPath);
  const pathFilePicture = path.join(pathDownloadSite, '..', getURL(link, '_files'), 'ru-hexlet-io-assets-professions-nodejs.png');
  await expect(() => fsp.stat(pathFilePicture).resolve.not.toThrow());
  await expect(() => fsp.readFile(pathFilePicture, 'utf-8').toBe('ru-hexlet-io-assets-professions-nodejs.png'));
});
