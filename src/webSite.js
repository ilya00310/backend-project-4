/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const { promises: fsp } = fs;

export class WebSite {
  getWebSite(link) {
    return axios.get(link);
  }

  saveDataInFile(data, pathForDownload) {
    const pathDirectory = path.join(pathForDownload, '..');
    return fsp.stat(pathDirectory)
      .then(() => fsp.writeFile(pathForDownload, data, 'utf-8'))
      .catch(() => {
        throw new Error('don\'t exist direction');
      });
  }

  downloadDataWebSite(link, pathForDownload) {
    return this.getWebSite(link)
      .then((webSite) => {
        const { data } = webSite;
        return this.saveDataInFile(data, pathForDownload)
          .then(() => Promise.resolve());
      });
  }
}
