/*
 * ultimate.server.route.restify
 */

'use strict';

var path = require('path'),
    querystring = require('querystring');

var _ = require('lodash');

function _sendError(res, errMsg, errCode) {
  errCode = errCode || 400;
  return res.json(errCode, {
    error: {
      code: errCode,
      message: errMsg
    },
    method: res.req.method,
    url: res.req._parsedUrl.pathname,
    // cookie: res.req.headers.cookie,
    // headers: res.req.headers,
    query: _.omit(querystring.parse(res.req._parsedUrl.query), ['', '_method'])
  });
}

function _send(res) {
  return function (err, result) {
    if (err) { return _sendError(res, err); }
    res.json(result);
  };
}

function _restify(expressServer, urlRoot, controller, verbs, middleware) {
  var routeItems = urlRoot,
      routeItem = path.join(urlRoot, ':id');

  // Prepare verbs
  if (!_.isArray(verbs)) {
    verbs = ['list', 'get', 'post', 'put', 'delete'];
  }
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
      expressServer.get(routeItems, middleware, function (req, res) {
        controller.LIST(req, _send(res));
      });
    } else {
      throw new Error('Missing LIST() in ' + controller.__filename);
    }
  }

  // GET /:resources/:id
  if (_.contains(verbs, 'get')) {
    if (_.isFunction(controller.GET)) {
      expressServer.get(routeItem, middleware, function (req, res) {
        controller.GET(req, req.params.id, _send(res));
      });
    } else {
      throw new Error('Missing GET() in ' + controller.__filename);
    }
  }

  // POST /:resources
  if (_.contains(verbs, 'post')) {
    if (_.isFunction(controller.POST)) {
      expressServer.post(routeItems, middleware, function (req, res) {
        controller.POST(req, _send(res));
      });
    } else {
      throw new Error('Missing POST() in ' + controller.__filename);
    }
  }

  // PUT /:resources/:id
  if (_.contains(verbs, 'put')) {
    if (_.isFunction(controller.PUT)) {
      expressServer.put(routeItem, middleware, function (req, res) {
        controller.PUT(req, req.params.id, _send(res));
      });
    } else {
      throw new Error('Missing PUT() in ' + controller.__filename);
    }
  }

  // DELETE /:resources/:id
  if (_.contains(verbs, 'delete')) {
    if (_.isFunction(controller.DELETE)) {
      expressServer.delete(routeItem, middleware, function (req, res) {
        controller.DELETE(req, req.params.id, _send(res));
      });
    } else {
      throw new Error('Missing DELETE() in ' + controller.__filename);
    }
  }
}

function any(expressServer, route, controller, verbs) {
  _restify(expressServer, route, controller, verbs);
}

function guest(expressServer, route, controller, verbs) {
  _restify(expressServer, route, controller, verbs, function (req, res, next) {
    if (req.isAuthenticated()) {
      return _sendError(res, 'must be logged out', 401);
    }
    next();
  });
}

function user(expressServer, route, controller, verbs) {
  _restify(expressServer, route, controller, verbs, function (req, res, next) {
    if (!req.isAuthenticated()) {
      return _sendError(res, 'must be logged in', 401);
    }
    next();
  });
}

function admin(expressServer, route, controller, verbs) {
  _restify(expressServer, route, controller, verbs, function (req, res, next) {
    if (!req.isAuthenticated()) {
      return _sendError(res, 'must be logged in', 401);
    }
    if (!req.user || !_.contains(req.user.roles, 'admin')) {
      return _sendError(res, 'must be admin', 403);
    }
    next();
  });
}

// Public API
exports.any = any;
exports.guest = guest;
exports.user = user;
exports.admin = admin;
