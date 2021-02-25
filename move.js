const fs = require('fs-extra');
const path = require('path');

const CSV = require('./CSV.ts');

const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/drafts/import/techcomm`;
const TARGET_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/publish`;

const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const csv = await fs.readFile('to_move.csv');
  const entries = CSV.toArray(csv.toString());
  
  console.log(entries);
  let moved = 0;
  let output = 'URL;\n';
  await asyncForEach(entries, async (item) => {
    const name = path.basename(item.source).trim();

    let sourcePath = path.join(SRC_FOLDER, `${item.source}`);

    const targetPath = path.join(TARGET_FOLDER, `${item.source.substring(item.source.indexOf('/') + 1)}`);
    if (!await fs.exists(sourcePath)) {
      console.log(`Source file ${sourcePath} does NOT exist. Not copying...`);
    } else if(await fs.exists(targetPath)) {
      console.log(`Target file ${targetPath} EXISTS!. Not copying...`);
    } else {

      console.log(`Target file ${targetPath} does not exist. Moving...`);
      
      if (!SIMULATION) {
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copyFile(sourcePath, targetPath, 'utf8');
        await fs.remove(sourcePath);
      }
      moved += 1;
      output += `https://blog.adobe.com/en/publish/${item.source}.html;\n`
      await fs.writeFile('moved.csv', output);
    }
  });
  console.log(`${moved} moved, ${entries.length} total.`);
}

main();