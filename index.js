'use strict';

var container = require('markdown-it-container');

module.exports = function alerts_plugin(md, options) {
  var containerOpenCount = 0;
  var links = options ? options.links : true;
  var icons = options ? options.icons : false;
  init();
  return;

  function setupContainer(name) {
    md.use(container, name, {
      render: function (tokens, idx) {
        var html;
        if (tokens[idx].nesting === 1) {
          containerOpenCount += 1;
          html = '<div class="alert alert-' + name + '" role="alert">\n';
          if (icons) {
            html += '<div class="alert-inner">\n';
            html += '<div class="alert-icon"><span class="' + icon(name) +
              '" aria-hidden="true"></span></div>';
            html += '<div class="alert-message">';
          }
          return html;
        } else {
          containerOpenCount -= 1;
          html = '</div>\n';
          if (icons) {
            html += '</div>\n</div>\n';
          }
          return html;
        }
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
    var defaultRender = md.renderer.rules.link_open || selfRender;

    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      if (isContainerOpen()) {
        tokens[idx].attrPush(['class', 'alert-link']);
      }

      return defaultRender(tokens, idx, options, env, self);
    };
  }

  function icon(name) {
    switch(name) {
      case "warning":
        return "glyphicon glyphicon-alert";
      case "danger":
        return "glyphicon glyphicon-remove-sign";
      default:
        return "glyphicon glyphicon-info-sign";
    }
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
};