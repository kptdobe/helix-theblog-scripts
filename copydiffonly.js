const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

// const SRC_FOLDER = `/Users/acapt/work/dev/helix/theblog/theblog-regional-importer/output/sparkmake/round3`;
// const TARGET_FOLDER = `/Users/acapt/Adobe/CC Express - website`;
const SRC_FOLDER = `/Users/acapt/work/dev/helix/helix-importer-projects/output/creative/fr`;
const TARGET_FOLDER = `/Users/acapt/Adobe/The Blog - Documents/theblog/fr/publish`;

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
  
  // console.log(entries);
  let copied = 0;
  
  //let output = 'AdobeLifeURL;HelixURL;\n';

  await asyncForEach(entries, async (src) => {
    const sourcePath = path.join(SRC_FOLDER, src);
    const targetPath = path.join(TARGET_FOLDER, src);

    let diff = false;
    if (fs.existsSync(targetPath)) {
      // compare content
      const s = await fs.readFile(sourcePath);
      const t = await fs.readFile(targetPath);

      if (s.toString() !== t.toString()) {
        console.log(`Target file ${targetPath} has different content. Copying...`);
        diff = true;
      }
    } else {
      console.log(`Target file ${targetPath} does not exist. Copying...`);
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