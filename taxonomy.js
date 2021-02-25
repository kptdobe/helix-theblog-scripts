const fetch = require('node-fetch');

const HEADERS = {
  level1: 'Level 1',
  level2: 'Level 2',
  level3: 'Level 3',
  hidden: 'Hidden',
  link: 'Link',
  type: 'Type',
  excludeFromMetadata: 'ExcludeFromMetadata'
}

const escapeTopic = (topic) => {
  if (!topic) return null;
  return topic.replace(/\n/gm, ' ').trim();
}

async function getTaxonomy(url) {
  return fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((json) => {

      const _data = {
        topics: {},
        categories: {},
        children: {},
        visible: [],
        all: []
      };

      const H = HEADERS;
      let level1, level2;
      json.data.forEach((row, index) => {
        let level = 3;
          const level3 = escapeTopic(row[H.level3] !== '' ? row[H.level3] : null);
          if (!level3) {
            level = 2;
            level2 = escapeTopic(row[H.level2] !== '' ? row[H.level2] : null);
            if (!level2) {
              level = 1;
              level1 = escapeTopic(row[H.level1]);
            }
          }

          const name = level3 || level2 || level1

          // skip duplicates
          if (_data.topics[name]) return;

          let link = row[H.link] !== '' ? row[H.link] : null;
          // if (link) {
          //   const u = new URL(link);
          //   const current = new URL(window.location.href);
          //   link = `${current.origin}${u.pathname}`;
          // }

          const item = {
            name,
            level,
            level1,
            level2,
            level3,
            link,
            category: row[H.type] ? row[H.type].trim().toLowerCase() : INTERNALS,
            hidden: row[H.hidden] ? row[H.hidden].trim() !== '' : false,
            skipMeta: row[H.excludeFromMetadata] ? row[H.excludeFromMetadata].trim() !== '' : false,
          }

          _data.topics[name] = item;
          
          if (!_data.categories[item.category]) {
            _data.categories[item.category] = [];
          }
          _data.categories[item.category].push(item.name);

          if (level3) {
            if (!_data.children[level2]) {
              _data.children[level2] = [];
            }
            if (_data.children[level2].indexOf(level3) === -1) {
              _data.children[level2].push(level3);
            }
          }

          if (level2) {
            if (!_data.children[level1]) {
              _data.children[level1] = [];
            }
            if (_data.children[level1].indexOf(level2) === -1) {
              _data.children[level1].push(level2);
            }
          }

          if (!item.hidden) {
            _data.visible.push(item);
          }

          _data.all.push(item);

        });

      return {
        data: _data,

        getAllUFT: function () {
          return _data.visible;
        },

        getAll: function () {
          return _data.all;
        }
      };
    });
}

module.exports = { getTaxonomy };