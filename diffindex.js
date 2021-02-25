const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const CSV = require('./CSV.ts');

const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/publish`;

const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const entries = await fg('**/*.{md,docx}', {
  // const entries = await fg('**/*.md', {
    cwd: SRC_FOLDER
  });
  
  const csv = await fs.readFile('index.csv');

  const index = CSV.toArray(csv.toString());
  
  let output = 'MissingInIndex;\n';

  let notfound = 0;
  await asyncForEach(entries, async (src) => {
    const name = src
      .substring(0, src.lastIndexOf('.'))
      .replace(/\s/gm, '-')
      .replace(/\=/gm, '-')
      .toLowerCase()
    const url = `en/publish/${name}.html`;
    if (!index.find(e => e.URL.toLowerCase() === url)) {
      // const sourcePath = path.join(SRC_FOLDER, src);
      console.log(`Not in index: ${src}`);
      notfound++;
    }
  });
  console.log(`${notfound} not found, ${entries.length} total.`);
}

main();
