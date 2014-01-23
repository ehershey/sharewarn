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
var sharewarn = require('sharewarn');

var dburl = dbconfig.dburl;
var stations_collection = dbconfig.stations_collection;
var users_collection = dbconfig.users_collection;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

var now = new Date();

MongoClient.connect(dburl, function(err, db) 
{
  if(err) throw err;

  sharewarn.get_user(db, "ernie",function(err, user) { 
    if(err) throw err;
    console.log('username: ' + user.username);
    process.exit();
  });

  request('https://api.moves-app.com/api/v1/user/storyline/daily/' + entry.date + '?trackPoints=true&access_token=' + moves_access_token, 
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var storyline = JSON.parse(body)[0];

            var segments = storyline.segments;
            console.log('segments.length: ' + segments.length);

            if(!segments) { segments = [] }

              for(var j = 0 ; j < segments.length ; j++) 
              {
                total_segment_count++;
                var segment = segments[j];
                save_segment(db, segment);
        
                var activities = segment.activities;

                if(!activities) { activities = [] }
        
                for(var k = 0 ; k < activities.length ; k++) 
                {
                  total_activity_count++;
                  var activity = activities[k];
                  save_activity(db, activity);
                }
               }
          }
        });
 


  // sharewarn.is_point_at_station(db, longitude, latitude, function(err) { 
        // process.stdout.write("true\n");
        // db.close();
        // process.exit(0);
     // }, function(err) { 
        // process.stdout.write("false\n");
        // db.close();
        // process.exit(1);
     // });
});

