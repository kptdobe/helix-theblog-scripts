const fs = require('fs-extra');
const path = require('path');
const fetch = require('node-fetch');
const { JSDOM, Document } = require('jsdom');

const CSV = require('./CSV.ts');

const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/publish`;

const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const csv = await fs.readFile('to_patch.csv');

  const entries = CSV.toArray(csv.toString());
  
  let nbDocx = 0;
  let nbMd = 0;
  let dne = 0;
  const outputFile = 'apac_topics_docx.csv';
  let output = 'url;\n';
  await asyncForEach(entries, async (entry) => {
    const src = entry.url.substring(entry.url.indexOf('/en/publish/') + 12, entry.url.lastIndexOf('.html'));

    const sourcePath = path.join(SRC_FOLDER, src) + '.md';

    if (fs.existsSync(sourcePath)) {
      let md = await fs.readFile(sourcePath);
      if (md) {
        nbMd ++;
        let topics = [];
        let r = /^Topics\: ?(.*)$/gmi.exec(md);
        if (r && r.length > 0 && r[1] !== '') {
          topics = r[1].split(/\,\s*/);
        }

        topics.push('APAC');
        topics = topics.filter((topic) => topic.length > 0);
        
        console.log(topics);

        md = md.toString().replace(/^Topics\: ?(.*)$/gmi, `Topics: ${topics.join(', ')}`);

        if (!SIMULATION) {
          await fs.writeFile(sourcePath, md);
        }
      } else {
        console.error(`Empty MD found at ${sourcePath}`);
      }
    } else {
      if (fs.existsSync(path.join(SRC_FOLDER, src) + '.docx')) {
        console.warn(`Docx file: ${path.join(SRC_FOLDER, src) + '.docx'}`);
        nbDocx++;
        output += `${entry.url}\n`;
      } else {
        console.error(`No MD / No docx found at ${sourcePath}`);
        dne++;
      }
    }
  });
  await fs.writeFile(outputFile, output);
  console.log(`${nbMd}/${nbDocx}/${dne}`);
}

main();