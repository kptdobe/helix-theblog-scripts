const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const { JSDOM, Document } = require('jsdom');

const CSV = require('./CSV.ts');

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const csv = await fs.readFile('to_patch.csv');

  const entries = CSV.toArray(csv.toString());

  const outputFile = 'to_patch_fixed.csv';
  let output = 'url\n';
  await asyncForEach(entries, async (entry) => {
    const res = await fetch(entry.url);
    if (res.ok) {
      const html = await res.text();
      const { document } = (new JSDOM(html.toString())).window;
      const correctURL = document.querySelector('[rel="canonical"]').href;
      console.log(`${entry.url} = ${correctURL}`);
      output += `${correctURL}\n`;
      await fs.writeFile(outputFile, output);
    } else {
      console.error(`Invalid url: ${entry.url}`);
    }
  });
}

main();