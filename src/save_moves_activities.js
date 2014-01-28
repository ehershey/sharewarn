#!/usr/bin/env node
'use strict';
// Save moves activities for all users to the db
//
// Modifications made to objects received from Moves:
// 1) Whether start and end points for an activity
// are at bike share stations (is_start_at_station and 
// is_end_at_station)
//
// 2) Metadata about the first and last time the same 
// activity entity has been seen by the system
//
// 3) Date objects for activity objects and track
// points
//
// 4) The field user_id: user._id for the user owning 
// the activity

var async = require('async');
var mongodb = require('mongodb');
var request = require('request');
var sharewarn = require('sharewarn');
var dbconfig = require('dbconfig');


var dburl = dbconfig.dburl;
var activities_collection = dbconfig.activities_collection;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

var now = new Date();
// var now = new Date("1/27/2014 12:00:00");
// var now = new Date("1/24/2014 12:00:00");

var last_seen = now;

var wrote_activity_count = 0;
var total_activity_count = 0;

// connect to db 
//

MongoClient.connect(dburl, function(err, db) 
{
  if (err) throw err;

  sharewarn.for_each_user(db, function(err,user) 
  {
    if (err) throw err;
    if(!user) return;

    var moves_access_token = user.moves_access_token;

    var request_year = now.getFullYear();
    var request_month = now.getMonth() + 1;
    if(request_month < 10) request_month = "0" + request_month;
    var request_date = now.getDate();
    if(request_date < 10) request_date = "0" + request_date;
  
    var request_date = request_year + request_month + request_date;
    var request_url = 'https://api.moves-app.com/api/v1/user/storyline/daily/' + request_date + '?trackPoints=true&access_token=' + moves_access_token;
    console.log('request_url: ' + request_url);
 

    request(request_url, function (err, response, body) 
    {
      if(err) throw err;
      if(response.statusCode != 200) { throw "Invalid response code: " + response.statusCode  + ", body: " + body; }
      var storyline = JSON.parse(body)[0];

      var segments = storyline.segments;
      console.log('segments.length: ' + segments.length);

      if(!segments) { segments = [] }

      for(var j = 0 ; j < segments.length ; j++) 
      {
        var segment = segments[j];
       
        var activities = segment.activities;

        if(!activities) { activities = [] }
        
        for(var k = 0 ; k < activities.length ; k++) 
        {
          total_activity_count++;
          var activity = activities[k];
          activity.user_id = user._id;
          activity.startTime = sharewarn.date_from_moves_date(activity.startTime);
          activity.endTime = sharewarn.date_from_moves_date(activity.endTime);
          for(var l = 0 ; l < activity.trackPoints.length ; l++)
          {
            activity.trackPoints[l].time = sharewarn.date_from_moves_date(activity.trackPoints[l].time);
          }

          add_station_info(db, activity, function(err, activity) {
            if(err) throw err;
            save_activity(db, user, activity);
          });
        } // for each activity
      } // for each segment
  }); // request
}); // for_each_user callback
}); // db connect callback


function save_activity(db, user, activity) 
{

  var collection = db.collection(activities_collection);

  collection.find({ user_id: user._id, startTime: activity.startTime}, function(err, cursor) 
  {
    if (err) throw err;

    console.log("activity.startTime: " + activity.startTime);

    console.log('calling find() on activities');

    var first_seen;
    var seen_count;

    cursor.toArray(function(err, result)
    {
      if (err) throw err;

      console.log('result.length: ' + result.length);

      if(result.length === 0)
      {
        first_seen = now;
        seen_count = 1;
      }
      else if(result.length === 1)
      {
        console.log("result[0].application_metadata: ");
        console.log(result[0].application_metadata);
        first_seen = result[0].application_metadata.first_seen;
        seen_count = result[0].application_metadata.seen_count + 1;
      }
      else
      {
        throw("too many results!");
        console.log("result[0].application_metadata: ");
        console.log(result[0].application_metadata);
        first_seen = result[0].application_metadata.first_seen;
        seen_count = result[0].application_metadata.seen_count + 1;
      } 

      activity.application_metadata = { first_seen: first_seen, last_seen: last_seen, seen_count: seen_count };
      console.log('attempting to save activity: ' + activity);

      collection.update({startTime: activity.startTime}, activity, {upsert:true, w: 1}, function(err, result) 
      {
        if (err) throw err;
        // collection.insert(activity, {upsert:true, w: 1}, function(err, result) {

        console.log("saved activity");
        wrote_activity_count++;
        cleanup_db_connection(db);
      });
    });
  });
}


var called_db_close = false;

function cleanup_db_connection(db) {
  setTimeout(function() { 
    // console.log('wrote_station_count: ' + wrote_station_count);
    // console.log('total_station_count: ' + total_station_count);
    if(called_db_close) {
      // nothing
    }
    else if(wrote_activity_count === total_activity_count)
    {
      process.stdout.write("\n");
      console.log('calling db.close()');
      called_db_close = true;
      db.close();
    }
    else {
      // try again 
      //
      cleanup_db_connection(db);
    }
  }, 1000);
}

// Take an activity object and if it contains
// track points, add is_start_at_station: <bool>
// and is_end_at_station: <bool>
//
function add_station_info(db, activity, callback) { 

  if(activity.is_start_at_station != undefined && activity.is_end_at_station != undefined) { 
    callback(null,activity);
    return;
  }

  var trackPoints = activity.trackPoints;

  if(!trackPoints || !trackPoints.length) { callback(null,activity); }
  console.log('trackPoints.length: ' + trackPoints.length);
  console.log('activity.activity: ' + activity.activity);

  var start_lat = trackPoints[0].lat;
  var start_lon = trackPoints[0].lon;

  var end_lat = trackPoints[trackPoints.length - 1].lat;
  var end_lon = trackPoints[trackPoints.length - 1].lon;
  console.log('start_lat: ' + start_lat);
  console.log('start_lon: ' + start_lon);
  console.log('end_lat: ' + end_lat);
  console.log('end_lon: ' + end_lon);

  async.parallel([
      function(callback) {
        sharewarn.is_point_at_station(db, start_lon, start_lat, 
          function(err) {
            if(err) throw err;
            activity.is_start_at_station = true;
            console.log('activity.is_start_at_station: ' + activity.is_start_at_station);
            callback(null);
          },
          function(err) { 
            if(err) throw err;
            activity.is_start_at_station = false;
            console.log('activity.is_start_at_station: ' + activity.is_start_at_station);
            callback(null);
          })
      },
      function(callback) {
        sharewarn.is_point_at_station(db, end_lon, end_lat, 
          function(err) { 
            if(err) throw err;
            activity.is_end_at_station = true;
            callback(null);
          },
          function(err) { 
            if(err) throw err;
            activity.is_end_at_station = false;
            callback(null);
          })
      }],
      function(err, results) {
        if(err) throw err;
        callback(null,activity);
      });
}
