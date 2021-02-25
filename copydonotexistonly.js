const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const YEAR = '';//2012;
const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/drafts/import/acrolaw/${YEAR}`;
const TARGET_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/publish/${YEAR}`;

const SIMULATION = true;
const MOVE = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const entries = await fg('**/*.{md,docx}', {
    cwd: SRC_FOLDER
  });
  
  // console.log(entries);
  let copied = 0;
  
    await asyncForEach(entries, async (src) => {
    const sourcePath = path.join(SRC_FOLDER, src);
    const noExtension = src.substring(0, src.lastIndexOf('.'));
    const targetPath = path.join(TARGET_FOLDER, src);
    if (
      !fs.existsSync(path.join(TARGET_FOLDER, `${noExtension}.md`)) && 
      !fs.existsSync(path.join(TARGET_FOLDER, `${noExtension}.docx`))) {

      console.log(`Target file ${targetPath} does not exist. Copying...`);
      
      if (!SIMULATION) {
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copyFile(sourcePath, targetPath);
        if (MOVE) {
          await fs.remove(sourcePath);
        }
      }
      copied += 1;
      //const p = src.substring(0, src.length - 3);
      //await fs.writeFile('moved.csv', output);
    } else {
      // console.log(`Target file for ${sourcePath} EXISTS!. Not copying...`);
    }
  });
  console.log(`${copied} copied, ${entries.length} total.`);
}

main();