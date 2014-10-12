var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RepoSchema = new Schema({
    name: String,
    secret: String,
    timeEntries: [{
        type: Schema.Types.ObjectId,
        ref: 'TimeEntry'
    }]
});

mongoose.model('Repo', RepoSchema);

var Repo = mongoose.model('Repo');

Repo.findOne({}, function(err, repo) {
    if (!repo) {
        repo = new Repo({
            name: 'connyay/gh-invoice',
            secret: require('securerandom').hex(20)
        });
        repo.save();
    }
});
