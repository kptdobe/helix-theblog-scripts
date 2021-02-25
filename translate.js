const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const LANG = 'es';
const TRANSLATION_FILE = `./translations/${LANG}.json`;
const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/${LANG}/publish`;
// const SRC_FOLDER = `/Users/acapt/Downloads/wip/${LANG}`;
const ENGLISH_TAG = 'English Tag';

const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

const getTranslations = async () => {
  const trans = {
    en: {},
    loc: {}
  };
  const json = await fs.readJSON(TRANSLATION_FILE);
  if (json && json.data) {
    json.data.forEach(item => {
      const ori = item[ENGLISH_TAG].toLowerCase();
      if (!trans.en[ori]) {
        const l1 = item['Level 3'] ? item['Level 3'].trim() : '';
        const l2 = item['Level 2'] ? item['Level 2'].trim() : '';
        const l3 = item['Level 1'] ? item['Level 1'].trim() : '';
        const name = l1 || l2 || l3; 
        trans.en[ori] = {
          name,
          isProduct: item.Type === 'Products'
        };
        trans.loc[name.toLowerCase()] = {
          name,
          isProduct: item.Type === 'Products'
        };
      } else {
        trans.en[ori].isProduct = trans.en[ori].isProduct || item.Type === 'Products';
        const name = trans.en[ori].name.toLowerCase();
        trans.loc[name].isProduct = trans.loc[name].isProduct || item.Type === 'Products';
      }
    });
  }
  return trans;
}

const translate = (array, translations) => {
  const res = [];
  array.forEach(t => {
    const trans = translations.en[t.toLowerCase()];
    if (trans) {
      // found translation
      res.push(trans.name);
    } else {
      const loc = translations.loc[t.toLowerCase()];
      if (loc && loc !== t) {
        // found case difference
        res.push(loc.name);
      } else {
        // not found
        res.push(t);
      }
    }
  });
  return res.filter((t, i) => res.indexOf(t) === i);
}

const diffArray = (a, b) => {
  const bSorted = b.slice().sort();
  return a.length === b.length && a.slice().sort().every(function(value, index) {
    return value === bSorted[index];
  });
}

async function main() {
  const entries = await fg('**/*.md', {
    cwd: SRC_FOLDER
  });

  const translations = await getTranslations();
  
  let count = 0;
  let total = 0;
  await asyncForEach(entries, async (src) => {
    const sourcePath = path.join(SRC_FOLDER, src);

    let md = await fs.readFile(sourcePath);

    if (md) {
      let topics = [];
      let r = /^Topics\: ?(.*)$/gmi.exec(md);
      if (r && r.length > 0 && r[1] !== '') {
        topics = r[1].split(/\,\s*/);
      }

      const topicsT = translate(topics.filter((topic) => topic.length > 0) || [], translations);

      let products = [];
      r = /^Products\: ?(.*)$/gmi.exec(md);
      if (r && r.length > 0 && r[1] !== '') {
        products = r[1].split(/\,\s*/);
      }

      const productsT = translate(products.filter((product) => product.length > 0) || [], translations);

      if (!diffArray(topics, topicsT) || !diffArray(products, productsT)) {
        console.log(topics, topicsT);
        console.log(products, productsT);

        md = md.toString().replace(/^Topics\: ?(.*)$/gmi, `Topics: ${topicsT.join(', ')}`);
        md = md.replace(/^Products\: ?(.*)$/gmi, `Products: ${productsT.join(', ')}`);

        if (!SIMULATION) {
          await fs.writeFile(sourcePath, md);
        }
        count++;
      }
      total++;
    } else {
      console.error(`No MD found at ${sourcePath}`);
    }
  });
  console.log(`Number of files updated: ${count}/${total}.`);
}

main();