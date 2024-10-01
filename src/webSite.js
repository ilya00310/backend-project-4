/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLogicDataDownload } from './logicData.js';
import { getLogicPicturesDownload } from './logicPictures.js';

export class WebSite {
  downloadDataWebSite(link, pathNewFile, nameNewDir, webSite) {
    return getLogicDataDownload(link, pathNewFile, nameNewDir, webSite);
  }

  downloadPicture(pathFile, nameNewDir, link) {
    return getLogicPicturesDownload(pathFile, nameNewDir, link);
  }
}
