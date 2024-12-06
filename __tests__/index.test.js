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
nock(/ru\.hexlet\.io/).persist()
  .get(/\/courses/)
  .replyWithFile(200, getFixturePath('ru-hexlet-io-courses_files/file1.html'), { 'Content-Type': 'utf-8' })
  .get(/\/404/)
  .replyWithFile(404, getFixturePath('ru-hexlet-io-courses_files/file1.html'), { 'Content-Type': 'utf-8' })
  .get(/\/500/)
  .replyWithFile(500, getFixturePath('ru-hexlet-io-courses_files/file1.html'), { 'Content-Type': 'utf-8' });

const fixturesInfo = [
  {
    regexPath: /\/assets\/professions\/nodejs.png/, itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    regexPath: /\/assets\/application.css/, itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
  },
  {
    regexPath: /\/packs\/js\/runtime.js/, itemPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
  },
];
beforeAll(async () => {
  fixturesInfo.forEach(({
    regexPath, itemPath,
  }) => nock(/ru\.hexlet\.io/)
    .persist()
    .get(regexPath)
    .replyWithFile(200, getFixturePath(itemPath)));
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
  test.each(fixturesInfo)('.check correct %s', async (currentFixinfo) => {
    const pathItem = currentFixinfo.itemPath;
    await getGeneralLogic(link, currentPath);
    const pathFileItem = path.join(currentPath, pathItem);
    const expectedItem = await fsp.readFile(getFixturePath(pathFileItem));
    expect(await fsp.readFile(pathFileItem)).toEqual(expectedItem);
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
  ])('.check exist %s %s', async (currentLink, pathForTest = currentPath) => {
    await expect(getGeneralLogic(currentLink, pathForTest)).rejects.toThrow();
  });
  test('wrong Link', async () => {
    await expect(getGeneralLogic('wrongLink', currentPath)).rejects.toThrow();
  });
  test('protect dir', async () => {
    await expect(getGeneralLogic(link, '/sys')).rejects.toThrow();
  });
});
