const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const SRC_FOLDER = `/Users/acapt/work/dev/helix/helix-importer-projects/.cache/sparkmake/`;
const TARGET_FOLDER = `./output`;

const SIMULATION = false;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const entries = await fg('**/*.html', {
    cwd: SRC_FOLDER
  });
  
  let copied = 0;
  
  await asyncForEach(entries, async (src) => {
    const sourcePath = path.join(SRC_FOLDER, src);
    //console.log(sourcePath);

    const targetPath = path.join(TARGET_FOLDER, ...src.split('_'));
    
    if (!SIMULATION) {
      const p = path.parse(targetPath);
      await fs.ensureDir(p.dir);
      await fs.copyFile(sourcePath, targetPath);
    }
    

    copied++;
  });

  console.log(`${copied} copied.`);
}

main();