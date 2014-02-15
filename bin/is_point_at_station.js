#!/usr/bin/env node
// Check if point is near a bike share station
// Usage: src/is_point_at_station.js 40.6842088494 -73.9693521676
// Output: true or false
//
// example query in shell: 
//
// db.stations.find( { "location": { "$near": { "$geometry": { "type": "Point", "coordinates": [  40.6842088494, -73.9693521676 ] } }, "$maxDistance": 50 } } )
//

var mongodb = require('mongodb');
var dbconfig = require('dbconfig');
var sharewarn = require('sharewarn');

var dburl = dbconfig.dburl;
var stations_collection = dbconfig.stations_collection;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

var longitude = Number(process.argv[2]);
var latitude = Number(process.argv[3]);


MongoClient.connect(dburl, function(err, db) 
{
  if(err) throw err;

  sharewarn.is_point_at_station(db, longitude, latitude, function(err) { 
        process.stdout.write("true\n");
        db.close();
        process.exit(0);
     }, function(err) { 
        process.stdout.write("false\n");
        db.close();
        process.exit(1);
     });
});

