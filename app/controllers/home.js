var express = require('express'),
    crypto = require('crypto'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    TimeEntry = mongoose.model('TimeEntry'),
    Issue = mongoose.model('Issue'),
    Repo = mongoose.model('Repo');

var TIME_REGEX = /:clock\d{1,4}: (\d{1,})([m|h])(?:(?:.* )(\d{1,})([m|h]))?/,
    FREE_REGEX = /:clock\d{1,4}: :free:/;

function validateReq(req, repo) {
    return true;
    var sig = ('sha1=' + crypto.createHmac('sha1', repo.secret).update(JSON.stringify(req.body)).digest('hex'));

    if (req.get('x-hub-signature') === sig) {
        return true;
    }
    return false;
}

function parsePayload(payload) {
    var comment = payload.comment.body;
    var matches = FREE_REGEX.exec(comment);
    if (matches && matches.length) {
        return 'Free';
    }
    matches = TIME_REGEX.exec(comment);
    var entry = 0;
    for (var i = 1; i < matches.length; i++) {
        var match = matches[i];
        if (!match) {
            continue;
        }
        var time = parseFloat(match, 10);
        var format = matches[++i];
        if (format === 'm') {
            time = +((time / 60).toFixed(2));
        }
        entry += time;
    };
    return entry;
}

function isPing(req) {
    if (req.get('x-gitHub-event') === 'ping') {
        console.log(req.body);
        return true;
    }
}

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

router.post('/hook', function(req, res, next) {
    var payload = req.body;
    if (!payload || isPing(req)) {
        return res.end();
    }
    var hours = parsePayload(payload);
    if (!hours) {
        return res.end();
    }

    var repoData = payload.repository;

    Repo.findOne({
        name: repoData.full_name
    }, function(err, repo) {
        if (!repo && err) {
            return res.end();
        }
        if (validateReq(req, repo)) {
            Issue.findOneAndUpdate({
                id: payload.issue.id
            }, payload.issue, {
                upsert: true
            }, function(err, issue) {
                new TimeEntry({
                    hours: hours,
                    issue: issue
                }).save(function(err, entry) {
                    repo.timeEntries.push(entry);
                    repo.save(function() {
                        res.end();
                    })
                });
            });

        } else {
            console.log('mismatch?');
            res.end();
        }

    });
});
