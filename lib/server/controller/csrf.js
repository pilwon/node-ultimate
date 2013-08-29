/*
 * ultimate.server.controller.csrf
 */

'use strict';

var express = require('express');

exports = module.exports = function (req, res, next) {
  express.csrf()(req, res, next);
};
