/*
 * ultimate.server.route.restify
 */

'use strict';

var path = require('path'),
    querystring = require('querystring'),
    mongoose = require('mongoose');

var _ = require('lodash');

var VERBS = ['list', 'get', 'post', 'put', 'delete'],
    ROLES = ['any', 'guest', 'user', 'admin'];

var Restify = function (expressServer) {
  this._server = expressServer;
};

Restify.prototype._attachRoutes = function (urlRoot, controller, verbs, middleware) {
  var self = this,
      routeItems = urlRoot,
      routeItem = path.join(urlRoot, ':id');

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
      throw new Error('Missing LIST() in ' + controller.__filename);
    }
  }

  // GET /:resources/:id
  if (_.contains(verbs, 'get')) {
    if (_.isFunction(controller.GET)) {
      self._server.get(routeItem, middleware, function (req, res) {
        controller.GET(req, req.params.id, self._send(res));
      });
    } else {
      throw new Error('Missing GET() in ' + controller.__filename);
    }
  }

  // POST /:resources
  if (_.contains(verbs, 'post')) {
    if (_.isFunction(controller.POST)) {
      self._server.post(routeItems, middleware, function (req, res) {
        controller.POST(req, self._send(res));
      });
    } else {
      throw new Error('Missing POST() in ' + controller.__filename);
    }
  }

  // PUT /:resources/:id
  if (_.contains(verbs, 'put')) {
    if (_.isFunction(controller.PUT)) {
      self._server.put(routeItem, middleware, function (req, res) {
        controller.PUT(req, req.params.id, self._send(res));
      });
    } else {
      throw new Error('Missing PUT() in ' + controller.__filename);
    }
  }

  // DELETE /:resources/:id
  if (_.contains(verbs, 'delete')) {
    if (_.isFunction(controller.DELETE)) {
      self._server.delete(routeItem, middleware, function (req, res) {
        controller.DELETE(req, req.params.id, self._send(res));
      });
    } else {
      throw new Error('Missing DELETE() in ' + controller.__filename);
    }
  }
};

Restify.prototype._send = function (res) {
  var self = this;
  return function (err, result) {
    if (err) { return self._sendError(res, err.message); }
    res.json({
      result: result || {},
      success: true,
      method: res.req.method,
      url: res.req._parsedUrl.pathname,
      // cookie: res.req.headers.cookie,
      // body: res.req.body,
      // headers: res.req.headers,
      query: _.omit(querystring.parse(res.req._parsedUrl.query), ['', '_method'])
    });
  };
};

Restify.prototype._sendError = function (res, errMsg, errCode) {
  errCode = errCode || 400;
  return res.json(errCode, {
    error: {
      code: errCode,
      message: errMsg
    },
    method: res.req.method,
    url: res.req._parsedUrl.pathname,
    // cookie: res.req.headers.cookie,
    // body: res.req.body,
    // headers: res.req.headers,
    query: _.omit(querystring.parse(res.req._parsedUrl.query), ['', '_method'])
  });
};

Restify.prototype._expandArrayToObject = function (itemArray, value) {
  var result = _.zipObject(itemArray, []);
  itemArray.forEach(function (item) {
    result[item] = value;
  });
  return result;
};

Restify.prototype._expandVerbs = function (spec) {
  var result = {};

  if (!_.isEmpty(spec)) {
    if (spec === true) {
      result = this._expandArrayToObject(VERBS, '*');
    } else if (_.isString(spec)) {
      if (spec === '*') {
        result = this._expandArrayToObject(VERBS, '*');
      } else {
        result = this._expandArrayToObject(_.intersection(spec.split(','), VERBS), '*');
      }
    } else if (_.isArray(spec)) {
      if (_.contains(spec, '*')) {
        result = this._expandArrayToObject(VERBS, '*');
      } else {
        result = this._expandArrayToObject(_.intersection(spec, VERBS), '*');
      }
    } else if (_.isObject(spec)) {
      _.each(spec, function (roles, verb) {
        if (verb === '*') {
          _.each(VERBS, function (verb) {
            result[verb] = roles;
          });
        } else if (!_.has(spec, '*')) {
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
        if (_.contains(roles, '*')) {
          rolesResult = this._expandArrayToObject(ROLES, '*');
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
          if (_.contains(fields, '*')) {
            fieldsResult = this._expandArrayToObject(FIELDS, 1);
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
      fields = _.keys(Model.schema.paths),
      result;

  spec = this._expandVerbs(spec);
  spec = this._expandRoles(spec);
  spec = this._expandFields(spec, fields);
  // spec = this._expandFieldOptions(spec);
  // spec = this._expandOptions(spec);

  return spec;
};

Restify.prototype._buildController = function (verb, Model, fields) {
  var result = {};

  result[verb.toUpperCase()] = function (req, id, cb) {
    if (_.isFunction(id)) {
      cb = id;
      id = void 0;
    }

    var query;

    switch (verb) {
      case 'list': {
        query = Model.find();
        query.lean();
        break;
      }
      case 'get': {
        query = Model.findById(id);
        query.lean();
        break;
      }
      case 'post': {
        // TODO
        break;
      }
      case 'put': {
        // TODO
        break;
      }
      case 'delete': {
        // TODO
        break;
      }
    }

    if (query) {
      query.select(fields);

      query.exec(function (err, result) {
        if (err) { return cb(err); }
        if (_.isNull(result)) {
          return cb(new Error('Data not found.'));
        }
        if (_.isArray(result)) {
          result.forEach(function (result) {
            result.id = result._id;
            delete result._id;
            delete result.__v;
          });
        } else {
          result.id = result._id;
          delete result._id;
          delete result.__v;
        }

        return cb(null, result);
      });
    } else {
      return cb(new Error('Not yet implemented.'));
    }
  };

  return result;
};

Restify.prototype.any = function (path, controller, verbs) {
  this._attachRoutes(path, controller, verbs);
};

Restify.prototype.guest = function (path, controller, verbs) {
  var self = this;
  self._attachRoutes(path, controller, verbs, function (req, res, next) {
    if (req.isAuthenticated()) {
      return self._sendError(res, 'must be logged out', 401);
    }
    next();
  });
};

Restify.prototype.user = function (path, controller, verbs) {
  var self = this;
  self._attachRoutes(path, controller, verbs, function (req, res, next) {
    if (!req.isAuthenticated()) {
      return self._sendError(res, 'must be logged in', 401);
    }
    next();
  });
};

Restify.prototype.admin = function (path, controller, verbs) {
  var self = this;
  self._attachRoutes(path, controller, verbs, function (req, res, next) {
    if (!req.isAuthenticated()) {
      return self._sendError(res, 'must be logged in', 401);
    }
    if (!req.user || !_.contains(req.user.roles, 'admin')) {
      return self._sendError(res, 'must be admin', 403);
    }
    next();
  });
};

Restify.prototype.model = function (path, modelName, options) {
  if (!_.isObject(options)) { options = {}; }

  var self = this,
      Model = mongoose.model(modelName),
      spec = self._parseSpec(Model),
      tasks = {
        any: [],
        guest: [],
        user: [],
        admin: []
      };

  _.each(spec, function (roles, verb) {
    _.each(roles, function (fields, role) {
      tasks[role].push(function () {
        self[role](path, self._buildController(verb, Model, fields), [verb]);
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
