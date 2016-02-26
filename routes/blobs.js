var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'), //mongo connection
  bodyParser = require('body-parser'), //parses information from POST
  methodOverride = require('method-override'), //used to manipulate POST
  moment = require('moment'),
  fs = require('fs'),
  simpleSqlParser = require('simple-sql-parser'),
  runQuery = require('../modules/runQuery'),
  Sequelize = require('sequelize');


//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({
  extended: true
}));
router.use(methodOverride(function(req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

//build the REST operations at the base for blobs
//this will be accessible from http://127.0.0.1:3000/blobs if the default route for / is left unchanged
router.route('/')
  //GET all blobs
  .get(function(req, res, next) {
    //retrieve all blobs from Monogo
    mongoose.model('Blob').find({}, function(err, blobs) {
      if (err) {
        return console.error(err);
      } else {
        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
        res.format({
          //HTML response will render the index.jade file in the views/blobs folder. We are also setting "blobs" to be an accessible variable in our jade view
          html: function() {
            res.render('blobs/index', {
              title: 'Query table',
              "blobs": blobs,
              moment: moment
            });
          },
          //JSON response will show all blobs in JSON format
          json: function() {
            res.json(blobs);
          }
        });
      }
    });
  })
  //POST a new blob
  .post(function(req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    var name = req.body.name;
    var query = req.body.query;
    var badge = req.body.badge;
    var date = req.body.date;
    //var company = req.body.company;
    var isChecked = req.body.isChecked;
    //call the create function for our database
    mongoose.model('Blob').create({
      name: name,
      query: query,
      badge: badge,
      date: date,
      isChecked: isChecked
    }, function(err, blob) {
      if (err) {
        res.send("There was a problem adding the information to the database.");
      } else {
        //Blob has been created
        console.log('POST creating new blob: ' + blob);
        res.format({
          //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
          html: function() {
            // If it worked, set the header so the address bar doesn't still say /adduser
            res.location("blobs");
            // And forward to success page
            res.redirect("/blobs");
          },
          //JSON response will show the newly created blob
          json: function() {
            res.json(blob);
          }
        });
      }
    });
  });

/* GET New Blob page. */
router.get('/new', function(req, res) {
  res.render('blobs/new', {
    title: 'Add new blob'
  });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
  //find the ID in the Database
  mongoose.model('Blob').findById(id, function(err, blob) {
    //if it isn't found, we are going to repond with 404
    if (err) {
      console.log(id + ' was not found');
      res.status(404);
      var err = new Error('Not Found');
      err.status = 404;
      res.format({
        html: function() {
          next(err);
        },
        json: function() {
          res.json({
            message: err.status + ' ' + err
          });
        }
      });
      //if it is found we continue on
    } else {
      //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
      //console.log(blob);
      // once validation is done save the new item in the req
      req.id = id;
      // go to the next thing
      next();
    }
  });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Blob').findById(req.id, function(err, blob) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + blob._id);
        var blobdate = blob.date.toISOString();
        blobdate = blobdate.substring(0, blobdate.indexOf('T'));
        res.format({
          html: function() {
            res.render('blobs/show', {
              "blobdate": blobdate,
              "blob": blob
            });
          },
          json: function() {
            res.json(blob);
          }
        });
      }
    });
  });

router.route('/:id/edit')
  //GET the individual blob by Mongo ID
  .get(function(req, res) {
    //search for the blob within Mongo
    mongoose.model('Blob').findById(req.id, function(err, blob) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        //Return the blob
        console.log('GET Retrieving ID: ' + blob._id);
        var blobdate = blob.date.toISOString();
        blobdate = blobdate.substring(0, blobdate.indexOf('T'));
        res.format({
          //HTML response will render the 'edit.jade' template
          html: function() {
            res.render('blobs/edit', {
              title: 'Blob' + blob._id,
              "blobdate": blobdate,
              "blob": blob
            });
          },
          //JSON response will return the JSON output
          json: function() {
            res.json(blob);
          }
        });
      }
    });
  })
  //PUT to update a blob by ID
  .put(function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var name = req.body.name;
    var query = req.body.query;
    var badge = req.body.badge;
    var date = req.body.date;
    //var company = req.body.company;
    var isChecked = req.body.isChecked;

    //find the document by ID
    mongoose.model('Blob').findById(req.id, function(err, blob) {
      //update it
      blob.update({
        name: name,
        query: query,
        badge: badge,
        date: date,
        isChecked: isChecked
      }, function(err, blobID) {
        if (err) {
          res.send("There was a problem updating the information to the database: " + err);
        } else {
          //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
          res.format({
            html: function() {
              res.redirect("/blobs/"); // + blob._id);
            },
            //JSON responds showing the updated values
            json: function() {
              res.json(blob);
            }
          });
        }
      });
    });
  })
  //DELETE a Blob by ID
  .delete(function(req, res) {
    //find blob by ID
    mongoose.model('Blob').findById(req.id, function(err, blob) {
      if (err) {
        return console.error(err);
      } else {
        //remove it from Mongo
        blob.remove(function(err, blob) {
          if (err) {
            return console.error(err);
          } else {
            //Returning success messages saying it was deleted
            console.log('DELETE removing ID: ' + blob._id);
            res.format({
              //HTML returns us back to the main page, or you can create a success page
              html: function() {
                res.redirect("/blobs");
              },
              //JSON returns the item with the message that is has been deleted
              json: function() {
                res.json({
                  message: 'deleted',
                  item: blob
                });
              }
            });
          }
        });
      }
    });
  });
router.route('/:id/download')
  //GET the individual blob by Mongo ID
  .get(function(req, res) {
    //search for the blob within Mongo
    mongoose.model('Blob').findById(req.id, function(err, blob) {
      if (err) {
        console.log(err);
      } else {
        //Download the blob
        var file = './data/' + blob._id + '.db';
        res.download(file);
      }
    });
  });
router.route('/:id/run')
  .get(function(req, res) {
    mongoose.model('Blob').findById(req.id, function(err, blob) {
      if (err) {
        console.log(err);
      } else {
        var file = './data/' + blob._id + '.db';
        fs.stat(file, function(err, stats) {
          if (err) {
            //Run the blob
            runQuery(blob);
            res.redirect('/blobs/' + blob._id);
          } else {
            //Delete existing file
            fs.unlinkSync(file);
            //Run the blob
            runQuery(blob);
            res.redirect('/blobs/' + blob._id);
          }
        });
      }
    });
  });

module.exports = router;