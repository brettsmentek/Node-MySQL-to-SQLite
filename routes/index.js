var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'), //used to manipulate POST
    moment = require('moment');

router.route('/')
	.get(function(req, res, next) {

		mongoose.connection.db.listCollections().toArray(function(err, collections) {
			if (err) {
				return console.error(err);
			} else {
				//respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
				res.format({
					//HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
					html: function() {
						res.render('index', {
							"collections": collections,
							title: 'Database exporter',
						});
					},
					//JSON response will show all blobs in JSON format
					json: function() {
						res.json(collections);
					}
				});
			}
		});


	});

	module.exports = router;