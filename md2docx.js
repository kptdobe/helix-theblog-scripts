const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

const unified = require('unified');
const remark = require('remark-parse');
const gfm = require('remark-gfm');
const { remarkMatter } = require('@adobe/helix-markdown-support');
const mdast2docx = require('@adobe/helix-word2md/src/mdast2docx');

const SOURCE_MD = `/Users/acapt/work/dev/helix/helix-importer-projects/output/sparkmake/round7/express/create/logo/esports.md`;
const TARGET_FILE = `/Users/acapt/Downloads/esports.docx`;



async function main() {
  const md = await fs.readFile(SOURCE_MD);
  const mdast = unified()
    .use(remark, { position: false })
    .use(gfm)
    .use(remarkMatter)
    .parse(md);

  const buffer = await mdast2docx(mdast);
  await fs.writeFile(TARGET_FILE, buffer);
}

main();