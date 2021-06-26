/*! markdown-it-alerts 0.2.0-7 https://github.com//GerHobbelt/markdown-it-alerts @license MIT */

import container from '@gerhobbelt/markdown-it-container';

function alerts_plugin(md, options) {
  let containerOpenCount = 0;
  let links = 'links' in (options || {}) ? options.links : true;
  let icons = 'icons' in (options || {}) ? options.icons : false;

  function icon(name) {
    switch (name) {
      case 'warning':
        return 'glyphicon glyphicon-alert';

      case 'danger':
        return 'glyphicon glyphicon-remove-sign';

      default:
        return 'glyphicon glyphicon-info-sign';
    }
  }

  function setupContainer(name) {
    md.use(container, name, {
      render: function (tokens, idx) {
        let html;

        if (tokens[idx].nesting === 1) {
          containerOpenCount += 1;
          html = '<div class="alert alert-' + name + '" role="alert">\n';

          if (icons) {
            html += '<div class="alert-inner">\n';
            html += '<div class="alert-icon"><span class="' + icon(name) + '" aria-hidden="true"></span></div>\n';
            html += '<div class="alert-message">';
          }

          return html;
        }

        containerOpenCount -= 1;
        html = '</div>\n';

        if (icons) {
          html += '</div>\n</div>\n';
        }

        return html;
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
        tokens[idx].attrPush(['class', 'alert-link']);
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
}

export default alerts_plugin;
//# sourceMappingURL=markdownItAlerts.modern.js.map
