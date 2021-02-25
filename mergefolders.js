const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/drafts/import/techcomm`;
const TARGET_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/publish`;
//const TARGET_FOLDER = `/Users/acapt/Downloads/theblogtmp`;



const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const entries = await fg('**/*.{md,docx}', {
    cwd: SRC_FOLDER
  });
  
  let copied = 0;
  await asyncForEach(entries, async (src) => {
    const sourcePath = path.join(SRC_FOLDER, src);
    const name = path.basename(sourcePath, path.extname(sourcePath)).trim();
    const targetPath = path.join(TARGET_FOLDER, src);
    const segment = path.dirname(src);
    if (
      !fs.existsSync(path.join(TARGET_FOLDER, segment, `${name}.md`)) && 
      !fs.existsSync(path.join(TARGET_FOLDER, segment, `${name}.docx`))) {

      console.log(`Copying ${targetPath}`);
      
      if (!SIMULATION) {
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copyFile(sourcePath, targetPath, 'utf8');
      }
      copied += 1;
    } else {
      console.log(`Target file for ${sourcePath} EXISTS!. Not copying...`);
    }
  });
  console.log(`${copied} copied, ${entries.length} total.`);
}

main();