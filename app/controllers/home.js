var express = require('express'),
    crypto = require('crypto'),
    router = express.Router(),
    mongoose = require('mongoose'),
    TimeEntry = mongoose.model('TimeEntry'),
    Repo = mongoose.model('Repo');

function validateReq(req, repo) {
    return true;
    var sig = ('sha1=' + crypto.createHmac('sha1', repo.secret).update(JSON.stringify(req.body)).digest('hex'));

    if (req.get('x-hub-signature') === sig) {
        return true;
    }
    return false;
}

function parsePayload(payload) {
    var entryMatches = payload.comment.body.match(/(:clock\d{1,4}:)(.*\d)(m|h)/);
    if (entryMatches && entryMatches.length && entryMatches.length === 4) {
        var time = parseFloat(entryMatches[2], 10);
        var format = entryMatches[3];
        if (format === 'm') {
            time = time / 60;
            ''
        }
        return time;
    }
}

module.exports = function(app) {
    app.use('/', router);
};

router.get('/', function(req, res, next) {

    Repo.find()
    .populate('timeEntries')
    .exec(function(err, repos) {
        if (err) return next(err);
        res.render('index', {
            title: 'Generator-Express MVC',
            repos: repos
        });
    });
});

router.post('/hook', function(req, res, next) {
    var payload = req.body;
    if (!payload) {
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
            console.log('good to go, store it.');
            new TimeEntry({
                hours: hours,
                issue: payload.issue.url
            }).save(function(err, entry) {
                repo.timeEntries.push(entry);
                repo.save(function() {
                    res.end();
                })
            });
        } else {
            console.log('mismatch?');
            res.end();
        }

    });
});
