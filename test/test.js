'use strict';


let path     = require('path');
let generate = require('@gerhobbelt/markdown-it-testgen');

/*eslint-env mocha*/

describe('markdown-it-alerts', function () {
  let md = require('@gerhobbelt/markdown-it')({ linkify: true })
              .use(require('../'));

  generate(path.join(__dirname, 'fixtures/alerts.txt'), md);
});

describe('markdown-it-alerts with icon', function () {
  let md = require('@gerhobbelt/markdown-it')({ linkify: true })
              .use(require('../'), { icons: true });

  generate(path.join(__dirname, 'fixtures/alerts-icon.txt'), md);
});
