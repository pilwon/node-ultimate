/*
 * ultimate.server.route.restify
 */

'use strict';

var querystring = require('querystring'),
    url = require('url'),
    util = require('util');

var _ = require('lodash'),
    mongoose = require('mongoose');

var VERBS = ['list', 'get', 'post', 'put', 'delete'],
    ROLES = ['any', 'guest', 'user', 'admin'];

var Restify = function (expressServer) {
  this._server = expressServer;
};

Restify.prototype._sendError = function (err, result, res, errCode) {
  errCode = errCode || 400;
  return res.json(errCode, {
    error: {
      code: errCode,
      message: err.message || 'Error occured.'
    },
    result: result,
    method: res.req.method,
    url: res.req._parsedUrl.pathname,
    // cookie: res.req.headers.cookie,
    // body: res.req.body,
    // headers: res.req.headers,
    query: _.omit(querystring.parse(res.req._parsedUrl.query), ['', '_method'])
  });
};

Restify.prototype._send = function (res) {
  var self = this;
  return function (err, result) {
    if (err) { return self._sendError(err, result, res); }
    res.json({
      result: result,
      method: res.req.method,
      url: res.req._parsedUrl.pathname,
      // cookie: res.req.headers.cookie,
      // body: res.req.body,
      // headers: res.req.headers,
      query: _.omit(querystring.parse(res.req._parsedUrl.query), ['', '_method'])
    });
  };
};

Restify.prototype._attachRoutes = function (urlRoot, controller, verbs, middleware) {
  var self = this,
      routeItems = urlRoot,
      routeItem = url.resolve(urlRoot.replace(/\/+$/, '') + '/', ':id');

  // Prepare verbs
  if (!_.isArray(verbs)) { verbs = VERBS; }
  _.each(verbs, function (verb, i) {
    if (!_.isString(verb)) {
      delete verbs[i];
    }
    verbs[i] = verb.toLowerCase();
  });

  // Prepare middleware
  if (!_.isFunction(middleware)) {
    middleware = function (req, res, next) { next(); };
  }

  // GET /:resources
  if (_.contains(verbs, 'list')) {
    if (_.isFunction(controller.LIST)) {
      self._server.get(routeItems, middleware, function (req, res) {
        controller.LIST(req, self._send(res));
      });
    } else {
      throw new Error(util.format('Controller missing LIST() for route "%s".', urlRoot));
    }
  }

  // GET /:resources/:id
  if (_.contains(verbs, 'get')) {
    if (_.isFunction(controller.GET)) {
      self._server.get(routeItem, middleware, function (req, res) {
        controller.GET(req, req.params.id, self._send(res));
      });
    } else {
      throw new Error(util.format('Controller missing GET() for route "%s".', urlRoot));
    }
  }

  // POST /:resources
  if (_.contains(verbs, 'post')) {
    if (_.isFunction(controller.POST)) {
      self._server.post(routeItems, middleware, function (req, res) {
        controller.POST(req, self._send(res));
      });
    } else {
      throw new Error(util.format('Controller missing POST() for route "%s".', urlRoot));
    }
  }

  // PUT /:resources/:id
  if (_.contains(verbs, 'put')) {
    if (_.isFunction(controller.PUT)) {
      self._server.put(routeItem, middleware, function (req, res) {
        controller.PUT(req, req.params.id, self._send(res));
      });
    } else {
      throw new Error(util.format('Controller missing PUT() for route "%s".', urlRoot));
    }
  }

  // DELETE /:resources/:id
  if (_.contains(verbs, 'delete')) {
    if (_.isFunction(controller.DELETE)) {
      self._server.delete(routeItem, middleware, function (req, res) {
        controller.DELETE(req, req.params.id, self._send(res));
      });
    } else {
      throw new Error(util.format('Controller missing DELETE() for route "%s".', urlRoot));
    }
  }
};

Restify.prototype._expandArrayToObject = function (itemArray, value) {
  var result = _.zipObject(itemArray, []);
  itemArray.forEach(function (item) {
    result[item] = value;
  });
  return result;
};

Restify.prototype._expandVerbs = function (spec) {
  var verbs = spec,
      result = {};

  if (!_.isEmpty(verbs)) {
    if (verbs === true) {
      result = this._expandArrayToObject(VERBS, '*');
    } else if (_.isString(verbs)) {
      if (verbs === '*') {
        result = this._expandArrayToObject(VERBS, '*');
      } else {
        result = this._expandArrayToObject(_.intersection(verbs.split(','), VERBS), '*');
      }
    } else if (_.isArray(verbs)) {
      verbs = _.map(verbs, function (verb) {
        return _.isString(verb) ? verb.replace(/ /g, '') : verb;
      });
      if (_.contains(verbs, '*')) {
        result = this._expandArrayToObject(VERBS, '*');
      } else if (_.isPlainObject(_.last(verbs))) {
        // TODO: Handle options
      } else {
        result = this._expandArrayToObject(_.intersection(verbs, VERBS), '*');
      }
    } else if (_.isObject(verbs)) {
      _.each(verbs, function (roles, verb) {
        if (verb === '*') {
          _.each(VERBS, function (verb) {
            result[verb] = roles;
          });
        } else if (!_.has(verbs, '*')) {
          verb.split(',').forEach(function (verb) {
            if (_.contains(VERBS, verb)) {
              result[verb] = roles;
            }
          });
        }
      });
    }
  }

  return result;
};

Restify.prototype._expandRoles = function (spec) {
  var result = {};

  _.each(spec, function (roles, verb) {
    var rolesResult = {};

    if (!_.isEmpty(roles)) {
      if (roles === true) {
        rolesResult = this._expandArrayToObject(ROLES, '*');
      } else if (_.isString(roles)) {
        if (roles === '*') {
          rolesResult = this._expandArrayToObject(ROLES, '*');
        } else {
          rolesResult = this._expandArrayToObject(_.intersection(roles.split(','), ROLES), '*');
        }
      } else if (_.isArray(roles)) {
        roles = _.map(roles, function (role) {
          return _.isString(role) ? role.replace(/ /g, '') : role;
        });
        if (_.contains(roles, '*')) {
          rolesResult = this._expandArrayToObject(ROLES, '*');
        } else if (_.isPlainObject(_.last(roles))) {
          // TODO: Handle options
        } else {
          rolesResult = this._expandArrayToObject(_.intersection(roles, ROLES), '*');
        }
      } else if (_.isObject(roles)) {
        _.each(roles, function (fields, roles) {
          if (roles === '*') {
            _.each(ROLES, function (role) {
              rolesResult[role] = fields;
            });
          } else if (!_.has(verb, '*')) {
            roles.split(',').forEach(function (role) {
              if (_.contains(ROLES, role)) {
                rolesResult[role] = fields;
              }
            });
          }
        });
      }
    }

    result[verb] = rolesResult;
  }, this);

  return result;
};

Restify.prototype._expandFields = function (spec, FIELDS) {
  var result = {};

  _.each(spec, function (roles, verb) {
    var rolesResult = {};

    _.each(roles, function (fields, role) {
      var fieldsResult = {};

      if (!_.isEmpty(fields)) {
        if (fields === true) {
          fieldsResult = this._expandArrayToObject(FIELDS, 1);
        } else if (_.isString(fields)) {
          if (fields === '*') {
            fieldsResult = this._expandArrayToObject(FIELDS, 1);
          } else {
            fieldsResult = this._expandArrayToObject(_.intersection(fields.split(','), FIELDS), 1);
          }
        } else if (_.isArray(fields)) {
          fields = _.map(fields, function (field) {
            return _.isString(field) ? field.replace(/ /g, '') : field;
          });
          if (_.contains(fields, '*')) {
            fieldsResult = this._expandArrayToObject(FIELDS, 1);
          } else if (_.isPlainObject(_.last(fields))) {
            // TODO: Handle options
          } else {
            fieldsResult = this._expandArrayToObject(_.intersection(fields, FIELDS), 1);
          }
        } else if (_.isObject(fields)) {
          _.each(fields, function (fieldsOptions, fields) {
            if (fields === '*') {
              _.each(FIELDS, function (field) {
                fieldsResult[field] = fieldsOptions;
              });
            } else if (!_.has(verb, '*')) {
              fields.split(',').forEach(function (field) {
                if (_.contains(FIELDS, field)) {
                  fieldsResult[field] = fieldsOptions;
                }
              });
            }
          });
        }
      }

      if (_.isEmpty(fieldsResult)) {
        fieldsResult = this._expandArrayToObject(FIELDS, 0);
      }

      rolesResult[role] = fieldsResult;
    }, this);

    result[verb] = rolesResult;
  }, this);

  return result;
};

// Restify.prototype._expandFieldOptions = function (spec) {
//   return spec;
// };

// Restify.prototype._expandOptions = function (spec) {
//   return spec;
// };

Restify.prototype._parseSpec = function (Model) {
  var spec = Model.schema.restify,
      fields = _.keys(Model.schema.paths);

  spec = this._expandVerbs(spec);
  spec = this._expandRoles(spec);
  spec = this._expandFields(spec, fields);
  // spec = this._expandFieldOptions(spec);
  // spec = this._expandOptions(spec);

  return spec;
};

Restify.prototype._buildController = function (verb, Model, fields) {
  function _handleError(err, cb) {
    if (err) {
      if (err.name === 'CastError' && err.type === 'ObjectId') {
        cb(new Error('Invalid ID'));
      } else if (err.name === 'ValidationError') {
        cb(new Error('Validation error: ' + _.keys(err.errors).join(', ')));
      } else if (err.code === 11000) {
        cb(new Error('Duplicate key error.'));
      } else {
        cb(err);
      }
      return false;
    }
    return true;
  }

  function _buildFindQuery(req, id) {
    var condition = { $or: [] };
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      condition.$or.push({ _id: id });
    } else {
      condition.$or.push({ uid: id });
    }
    if (req.body.uid) {
      condition.$or.push({ uid: req.body.uid });
    }
    return Model.findOne(condition);
  }

  function _cleanDoc(doc) {
    doc.id = doc._id;
    delete doc._id;
    delete doc.__v;
  }

  var result = {};

  if (verb === 'LIST' || verb === 'GET') {
    result[verb] = function (req, id, cb) {
      if (_.isFunction(id)) {
        cb = id;
        id = void 0;
      }
      var query;
      if (verb === 'LIST') {
        query = Model.find();
      } else {
        query = _buildFindQuery(req, id);
      }
      query.lean();
      query.select(fields);
      query.exec(function (err, result) {
        if (!_handleError(err, cb)) { return; }
        if (!result) { return cb(new Error('Data not found.')); }
        _.flatten([result]).forEach(function (doc) {
          _cleanDoc(doc);
        });
        return cb(null, result);
      });
    };
  } else if (verb === 'POST') {
    result[verb] = function (req, cb) {
      Model.create(_.omit(req.body, 'id', '_id', '__v'), function (err, doc) {
        if (!_handleError(err, cb)) { return; }
        _cleanDoc(doc);
        return cb(null, doc.toObject());
      });
    };
  } else if (verb === 'PUT') {
    result[verb] = function (req, id, cb) {
      _buildFindQuery(req, id).exec(function (err, doc) {
        if (!_handleError(err, cb)) { return; }
        if (!doc) { return cb(new Error('Data not found.')); }
        _.assign(doc, _.omit(req.body, 'id', '_id', '__v'));
        doc.save(function (err, doc) {
          if (!_handleError(err, cb)) { return; }
          _cleanDoc(doc);
          return cb(null, doc.toObject());
        });
      });
    };
  } else if (verb === 'DELETE') {
    result[verb] = function (req, id, cb) {
      _buildFindQuery(req, id).exec(function (err, doc) {
        if (!_handleError(err, cb)) { return; }
        if (!doc) { return cb(new Error('Data not found.')); }
        doc.remove(function (err) {
          if (!_handleError(err, cb)) { return; }
          _cleanDoc(doc);
          return cb(null, doc.toObject());
        });
      });
    };
  }

  return result;
};

Restify.prototype.any = function (path, controller, verbs) {
  this._attachRoutes(path, controller, verbs);
};

Restify.prototype.guest = function (path, controller, verbs) {
  var self = this;
  self._attachRoutes(path, controller, verbs, function (req, res, next) {
    if (req.isAuthenticated()) {
      return self._sendError(new Error('Must be logged out.'), null, res, 401);
    }
    next();
  });
};

Restify.prototype.user = function (path, controller, verbs) {
  var self = this;
  self._attachRoutes(path, controller, verbs, function (req, res, next) {
    if (!req.isAuthenticated()) {
      return self._sendError(new Error('Must be logged in.'), null, res, 401);
    }
    next();
  });
};

Restify.prototype.admin = function (path, controller, verbs) {
  var self = this;
  self._attachRoutes(path, controller, verbs, function (req, res, next) {
    if (!req.isAuthenticated()) {
      return self._sendError(new Error('Must be logged in.'), null, res, 401);
    }
    if (!req.user || !_.contains(req.user.roles, 'admin')) {
      return self._sendError(new Error('Must be admin.'), null, res, 403);
    }
    next();
  });
};

Restify.prototype.model = function (path, modelName, overrideController) {
  var self = this,
      Model = mongoose.model(modelName),
      spec = self._parseSpec(Model);

  var tasks = {
    any: [],
    guest: [],
    user: [],
    admin: []
  };

  _.each(spec, function (roles, verb) {
    verb = verb.toUpperCase();
    _.each(roles, function (fields, role) {
      tasks[role].push(function () {
        if (_.isObject(overrideController) &&
            _.has(overrideController, verb) &&
            _.isFunction(overrideController[verb])) {
          self[role](path, overrideController[verb], [verb]);
        } else {
          self[role](path, self._buildController(verb, Model, fields), [verb]);
        }
      });
    });
  });

  // Attach routes in the right order.
  ['any', 'guest', 'user', 'admin'].forEach(function (role) {
    tasks[role].forEach(function (task) {
      task();
    });
  });

  // console.log(('== ' + modelName + ' ==').green);
  // console.log(spec);
};

// Public API
exports = module.exports = Restify;
