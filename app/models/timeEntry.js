var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TimeEntrySchema = new Schema({
    hours: String,
    issue: String,
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('TimeEntry', TimeEntrySchema);
