'use strict';
var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    TimeEntry = mongoose.model('TimeEntry'),
    Repo = mongoose.model('Repo');



module.exports = function(app) {
    app.use('/', router);
};

router.get('/', function(req, res, next) {

    Repo.find()
        .populate('timeEntries')
        .exec()
        .then(function(repos) {
            var iter = function(repo, callback) {
                TimeEntry.populate(repo.timeEntries, {
                    path: 'issue'
                }, callback);
            };
            async.each(repos, iter, function done(err) {
                res.render('index', {
                    title: 'GH Invoice',
                    repos: repos
                });
            });

        });
});
