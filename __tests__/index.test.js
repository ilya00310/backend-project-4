import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import { FakeWebsite } from '../srcTest/fakeWebsite.js';
import getGeneralLogic from '../index.js';
import { getURL } from '../src/utils.js';

const { promises: fsp } = fs;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (fileName) => path.resolve(__dirname, '..', '__fixtures__', fileName);
const readFile = async (file) => {
  const dataFile = await fsp.readFile(getFixturePath(file), 'utf-8');
  return dataFile;
};
const expectedHTML = await readFile('file1.txt');
const afterHTML = await readFile('file2.txt');
let currentPath;
let fakeWebSite;
const link = 'https://ru.hexlet.io/courses';
beforeEach(async () => {
  currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});
beforeAll(() => {
  fakeWebSite = new FakeWebsite(expectedHTML);
});
test('Test connection/change files', async () => {
  const scope = nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200, expectedHTML);
  const pathDownloadSite = await getGeneralLogic(link, currentPath);
  const newFile = await fsp.readFile(pathDownloadSite, 'utf-8');
  expect(newFile).toBe(afterHTML);
  expect(scope.isDone()).toBe(true);
});

test('test with existing Directory', async () => {
  const pathDownloadSite = await getGeneralLogic(link, currentPath, fakeWebSite);
  const regex = /\/tmp\/page-loader-X*\w*\/ru-hexlet-io-courses\.html/;
  expect(pathDownloadSite).toMatch(regex);
});
test('test without existing directory', async () => {
  await expect(() => getGeneralLogic(link, `${currentPath}/err`, fakeWebSite).toThrow('don\'t exist direction'));
});

test('test download pictures', async () => {
  const pathDownloadSite = await getGeneralLogic(link, currentPath, fakeWebSite);
  const pathFilePicture = path.join(pathDownloadSite, '..', getURL(link, '_files'), 'ru-hexlet-io-assets-professions-nodejs.png');
  await expect(() => fsp.stat(pathFilePicture).resolve.not.toThrow());
  await expect(() => fsp.readFile(pathFilePicture, 'utf-8').toBe('ru-hexlet-io-assets-professions-nodejs.png'));
});
