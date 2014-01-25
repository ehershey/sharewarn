#!/usr/bin/env node
// Download station list from citibikenyc.com and load into mongodb
//

var request = require('request');
var mongodb = require('mongodb');
var dbconfig = require('dbconfig');

var externalconfig = require('externalconfig');

var station_url = externalconfig.citibike.station_url;

var dburl = dbconfig.dburl;
var stations_collection = dbconfig.stations_collection;

var now = new Date();

var last_seen = now;

var wrote_station_count = 0;
var total_station_count = 0;

var MongoClient = mongodb.MongoClient
  , Server = mongodb.Server;


MongoClient.connect(dburl, function(err, db) 
{
  if(err) throw err;

  db.ensureIndex(stations_collection, {location: "2dsphere"} , {unique:false, background:false, w:1}, function(err, indexName) 
  {
    if(err) throw err;

    request(station_url, function (err, response, body) 
    {
      if(err) throw err;
      if (response.statusCode == 200) {
        var station_response = JSON.parse(body);
        console.log(station_response.executionTime);
        var stations = station_response.stationBeanList;

        for(var i = 0 ; i < stations.length ; i++) { 
          process.stdout.write('.');
          total_station_count++;
          var station = stations[i];
          save_station(db, station);
        }
      }
    });
  });
});

function save_station(db,station) 
{

  var collection = db.collection(stations_collection);

  station._id = station.id;

  collection.find({ _id: station.id}, function(err, cursor) 
  {
    if (err) throw err;

    //console.log("station.id: " + station.id);

    //console.log('calling find() on stations');

    var first_seen;
    var seen_count;

    cursor.toArray(function(err, result)
    {
      if (err) throw err;

      //console.log('result.length: ' + result.length);

      if(result.length === 0)
      {
        first_seen = now;
        seen_count = 1;
      }
      else if(result.length === 1)
      {
        // console.log("result[0].application_metadata: ");
        // console.log(result[0].application_metadata);
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

      // console.log('first_seen: ' + first_seen);
      // console.log('last_seen: ' + last_seen);
      // console.log('seen_count: ' + seen_count);

      station.application_metadata = { first_seen: first_seen, last_seen: last_seen, seen_count: seen_count };

      // convert from this:
      //   "latitude" : 40.74177603,
      //   "longitude" : -74.00149746,
      // to this:
      //   location : { type : "Point" ,
      //           coordinates : [ 40, 5 ]
      //         },
      station.location = { type: "Point", coordinates: [ station.latitude, station.longitude ] }
      station.latitude = null;
      station.longitude = null;


      // console.log('attempting to save station: ' + station);

      collection.update({_id: station.id}, station, {upsert:true, w: 1}, function(err, result) 
      {
        if (err) throw err;
        // collection.insert(station, {upsert:true, w: 1}, function(err, result) {

        // console.log("saved station");
        process.stdout.write('+');
        wrote_station_count++;
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
    else if(wrote_station_count === total_station_count)
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
