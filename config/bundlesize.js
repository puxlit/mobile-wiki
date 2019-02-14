'use strict';

const assetsFolder = 'mobile-wiki/assets';

module.exports = {
  'mobile-wiki.js': {
    pattern: `${assetsFolder}/mobile-wiki-*.js`,
    limit: '456KB',
  },
  'vendor.js': {
    pattern: `${assetsFolder}/vendor-*.js`,
    limit: '660KB',
  },
  'app.css': {
    pattern: `${assetsFolder}/app.css`,
    limit: '92KB',
  },
  'lazy.css': {
    pattern: `${assetsFolder}/lazy-*.css`,
    limit: '68KB',
  },
  'jwplayer:css': {
    pattern: `${assetsFolder}/jwplayer/*.css`,
    limit: '19KB',
  },
  'design-system.svg': {
    pattern: `${assetsFolder}/design-system-*.svg`,
    limit: '30KB',
  },
  'jwplayer:js': {
    pattern: `${assetsFolder}/jwplayer/*.js`,
    limit: '55KB',
  },
};
