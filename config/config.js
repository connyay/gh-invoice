var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'gh-invoice'
    },
    port: 3000,
    db: 'mongodb://localhost/gh-invoice-development'
    
  },

  test: {
    root: rootPath,
    app: {
      name: 'gh-invoice'
    },
    port: 3000,
    db: 'mongodb://localhost/gh-invoice-test'
    
  },

  production: {
    root: rootPath,
    app: {
      name: 'gh-invoice'
    },
    port: 3000,
    db: 'mongodb://localhost/gh-invoice-production'
    
  }
};

module.exports = config[env];
