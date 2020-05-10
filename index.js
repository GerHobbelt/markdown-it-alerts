'use strict';

let container = require('@gerhobbelt/markdown-it-container');

module.exports = function alerts_plugin(md, options) {
  let containerOpenCount = 0;
  let links = options ? options.links : true;

  function setupContainer(name) {
    md.use(container, name, {
      render: function (tokens, idx) {
        if (tokens[idx].nesting === 1) {
          containerOpenCount += 1;
          return '<div class="alert alert-' + name + '" role="alert">\n';
        }
        containerOpenCount -= 1;
        return '</div>\n';
      }
    });
  }

  function isContainerOpen() {
    return containerOpenCount > 0;
  }

  function selfRender(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  }

  function setupLinks() {
    let defaultRender = md.renderer.rules.link_open || selfRender;

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      if (isContainerOpen()) {
        tokens[idx].attrPush([ 'class', 'alert-link' ]);
      }

      return defaultRender(tokens, idx, options, env, self);
    };
  }

  function init() {
    setupContainer('success');
    setupContainer('info');
    setupContainer('warning');
    setupContainer('danger');

    if (links) {
      setupLinks();
    }
  }

  init();
};
