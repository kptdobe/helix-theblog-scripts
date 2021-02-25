const fs = require('fs-extra');
const path = require('path');

const { getTaxonomy } = require('./taxonomy');

const TOPICS_FOLDER = '/Users/acapt/Adobe/The Blog - Documents/theblog/en/topics';

async function getTopicFiles() {
  let files = await fs.readdir(TOPICS_FOLDER);
  return files
    .filter((f) => f.indexOf('.') !== 0 && f.indexOf('_') !== 0)
    .map(f => path.basename(f, path.extname(f)));
}

function encodeForFileName(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s/gm, '-') // replace whitespace with -
    .replace(/\&amp;/gm,'') // remove encoded ampersands
    .replace(/\&/gm,'')  // remove unencoded ampersands
    .replace(/\./gm,'') // remove dots
    .replace(/\-\-+/g,'-'); // remove multiple dashes
}

async function main() {
  const taxonomy = await getTaxonomy('https://theblog--adobe.hlx.page/en/topics/_taxonomy.json');
  const topics = taxonomy.getAllUFT();
  const files = await getTopicFiles();
  const lowercaseFiles = files.map(f => f.toLowerCase());

  const caseIssue = [];
  const missingFile = [];

  topics
    .map(item => encodeForFileName(item.name))
    .forEach((topic) => {
      let index = files.indexOf(topic);
      if (index !== -1) {
        files.splice(index, 1);
        lowercaseFiles.splice(index, 1);
      } else {
        index = lowercaseFiles.indexOf(topic.toLowerCase());
        if (index !== -1) {
          files.splice(index, 1);
          lowercaseFiles.splice(index, 1);
          console.warn(`Case issue for topic: ${topic}`);
          caseIssue.push(topic);
        } else {
          console.error(`Missing file for topic: ${topic}`);
          missingFile.push(topic);
        }
      }
    })
  //const files = await getTopicFiles();
  //console.log(topics);
  files.forEach((file) => {
    console.log(`Potentially useless file: ${file}`);
  })

  console.log();
  console.log('Slack output:');
  console.log(`- Missing a file for the topics: \`${missingFile.join('\`, \`')}\``);
  console.log(`- Uppercase / lowercase issue in file name for the topics: \`${caseIssue.join('\`, \`')}\``);
  console.log(`- Potentially useless files (to be checked individually): \`${files.join('\`, \`')}\``);
  
}

main();