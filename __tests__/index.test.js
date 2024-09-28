import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import nock from 'nock';
import { FakeWebsite } from '../__fixtures__/fakeWebsite.js';
import getGeneralLogic from '../index.js';

const { promises: fsp } = fs;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const getFixturePath = (fileName) => path.resolve(__dirname, '..', '__fixtures__', fileName);
const readFile = async (file) => {
  const dataFile = await fsp.readFile(getFixturePath(file), 'utf-8');
  return dataFile;
};
const expectedHTML = await readFile('file1.txt');

let currentPath;
let fakeWebSite;
beforeEach(async () => {
  currentPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});
beforeAll(() => {
  fakeWebSite = new FakeWebsite(expectedHTML);
});
test('connection test', async () => {
  const scope = nock(/ru\.hexlet\.io/)
    .get(/\/courses/)
    .reply(200);
  await getGeneralLogic('https://ru.hexlet.io/courses', currentPath);
  expect(scope.isDone()).toBe(true);
});
test('test get download file', async () => {
  const pathNewFile = await getGeneralLogic('https://ru.hexlet.io/courses', currentPath, fakeWebSite);
  const newFile = await fsp.readFile(pathNewFile, 'utf-8');
  expect(newFile).toBe(expectedHTML);
});
test('test with existing Directory', async () => {
  const pathDownloadSite = await getGeneralLogic('https://ru.hexlet.io/courses', currentPath, fakeWebSite);
  const regex = /\/tmp\/page-loader-X*\w*\/ru-hexlet-io-courses\.html/;
  expect(pathDownloadSite).toMatch(regex);
});
test('test without existing directory', () => {
  expect(() => getGeneralLogic('https://ru.hexlet.io/courses', `${currentPath}/err`, fakeWebSite).toThrow('don\'t exist direction'));
});
