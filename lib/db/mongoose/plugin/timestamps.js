/*
 * ultimate.db.mongoose.plugin.timestamps
 */

'use strict';

exports = module.exports = function (schema) {
  schema.add({ createdAt: Date });
  schema.add({ updatedAt: Date });

  schema.pre('save', function (next) {
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    this.updatedAt = new Date();
    next();
  });
};
