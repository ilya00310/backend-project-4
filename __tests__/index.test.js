import { promises as fsp } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import getGeneralLogic from '../index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (fileName) => path.resolve(__dirname, '..', '__fixtures__', fileName);

nock.disableNetConnect();
let currentPath;
const link = 'https://ru.hexlet.io/courses';
const getNockPersist = () => nock(/ru\.hexlet\.io/).persist();
getNockPersist()
  .get(/\/courses/)
  .replyWithFile(200, getFixturePath('ru-hexlet-io-courses_files/file1.html'), { 'Content-Type': 'utf-8' });
getNockPersist()
  .get(/\/404/)
  .replyWithFile(404, getFixturePath('ru-hexlet-io-courses_files/file1.html'), { 'Content-Type': 'utf-8' });
getNockPersist()
  .get(/\/500/)
  .replyWithFile(500, getFixturePath('ru-hexlet-io-courses_files/file1.html'), { 'Content-Type': 'utf-8' });

const fixturesInfo = [
  {
    regexPath: /\/assets\/professions\/nodejs.png/, encoding: null, itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    regexPath: /\/assets\/application.css/, encoding: null, itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
  },
  {
    regexPath: /\/packs\/js\/runtime.js/, encoding: 'utf-8', itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
  },
];
beforeAll(async () => {
  fixturesInfo.map(({
    regexPath, itemPath, encoding, status,
  }) => getNockPersist()
    .get(regexPath)
    .replyWithFile(status, getFixturePath(itemPath), { 'Content-Type': encoding }));
});
describe('page-loader: success', () => {
  beforeEach(async () => {
    currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });

  test('check HTML File', async () => {
    await getGeneralLogic(link, currentPath);
    const afterHTML = await fsp.readFile(getFixturePath('ru-hexlet-io-courses_files/file2.html'), 'utf-8');
    const newFile = await fsp.readFile(path.join(currentPath, 'ru-hexlet-io-courses.html'), 'utf-8');
    expect(newFile).toBe(afterHTML);
  });
  test.each(fixturesInfo.map(({ itemPath }) => itemPath))('.check correct %s %s %s', async (pathItem, extension = null) => {
    await getGeneralLogic(link, currentPath);
    const pathFileItem = path.join(currentPath, pathItem);
    const expectedItem = await fsp.readFile(getFixturePath(pathFileItem), extension);
    expect(await fsp.readFile(pathFileItem, extension)).toEqual(expectedItem);
  });
});
describe('page-loader: error', () => {
  beforeEach(async () => {
    currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  });
  test('write in file', async () => {
    const pathNewFile = path.join(currentPath, 'newFile');
    await fsp.writeFile(pathNewFile, '', 'utf-8');
    await expect(getGeneralLogic(link, pathNewFile)).rejects.toThrow();
  });
  test.each([
    ['https://ru.hexlet.io/404'],
    ['https://ru.hexlet.io/500'],
    [link, '/sys'],
    ['wrongLink'],
  ])('.check exist %s %s', async (currentLink, pathForTest = currentPath) => {
    await expect(getGeneralLogic(currentLink, pathForTest)).rejects.toThrow();
  });
});
