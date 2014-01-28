#!/usr/bin/env node
// Try to tell whether a user is currently on a bike share ride. 
//
// A share ride start point is either the end of any type activity or 
// the start of a cycling activity that occurs at a bike share station.
//
// A share ride end point is the end of a cycling activity that occurs
// at a bike share station. 
//
// Share ride start and end points occuring after share ride start points 
// invalidate the status of a start point as starting a current ride. 
//
//

var dbconfig = require('dbconfig');
var request = require('request');
var mongodb = require('mongodb');
var sharewarn = require('sharewarn');

var dburl = dbconfig.dburl;
var activities_collection = dbconfig.activities_collection;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

var now = new Date("1/24/2014 12:00:00");
// var now = new Date();

var username = 'ernie';

MongoClient.connect(dburl, function(err, db) 
{
  
  sharewarn.get_user(db, username,function(err, user) 
  { 
    if(err) throw err;
    console.log('username: ' + user.username);
    console.log('preferences.hard_limit_minutes: ' + user.preferences.hard_limit_minutes);
    var user_id = user._id;
    var hard_limit_minutes = user.preferences.hard_limit_minutes;

    // activities must start or stop after this point in time for us to care
    //
    var past_limit = new Date(now.getTime() - hard_limit_minutes * 60 * 1000)

    // get ride starts:
    var query = { user_id: user_id, "$or": [ { startTime: { "$gte": past_limit} }, { endTime: { "$gte": past_limit } } ] };
    console.log('query: ' + JSON.stringify(query,null,2));

    var collection = db.collection(activities_collection);
    collection.find(query , function(err, cursor) 
    {
      if (err) throw err;

      cursor.toArray(function(err, result)
      {
        console.log('result.length: ' + result.length);
        var most_recent_ride_start_time;
        var most_recent_ride_end_time;

        // iterate over activities twice - once to gather ride share
        // starts and once to gather ends
        // 
        for(var i = 0 ; i < result.length ; i++)
        {
          var activity = result[i];
          if(activity.startTime >= now)
          {
            continue;
          }
          // one criteria to be the start of a ride is the start of a cycling activity at a station
          //
          if(activity.activity === 'cyc' && activity.is_start_at_station) 
          {
            // if this is either the only potential start (no most recent yet) or 
            // this is more recent than the most recent seen so far
            //
            if(!most_recent_ride_start_time || activity.startTime > most_recent_ride_start_time) 
            {
              most_recent_ride_start_time = activity.startTime;
            }
          }
          // second criteria to be the start of a ride is the end of an activity at a station
          //
          if(activity.is_end_at_station)
          {
            // if this is either the only potential start (no most recent yet) or 
            // this is more recent than the most recent seen so far
            //
            if(!most_recent_ride_start_time || activity.startTime > most_recent_ride_start_time) 
            {
              most_recent_ride_start_time = activity.startTime;
            }
          }
          
          //console.log('activity.activity: ' + activity.activity);
          // console.log('activity.startTime: ' + activity.startTime);
          // console.log('activity.endTime: ' + activity.endTime);
          // console.log('activity.is_start_at_station: ' + activity.is_start_at_station);
          // console.log('activity.is_end_at_station: ' + activity.is_end_at_station);
        }
        for(var i = 0 ; i < result.length ; i++)
        {
          var activity = result[i];
          if(activity.startTime >= now || activity.endTime >= now)
          {
            continue;
          }
          // criteria to be the end of a ride is the end of a cycling activity at a station
          //
          if(activity.activity === 'cyc' && activity.is_end_at_station) 
          {
            // if this is either the only potential end (no most recent yet) or 
            // this is more recent than the most recent seen so far
            //
            if(!most_recent_ride_end_time || activity.endTime > most_recent_ride_end_time) 
            {
              most_recent_ride_end_time = activity.endTime;
            }
          }
        }
 

        console.log('most_recent_ride_end_time: ' + most_recent_ride_end_time);
        console.log('most_recent_ride_start_time: ' + most_recent_ride_start_time);
        process.exit();
      });
    });

 
  
  });
}); 
