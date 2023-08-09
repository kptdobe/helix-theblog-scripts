const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');
const Excel = require('exceljs');

const SRC_FOLDER = `/Users/acapt/Adobe/Spark Helix - Documents/website`;
const TARGET_FOLDER = `/Users/acapt/Adobe/CC Express - Documents/website`;

const LANG = ['br', 'cn', 'de', 'dk', 'es', 'fi', 'fr', 'it', 'jp', 'kr', 'nl', 'no', 'se', 'tw'];

const getLang = (src) => {
  const f = src.split('/')[0];
  if (f === 'express') return 'en';
  if (LANG.indexOf(f) !== -1) {
    return f;
  }
  return '';
}

async function main() {
  const srcEntries = await fg('**/*.{docx,xlsx,xml}', {
    cwd: SRC_FOLDER,
    ignore: ['**/drafts/**', '**/query-index.xlsx']
  });

  const targetEntries = await fg('**/*.{docx,xlsx,xml}', {
    cwd: TARGET_FOLDER,
    ignore: ['**/drafts/**', '**/query-index.xlsx']
  });
  
  const data = [];
  
  data.push(['Locale', 'File', 'File in Spark', 'File in Express']);
  
  const srcs = {};
  srcEntries.forEach(e => { srcs[e] = true});
  const targets = {};
  targetEntries.forEach(e => { targets[e] = true});

  srcEntries.forEach(e => {
    const l = getLang(e);
    if (targets[e]) {
      data.push([l,e, 'Y', 'Y']);
      delete targets[e];
    } else {
      data.push([l,e, 'Y', 'N']);
    }
  });

  for (let e in targets) {
    const l = getLang(e);
    data.push([l,e, 'N', 'Y']);
  }

  const workbook = new Excel.Workbook();
  const sheet = workbook.addWorksheet('helix-default');
  sheet.addRows(data);
  
  const outputFile = `output/diff${new Date().getTime()}.xlsx`;
  await workbook.xlsx.writeFile(outputFile);
}

main();