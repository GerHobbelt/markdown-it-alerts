'use strict';

/*eslint-env mocha*/

let path     = require('path');
let generate = require('@gerhobbelt/markdown-it-testgen');


describe('markdown-it-vtrans', function () {
  let md = require('@gerhobbelt/markdown-it')({ linkify: true })
              .use(require('../'));

  generate(path.join(__dirname, 'fixtures/sanscript.txt'), md);
});

