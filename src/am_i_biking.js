#!/usr/bin/env node
// Check for recent share ride starting points
//
// A potential share ride start point is either the end of a walking activity
// or the start of a cycling activity that occurs near a bike share station.
//
// Share ride end points occuring after share ride start points invalidate
// the start point. 
//
//

var mongodb = require('mongodb');
var dbconfig = require('dbconfig');
var bikewarn = require('bikewarn');

var dburl = dbconfig.dburl;
var stations_collection = dbconfig.stations_collection;
var users_collection = dbconfig.users_collection;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

var now = new Date();

MongoClient.connect(dburl, function(err, db) 
{
  if(err) throw err;

  bikewarn.get_user(db, "ernie",function(err, user) { 
    if(err) throw err;
    console.log('username: ' + user.username);
    process.exit();
  });

  // bikewarn.is_point_at_station(db, longitude, latitude, function(err) { 
        // process.stdout.write("true\n");
        // db.close();
        // process.exit(0);
     // }, function(err) { 
        // process.stdout.write("false\n");
        // db.close();
        // process.exit(1);
     // });
});

