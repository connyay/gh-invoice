'use strict';
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IssueSchema = new Schema({
    id: Number,
    title: String,
    url: String,
    html_url: String,
    number: Number
});

mongoose.model('Issue', IssueSchema);
