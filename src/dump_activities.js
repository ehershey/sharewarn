#!/usr/bin/env node
// dump_moves_activities.js
//
//
// Dump Moves activities in CSV format
//
// Usage: 
// mongo moves dump_moves_activities.js

var dbconfig = require('dbconfig');
var mongodb = require('mongodb');

var dburl = dbconfig.dburl;
var activities_collection = dbconfig.activities_collection;


var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

MongoClient.connect(dburl, function(err, db) 
{
  if(err) throw err;

  process.stdout.write("Activity Type, Start Time, Start Longitude, Start Latitude, End Time, End Longitude, End Latitude, Start at station, End at station\n");

  var collection = db.collection(activities_collection);
  collection.find({}, {}, {sort: 'startTime' }, function(err, cursor) 
  {
   if (err) throw err;

    cursor.each(function(err, activity) {
      if(!activity) process.exit();

    var start_time = activity.startTime;
    var end_time = activity.endTime;
    var start_at_station = activity.is_start_at_station;
    var end_at_station = activity.is_end_at_station;
  
    var start_trackpoint = activity.trackPoints[0];
    if(start_trackpoint) { 
      var end_trackpoint = activity.trackPoints[activity.trackPoints.length - 1];
      var end_longitude = end_trackpoint.lon;
      var end_latitude = end_trackpoint.lat;
      var start_longitude = start_trackpoint.lon;
      var start_latitude = start_trackpoint.lat;
    }
    else
    {
      var end_longitude = "";
      var end_latitude = "";
      var start_longitude = "";
      var start_latitude = "";
    }

    // clear precision to 4 decimal places
    //
    start_longitude = Math.floor(start_longitude * 10000) / 10000;
    start_latitude = Math.floor(start_latitude * 10000) / 10000;
    end_longitude = Math.floor(end_longitude * 10000) / 10000;
    end_latitude = Math.floor(end_latitude * 10000) / 10000;

    process.stdout.write(activity.activity + ", " + 
                         start_time.toString() + ", " + 
                         start_longitude + ", " + 
                         start_latitude + ", " + 
                         end_time.toString() + ", " + 
                         end_longitude + ", " + 
                         end_latitude + ", " +
                         start_at_station + ", " +
                         end_at_station +
                         "\n");
    })
  });
});
