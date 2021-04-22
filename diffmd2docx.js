const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const unified = require('unified');
const remark = require('remark-parse');
const gfm = require('remark-gfm');
const { remarkMatter } = require('@adobe/helix-markdown-support');
const mdast2docx = require('@adobe/helix-word2md/src/mdast2docx');

const TARGET_FOLDER = `/Users/acapt/Adobe/CC Express - website/`;
// const TARGET_FOLDER = `/Users/acapt/Adobe/CC Express - website/drafts/alex/test`;

const SIMULATION = true;

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

async function main() {
  const entries = await fg('**/*.md', {
    cwd: TARGET_FOLDER,
    ignore: ['old/**', 'drafts/**', 'security/**']
  });

  let converted = 0;
  
  console.log(`Will check ${entries.length} md files.`);

  await asyncForEach(entries, async (src) => {
    console.log(`Analyzing ${src}`);
    const mdFilePath = path.join(TARGET_FOLDER, src);
    const docxFilePath = mdFilePath.replace(/\.md$/, '.docx');
    
    if (!fs.existsSync(docxFilePath)) {
      let retry = 3;
      do {
        try {
          const start = new Date().getTime();
          console.log(`Starting conversion of ${mdFilePath}`);

          const md = await fs.readFile(mdFilePath);
          const mdast = unified()
            .use(remark, { position: false })
            .use(gfm)
            .use(remarkMatter)
            .parse(md);

          const buffer = await mdast2docx(mdast);
          await fs.writeFile(docxFilePath, buffer);
          await fs.remove(mdFilePath);
          console.log(`Created ${docxFilePath} in ${new Date().getTime() - start} ms.`);
          converted++;
          retry = -1;
        } catch (error) {
          retry--;
        }
        if (retry === 0) {
          console.error(`Could not convert ${mdFilePath} even after 3 retries.`);
        }
      } while (retry > 0);
    }
  });

  console.log(`Converted ${converted}, ${entries.length} total.`);
}

main();