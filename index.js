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
	if (req.query['hub.mode'] == 'subscribe' && req.query['hub.verify_token'] == 'this_is_my_token_jb_messenger') {
		console.log("Validating webhook");
		res.status(200).send(req.query['hub.challenge']);
	}
	else
	{
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
});

app.post('/webhook', function (req, res) {
	var data = req.body;

	// Make sure this is a page subscription
	if (data.object === 'page') {

		// Iterate over each entry - there may be multiple if batched
		data.entry.forEach(function(entry) {
			var pageID = entry.id;
			var timeOfEvent = entry.time;

			// Iterate over each messaging event
			entry.messaging.forEach(function(event) {
				if (event.message) {
					receivedMessage(event);
				} else {
					console.log("Webhook received unknown event: ", event);
				}
			});
		});

		// Assume all went well.
		//
		// You must send back a 200, within 20 seconds, to let us know
		// you've successfully received the callback. Otherwise, the request
		// will time out and we will keep trying to resend.
		res.sendStatus(200);
	}
});
  
function receivedMessage(event) {
  // Putting a stub for now, we'll expand it in the following steps
  console.log("Message data: ", event.message);
}

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});