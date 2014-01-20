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

var dburl = dbconfig.dburl;
var stations_collection = dbconfig.stations_collection;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

var longitude = Number(process.argv[2]);
var latitude = Number(process.argv[3]);

MongoClient.connect(dburl, function(err, db) 
{
  if(err) throw err;

  var collection = db.collection(stations_collection);
  var query = { location: { "$near": { "$geometry": { type: "Point", coordinates: [ longitude, latitude ] } }, "$maxDistance": 50 } }
  collection.find(query , function(err, cursor) 
  {
    if (err) throw err;

    cursor.toArray(function(err, result)
    {
      if (err) throw err;
      if(result.length > 0)
      {
        process.stdout.write("true\n");
        process.exit(0);
      }
        else
      {
        process.stdout.write("false\n");
        process.exit(1);
      }
      db.close();
    });
  });
});
