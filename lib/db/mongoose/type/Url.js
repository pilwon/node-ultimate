/*
 * ultimate.db.mongoose.type.Url
 */

var mongoose = require('mongoose'),
    mongooseTypes = require('mongoose-types');

// Load mongoose types plugin
mongooseTypes.loadTypes(mongoose);

// Public API
exports = module.exports = mongoose.SchemaTypes.Url;
