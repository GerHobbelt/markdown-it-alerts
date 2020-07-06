
/* eslint-env mocha, es6 */

const path = require('path');
const generate = require('@gerhobbelt/markdown-it-testgen');


describe('markdown-it-alerts', function () {
  const md = require('@gerhobbelt/markdown-it')({ linkify: true })
              .use(require('../'));

  generate(path.join(__dirname, 'fixtures/alerts.txt'), md);
});

describe('markdown-it-alerts with icon', function () {
  const md = require('@gerhobbelt/markdown-it')({ linkify: true })
              .use(require('../'), { icons: true });

  generate(path.join(__dirname, 'fixtures/alerts-icon.txt'), md);
});
