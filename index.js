var express = require('express');
var app = express();

// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 81;

// set the view engine to ejs
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

// set the home page route
app.get('/', function(req, res) {

	// ejs render automatically looks in the views folder
	res.render('home');
});

app.get('/webhook', function(req, res) {
	if (req.query['hub.mode'] == 'subscribe' && req.query[hub.verify_token'] == 'this_is_my_token_jb_messenger') {
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	}
	else
	{
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
});

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});