var express = require('express'),
    crypto = require('crypto'),
    router = express.Router(),
    mongoose = require('mongoose'),
    TimeEntry = mongoose.model('TimeEntry'),
    Repo = mongoose.model('Repo');

var TIME_REGEX = /:clock\d{1,4}: (\d{1,})([m|h])(?:(?:.* )(\d{1,})([m|h]))?/;

function validateReq(req, repo) {
    return true;
    var sig = ('sha1=' + crypto.createHmac('sha1', repo.secret).update(JSON.stringify(req.body)).digest('hex'));

    if (req.get('x-hub-signature') === sig) {
        return true;
    }
    return false;
}

function parsePayload(payload) {
    var matches = TIME_REGEX.exec(payload.comment.body);
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
        .exec(function(err, repos) {
            if (err) return next(err);
            res.render('index', {
                title: 'GH Invoice',
                repos: repos
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
            console.log('good to go, store it.');
            new TimeEntry({
                hours: hours,
                issue: payload.issue.html_url
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
