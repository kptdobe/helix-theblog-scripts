const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const SRC_FOLDER = `/Users/acapt/Adobe/Spark Helix - website`;
const TARGET_FOLDER = `/Users/acapt/Adobe/CC Express - Documents/website`;
const LASTDIFF = 1620119366235;

const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const entries = await fg('**/*.{docx,xlsx,xml}', {
    cwd: SRC_FOLDER,
    ignore: ['**/drafts/**', '**/query-index.xlsx']
  });
  
  let copied = 0;
  const outputFile = `output/diffcopy${new Date().getTime()}.csv`;
  let output = 'Status,File,\n';
  
  await asyncForEach(entries, async (src) => {
    const sourcePath = path.join(SRC_FOLDER, src);
    const targetPath = path.join(TARGET_FOLDER, src);

    let diff = false;
    const sStat = await fs.stat(sourcePath);
    if (fs.existsSync(targetPath)) {
      // compare content
      const tStat = await fs.stat(targetPath);

      if (sStat.mtimeMs !== tStat.mtimeMs && sStat.mtimeMs > LASTDIFF+1 && tStat.mtimeMs > LASTDIFF+1) {
        console.log(`BOTH FILES MODIFIED SINCE LAST IMPORT - ${sourcePath}.`);
        output += `File modified in Spark AND in Express in the last 24h -> CONFLICT,${src},\n`;
      } else if (sStat.mtimeMs > tStat.mtimeMs) {
        // console.log(`SOURCE FILE MODIFIED - ${sourcePath} has been modified after target file.`);
        diff = true;
        output += `Modified in Spark -> updated in Express,${src},\n`;
      } else if (tStat.mtimeMs > sStat.mtimeMs) {
        // console.log(`TARGET FILE MODIFIED - ${targetPath} has been modified after source file. DOING NOTHING`);
        if (tStat.mtimeMs > LASTDIFF+1) {
          output += `New modified in Express -> do nothing,${src},\n`;
        } else {
          output += `Updated once in Express -> do nothing,${src},\n`;
        }
      // } else {
        // console.log(`NOT SAME SIZE BUT SAME DATE... ? ${targetPath}`);
      }
    } else {
      // console.log(`DOES NOT EXIST - Target file ${targetPath} does not exist. Copying...`);
      output += `New in Spark -> created in Express,${src},\n`;
      diff = true;
    }

    if (diff) {
      console.log(`Copying file - ${sourcePath}.`);
      if (!SIMULATION) {
        await fs.ensureDir(path.dirname(targetPath));
        await fs.copyFile(sourcePath, targetPath);
        await fs.utimes(targetPath, sStat.atime, sStat.mtime);
      }
      copied += 1;
    }
  });
  await fs.writeFile(outputFile, output);
  console.log(`${copied} copied, ${entries.length} total.`);
}

main();