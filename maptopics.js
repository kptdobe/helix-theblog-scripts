const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const CSV = require('./CSV.ts');

// CONFIG
const CSV_MAPPING_FILE = `./mappings/jp.csv`;
const OLD_TAG_COLUMN = 'OldTag'; // column with legacy blog tag
const TOPIC1_COLUMN = 'Topic1'; // column with corresponding Helix blog tag
const TOPIC2_COLUMN = 'Topic2'; // column with another corresponding Helix blog topic (some old tags map to 2 new topic)

const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/jp/publish`;
const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

const getMapping = async () => {
  const map = {};
  const csv = await fs.readFile(CSV_MAPPING_FILE);
  const entries = CSV.toArray(csv.toString());
  entries.forEach(item => {
    const old = item[OLD_TAG_COLUMN].toLowerCase().trim()
    map[old] = [];
    map[old].push(item[TOPIC1_COLUMN]);
    if (item[TOPIC2_COLUMN] && item[TOPIC2_COLUMN].trim() !== '') {
      map[old].push(item[TOPIC2_COLUMN]);
    }
  });
  return map;
}

const applyMapping = (array, mappings) => {
  const res = [];
  array.forEach(t => {
    const newTags = mappings[t.toLowerCase().trim()];
    if (newTags) {
      // found a mapping
      newTags.forEach(m => {
        res.push(m);
      });
    } else {
      // not found
      res.push(t);
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

  const mappings = await getMapping();
  
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

      const topicsT = applyMapping(topics.filter((topic) => topic.length > 0) || [], mappings);

      let products = [];
      r = /^Products\: ?(.*)$/gmi.exec(md);
      if (r && r.length > 0 && r[1] !== '') {
        products = r[1].split(/\,\s*/);
      }

      const productsT = applyMapping(products.filter((product) => product.length > 0) || [], mappings);

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