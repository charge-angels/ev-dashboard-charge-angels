import { promises as fs } from 'fs';

import { addedDiff, deletedDiff } from 'deep-object-diff';

import { Constants } from '../src/app/utils/Constants';

class I18nChecker {

  public static async compare(): Promise<void> {
    try {
      const contentEN = await fs.readFile('./src/assets/i18n/en.json', 'utf8');
      const otherLanguages = Constants.SUPPORTED_LANGUAGES.filter((lang) => (lang !== 'en') ? lang : null);
      const otherFiles = otherLanguages.map((language) => language + '.json');
      const parsedContentEN = JSON.parse(contentEN);
      for (const file of otherFiles) {
        try {
          const contentOtherLanguage = await fs.readFile('./src/assets/i18n/' + file, 'utf8');
          const parsedContentOtherLanguage = JSON.parse(contentOtherLanguage);
          const added = addedDiff(parsedContentEN, parsedContentOtherLanguage);
          const deleted = deletedDiff(parsedContentEN, parsedContentOtherLanguage);
          if (Object.keys(added).length > 0) {
            console.log('Added in language ' + file);
            console.log(added);
          }
          if (Object.keys(deleted).length > 0) {
            console.log('Deleted in language ' + file);
            console.log(deleted);
          }
          if (Object.keys(added).length === 0 && Object.keys(deleted).length === 0) {
            I18nChecker.compareContent(parsedContentEN, parsedContentOtherLanguage, file);
          }
        } catch (err) {
          console.log('File not found or with wrong format: ' + file);
          continue;
        }
      }
    } catch (err) {
      console.log('English file not found.');
      throw err;
    }
  }

  private static compareContent(originalLanguage: JSON, comparedLanguage: JSON, file: string): void {
    let noIssue = true;
    for (const keyName of Object.keys(originalLanguage)) {
      if (typeof originalLanguage[keyName] !== 'string') {
        continue;
      }
      if (originalLanguage[keyName].trim() === comparedLanguage[keyName].trim()) {
        console.log('Content `' + keyName + '` probably not yet translated into ' + file + ' (current value is: `' + originalLanguage[keyName] + '`)');
        noIssue = false;
      }
    }
    if (noIssue) {
      console.log('No issue found for: ' + file);
    }
  }
}

// Start
I18nChecker.compare().catch((error) => {
  console.log(error.message);
});
