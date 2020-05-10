'use strict';


let path     = require('path');
let generate = require('@gerhobbelt/markdown-it-testgen');

/*eslint-env mocha*/

describe('markdown-it-alerts', function () {
  let md = require('@gerhobbelt/markdown-it')({ linkify: true })
              .use(require('../'));

  generate(path.join(__dirname, 'fixtures/alerts.txt'), md);
});
