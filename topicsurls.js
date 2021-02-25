const fs = require('fs-extra');
const path = require('path');

const { getTaxonomy } = require('./taxonomy');

function encodeForFileName(title) {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/\s/gm, '-') // replace whitespace with -
    .replace(/\&amp;/gm,'') // remove encoded ampersands
    .replace(/\&/gm,'')  // remove unencoded ampersands
    .replace(/\./gm,'') // remove dots
    .replace(/\#/gm,'') // remove #
    .replace(/\-\-+/g,'-'); // remove multiple dashes
}

async function main() {
  const taxonomy = await getTaxonomy('https://theblog--adobe.hlx.page/en/topics/_taxonomy.json');
  const topics = taxonomy.getAll();
  
  topics
    .forEach((item) => {
      if (item.link) {
        console.log(item.link);
      } else {
        console.log(`https://blog.adobe.com/ko/topics/${encodeForFileName(item.name)}.html`)
      }
    });
  
}

main();