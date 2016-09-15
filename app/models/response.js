// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

module.exports = function(app) {
	var responseSchema = mongoose.Schema({
		user: { type: String, required: true },
		answers: [{
			questionId: { type: String, requried: true },
			choice: String
		}, {
			questionId: { type: String, requried: true },
			choice: String
		}, {
			questionId: { type: String, requried: true },
			choice: String
		}]
	}, { collection: 'responses' })
};

