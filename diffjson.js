const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');
const CSV = require('./CSV.ts');

const TARGET_FOLDER = `/Users/acapt/Adobe/CC Express - website`;

const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const entries = await fg('**/*.md', {
    cwd: TARGET_FOLDER,
    ignore: ['old/**', 'express/learn/blog/authors/**', 'express/learn/blog/tags/**', 'express/learn/blog/category/**']
  });

  let csv = await fs.readFile('url-mapping.csv');
  const allEntries = CSV.toArray(csv.toString());
  const urlMapping = {};
  allEntries.forEach(e => {
    let u = e.Target;
    if (u.lastIndexOf('/') === u.length - 1) {
      u = u.substring(0, u.length-1);
    }
    urlMapping[u.toLowerCase()] = e.URL.toLowerCase();
  });
  
  let missing = 0;
  
  await asyncForEach(entries, async (src) => {
    const url = 'https://' + path.join('www.adobe.com/', src).replace('.md', '');

    if (!urlMapping[url]) {
      // console.log(`Unknown url for md file ${src} - ${url}`);
      console.log(`rm -fr ${src}`);
      missing++;
    }

    // let diff = false;
    // if (fs.existsSync(targetPath)) {
    //   // compare content
    //   const s = await fs.readFile(sourcePath);
    //   const t = await fs.readFile(targetPath);

    //   if (s.toString() !== t.toString()) {
    //     console.log(`HAS DIFFERENT CONTENT - Target file ${targetPath} has different content. Copying...`);
    //     diff = true;
    //   }
    // } else {
    //   console.log(`DOES NOT EXIST - Target file ${targetPath} does not exist. Copying...`);
    //   diff = true;
    // }

    // if (diff) {
    //   if (!SIMULATION) {
    //     await fs.ensureDir(path.dirname(targetPath));
    //     await fs.copyFile(sourcePath, targetPath);
    //     if (MOVE) {
    //       await fs.remove(sourcePath);
    //     }
    //   }
    //   copied += 1;
    //   //const p = src.substring(0, src.length - 3);
    //   //await fs.writeFile('moved.csv', output);
    // } else {
    //   // console.log(`Target file for ${sourcePath} EXISTS!. Not copying...`);
    // }
  });
  console.log(`${missing} missing, ${entries.length} total.`);
}

main();