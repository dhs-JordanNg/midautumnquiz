// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var quesSchema = mongoose.Schema({
	question: { type: String, required: true },
	option1: String,
	option2: String,
	answer: { type: String, required: true }
}, { collection: 'questions' });

