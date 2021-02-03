/* eslint-env mocha, es6 */

import assert from 'assert';
import generate from '@gerhobbelt/markdown-it-testgen';
import path from 'path';
import markdown_it from '@gerhobbelt/markdown-it';

import { fileURLToPath } from 'url';

// see https://nodejs.org/docs/latest-v13.x/api/esm.html#esm_no_require_exports_module_exports_filename_dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import plugin from '../index.js';


describe('markdown-it-alerts', function () {
  const md = markdown_it({ linkify: true })
              .use(plugin);

  generate(path.join(__dirname, 'fixtures/alerts.txt'), md);
});

describe('markdown-it-alerts with icon', function () {
  const md = markdown_it({ linkify: true })
              .use(plugin, { icons: true });

  generate(path.join(__dirname, 'fixtures/alerts-icon.txt'), md);
});
