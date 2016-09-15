// This tutorial was to learn how to do auth using a passport, via
// local strategy and Google strategy. For the Node Webdev DHS course.
// Source: https://scotch.io/tutorials/easy-node-authentication-setup-and-local
// Update mongodb uri
// Combined passport-local with passport-google and added both google/local profiles to show up
// on profile.ejs

// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');

var passport = require('passport');
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

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
	}, { collection: 'responses' });
	
var quesSchema = mongoose.Schema({
	questionId: { type: String, required: true },
	question: { type: String, required: true },
	option1: String,
	option2: String,
	answer: { type: String, required: true }
}, { collection: 'questions' });

var Response = mongoose.model('Response', responseSchema);
var Question = mongoose.model('Question', quesSchema);

var configDB = require('./config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
// app/routes.js

//var question = new Question ({ questionId: 4, question: "中秋节始于那个朝代？", option1: "唐朝", option2: "明朝", answer: 1})
//question.save(function(err) {
//	if (err) throw err;
//	console.log("created");
//});
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });



    app.get('/login', function(req, res) {   // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });
	
	var quizQ = [];
	app.get('/quiz', isLoggedIn, function(req, res) {
		var numberQ = 0;
		var quizQuestions = [];
		Question.find({}, function(err, questions) {
			if (err) throw err;
			console.log(questions.length);
			numberQ = questions.length;
			for (i = 0; i < 3; i++) {
				var randomNumber = Math.floor(Math.random() * numberQ);
				console.log(randomNumber);
				quizQuestions[i] = questions[randomNumber];
				questions.splice(randomNumber,1);
				numberQ--;
				console.log(questions);
			}
			console.log(quizQuestions);
			res.render('quiz.ejs', { questions:  quizQuestions});
			quizQ = quizQuestions;
		});
	});
	
	app.post('/quiz', function(req, res, next) {
		var questionAns = [req.body.question1, req.body.question2, req.body.question3];
		var questions = quizQ;
		var score = 0;
		res.render('results.ejs', { score: score, questions: questions, responses: questionAns})
	});
		



    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });
    
    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

   
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user, // get the user out of session and pass to template
        });
    });

   
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
    
   
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'], accessType: 'offline', approvalPrompt: 'auto' }));
    app.get('/auth/google/callback',
        passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
    }));

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);