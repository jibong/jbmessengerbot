var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();
var jsonParser = bodyParser.json();

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
	} else {
		console.error("Failed validation. Make sure the validation tokens match.");
		res.sendStatus(403);
	}
});

app.post('/webhook', jsonParser, function (req, res) {
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
	console.log("Message data: ", event.message);
  
	var senderID = event.sender.id;
	var recipientID = event.recipient.id;
	var timeOfMessage = event.timestamp;
	var message = event.message;

	console.log("Received message for user %d and page %d at with message:", senderID, recipientID, timeOfMessage);
	console.log(JSON.stringify(message));
	
	var messageId = message.mid;	
	var messageText = message.text;
	var messageAttachments = message.attachments;
	
	if (messageText) {
		switch(messageText) {
			case 'generic':
				sendGenericMessage(senderID);
				break;
				
			case 'nifty':
				var niftyMessage = "looking for nifty cups?";
				sendTextMessage(senderID, niftyMessage);
				break;
			
			case 'yes':
				var niftyLink = "Go to this page https://www.facebook.com/Cup-of-Love-Nifty-Cups-for-infants-2185153225043868/";
				sendTextMessage(senderID, niftyLink);
				break;
			
			default:
				sendTextMessage(senderID, messageText);
		}
	} else if (messageAttachments) {
		sendTextMessage(senderID, "Message with attachment received");
	}
}

function sendTextMessage(recipientId, messageText) {
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: messageText
		}
	};
	
	callSendAPI(messageData);
}

function sendGenericMessage(recipientId)
{
	var messageData = {
		recipient: {
			id: recipientId
		},
		message: {
			text: 'You send a generic text?'
		}
	};
	
	callSendAPI(messageData);
}

function callSendAPI(messageData) {
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: 'EAAXVNYlxpPgBAHbHQxaLGJc5BJi6mxbzpPy3GWPjQYsH34a8BGWatguZCws6NZCkhgcB2VQsGG5FZBAUlonEm3XZCTAP8TeFGZCGXJolqXERFjZB37O6gusaZCTFDxrx4jndBfLWsE60T0G4eUEtAORA9HOBWI8XYWxyZBugjdPbFgZDZD' },
		method: 'POST',
		json: messageData
	}, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var recipientId = body.recipient_id;
			var messageId = body.message_id;
			
			console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
		} else {
			console.error("Unable to send message.");
			console.error(response);
			console.error(error);
		}		
	});
}

app.listen(port, function() {
	console.log('Our app is running on http://localhost:' + port);
});