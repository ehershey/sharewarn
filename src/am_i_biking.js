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
var stations_collection = dbconfig.stations_collection;
var users_collection = dbconfig.users_collection;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;

var now = new Date("1/24/2014 12:00:00");
// var now = new Date();

var username = 'ernie';

MongoClient.connect(dburl, function(err, db) 
{
  
  sharewarn.get_user(db, username,function(err, user) { 
    if(err) throw err;
    console.log('username: ' + user.username);
    console.log('preferences.hard_limit_minutes: ' + user.preferences.hard_limit_minutes);
    var user_id = user._id;
    var hard_limit_minutes = user.preferences.hard_limit_minutes;

    // activities must start or stop after this point in time for us to care
    //
    var past_limit = new Date(now.getTime() - hard_limit_minutes * 60 * 1000)

    // get ride starts:
    var query = { user_id: mongodb.ObjectID(new String(user_id)), "$or": [ { startTime: { "$gte": past_limit} }, { endTime: { "$gte": past_limit } } ] };
    console.log('query: ' + JSON.stringify(query,null,2));
    process.exit();
  
  });
}); 
