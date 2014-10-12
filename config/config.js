'use strict';
var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'gh-invoice'
    },
    ip: '127.0.0.1',
    port: 3000,
    db: 'mongodb://localhost/gh-invoice-development'

  },

  test: {
    root: rootPath,
    app: {
      name: 'gh-invoice'
    },
    ip: '127.0.0.1',
    port: 3000,
    db: 'mongodb://localhost/gh-invoice-test'

  },

  production: {
    root: rootPath,
    app: {
      name: 'gh-invoice'
    },
    ip: process.env.OPENSHIFT_NODEDIY_IP,
    port: process.env.OPENSHIFT_NODEDIY_PORT,
    db: (process.env.OPENSHIFT_MONGODB_DB_URL + process.env.OPENSHIFT_APP_NAME)

  }
};

module.exports = config[env];
