const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const SRC_FOLDER = `/Users/acapt/work/dev/helix/helix-importer-projects/output/sparkblog/round8`;
// const SRC_FOLDER = `/Users/acapt/work/dev/helix/helix-importer-projects/output/sparkmake/round7`;
const TARGET_FOLDER = `/Users/acapt/Adobe/CC Express - website/drafts/alex/import/md`;

const SIMULATION = true;
const MOVE = false;

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
    const targetPath = path.join(TARGET_FOLDER, src);

    let diff = false;
    if (fs.existsSync(targetPath)) {
      // compare content
      const s = await fs.readFile(sourcePath);
      const t = await fs.readFile(targetPath);

      if (s.toString() !== t.toString()) {
        console.log(`HAS DIFFERENT CONTENT - Target file ${targetPath} has different content. Copying...`);
        diff = true;
      }
    } else {
      console.log(`DOES NOT EXIST - Target file ${targetPath} does not exist. Copying...`);
      diff = true;
    }

    if (diff) {
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