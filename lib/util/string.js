/*
 * lib/util/string.js
 *
 * Utility functions related to string manipulation.
 */

/* jshint bitwise:false */

'use strict';

var unorm = require('unorm');

var slugifyL = require('./_helper/slugifyL'),
    slugifyN = require('./_helper/slugifyN'),
    slugifyZ = require('./_helper/slugifyZ');

function _unicodeCategory(code) {
  if (~slugifyL.indexOf(code)) { return 'L'; }
  if (~slugifyN.indexOf(code)) { return 'N'; }
  if (~slugifyZ.indexOf(code)) { return 'Z'; }
  return undefined;
}

/**
 * HTML escape a string.
 *
 * @param {string} str String to HTML escape.
 * @return {string} HTML escaped string.
 */
function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Regex escape a string.
 *
 * @param {string} str String to regex escape.
 * @return {string} Regex escaped string.
 */
function regexEscape(str) {
  return (str + '').replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
}

/**
 * Replace URL with HTML links.
 *
 * @param {String} text Text.
 * @return {String} Modified text.
 */
function replaceURLWithHTMLLinks(text) {
  var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(exp, '<a href="$1">$1</a>');
}

/**
 * Slugify a string.
 *
 * @param {string} str String to slugify.
 * @return {string} Slugified string.
 */
function slugify(str) {
  var result = [],
      i, len, ch, chCode, val;

  str = unorm.nfkc(str || '');

  for (i = 0, len = str.length; i < len; i++) {
    ch = str[i];
    chCode = ch.charCodeAt(0);

    if (0x3000 <= chCode && chCode <= 0x303F) {
      result.push(' ');  // CJK Symbols and Punctuation
    } else if (0x4E00 <= chCode && chCode <= 0x9FAF) {
      result.push(ch);   // CJK Unified Ideographs
    } else if (0xAC00 <= chCode && chCode <= 0xD7A3) {
      result.push(ch);   // Hangul Syllables
    } else if ('-+_~:'.indexOf(ch) >= 0) {
      result.push(ch);   // Exceptions -> ch
    } else if ('.,/&!?()<>[](){}'.indexOf(ch) >= 0) {
      result.push(' ');  // Exceptions -> ' '
    } else {
      val = _unicodeCategory(chCode);
      if (val && ~'LN'.indexOf(val)) {
        result.push(ch);
      } else if (val && ~'Z'.indexOf(val)) {
        result.push(' ');
      } else {
        // result.push(ch);
        // console.log(ch + ' -> ' + chCode);
      }
    }
  }

  return result.join('')
               .replace(/^\s+|\s+$/g, '')   // trim
               .replace(/\s+/g, ' ')        // collapse space
               .replace(/[\s/]+/g, '-');    // space & slash to hyphen
}

// Public API
exports.htmlEscape = htmlEscape;
exports.regexEscape = regexEscape;
exports.replaceURLWithHTMLLinks = replaceURLWithHTMLLinks;
exports.slugify = slugify;
