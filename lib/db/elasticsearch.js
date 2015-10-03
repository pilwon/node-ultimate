/*
 * ultimate.es.elasticsearch.js
 */

'use strict';

var elasticsearch = require('elasticsearch');

var Elasticsearch = function (config) {
  var hostAddress = config.host + ':' + config.port;
  var client = elasticsearch.Client({
    host: hostAddress,
    log: 'error',
    requestTimeout: 12000000
  });

  this.client = function () {
    return client;
  };

  this.host = function () {
    return config.host;
  };

  this.port = function () {
    return config.port;
  };
};

var connect = function (config) {
  if (!config) {
    config = {host: 'localhost', port: 9200};
  } // Default

  //Elasticsearch constructor
  if (!this.instance) {
    this.instance = new Elasticsearch(config);
  }
  //console.log('>>>> Connecting Elasticsearch', config, this.instance);
  return this.instance;
};

//Public exports
exports = module.exports = connect;
