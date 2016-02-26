var Sequelize = require('sequelize'),
  fs = require('fs'),
  connectionData = require('./connectionData'),
  sqlite3 = require('sqlite3').verbose();

function runQuery(blob) {
  // Sequelize('Your database' (empty if including in queries), 'DB username', 'DB password')
  var mysqlize = new Sequelize('', connectionData.username, connectionData.password, {
    host: connectionData.host, // make this your own host
    dialect: 'mysql',
    pool: {
      max: 15,
      min: 0,
    }
  });

  var queryString = blob.query.toString();
  var databaseID = blob._id;
  // new way to get MySQL results
  mysqlize.query(queryString).spread(function(results, metadata) {
    if (results != undefined) {
      var mysqlResults = results;
      var keys = [];
      for (var key in mysqlResults[0]) {
        keys.push(key);
      }
      columnStr = keys.toString();
      var db = new sqlite3.Database('./data/' + databaseID + '.db');
      //var db = new sqlite3.Database(':memory:');
      var startTime = Date.now();
      db.serialize(function() {
        db.run('BEGIN TRANSACTION');
        var valuesStr = '?';
        if (keys.length > 1)
          for (var k = 2; k <= keys.length; k++) {
            valuesStr += ', ?';
          }
        db.run('CREATE TABLE ' + 'Table_name' + ' (' + columnStr + ' TEXT)');
        var stmt = db.prepare('INSERT INTO ' + 'Table_name' + '(' + columnStr + ')' + ' VALUES (' + valuesStr + ')');
        if (Object.keys(mysqlResults).length = 0) {
          console.log('Error with data in response')
        } else {
          for (var i = 0; i < Object.keys(mysqlResults).length; i++) {
            var value = [];
            // goes by row j and inserts the column values 
            for (var j = 0, length = keys.length; j < length; j++) {
              // gets responseObject.columnName for row j
              value[j] = mysqlResults[i][keys[j]];
            }
            stmt.run(value);
          }
          stmt.finalize();
        }

        db.each('SELECT * FROM ' + 'Table_name', function(err, row) {
          console.log(row.id + ': ' + row.info);
        });

        db.run('COMMIT');
      });
      db.close(function() {
        console.log((Date.now() - startTime) + ' ms');
      });
    } else {
      console.log('Error in data')
    }
  });

}

module.exports = runQuery;