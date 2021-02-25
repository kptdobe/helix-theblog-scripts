const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const SRC_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/drafts/import`;
const TARGET_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/en/publish`;

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
  
  let output = 'URL;file;source;\n';

  await asyncForEach(entries, async (src) => {
    const sourcePath = path.join(SRC_FOLDER, src);
    const name = path.basename(sourcePath, path.extname(sourcePath)).trim();
    let dest = src.substring(src.indexOf('/') + 1, src.length - 3);
    let targetPath = path.join(TARGET_FOLDER, dest);
    let renamed = false;
    if (
      await fs.exists(`${targetPath}.md`) || 
      await fs.exists(`${targetPath}.docx`)) {
        targetPath += '-uk';
        dest += '-uk';
        renamed = true;
    } 

    console.log(`Target file ${targetPath} does not exist. Copying...`);
    
    const targetFile = `${targetPath}.md`;
    if (!SIMULATION) {
      await fs.ensureDir(path.dirname(targetFile));
      await fs.copyFile(sourcePath, targetFile, 'utf8');
      if (MOVE) {
        await fs.remove(sourcePath);
      }
    }
    copied += 1;

    output += `https://blog.adobe.com/en/publish/${dest}.html;en/publish/${dest}.md;${src};${renamed}\n`
    await fs.writeFile('moveduk.csv', output);
  });
  console.log(`${copied} copied, ${entries.length} total.`);
}

main();