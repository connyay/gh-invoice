'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TimeEntrySchema = new Schema({
    hours: String,
    issue: {
        type: Schema.Types.ObjectId,
        ref: 'Issue'
    },
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('TimeEntry', TimeEntrySchema);
