var dbconfig = require('dbconfig');
var stations_collection = dbconfig.stations_collection;
var users_collection = dbconfig.users_collection;

module.exports = {
  is_point_at_station: is_point_at_station,
  get_user: get_user,
  for_each_user: for_each_user
}

function is_point_at_station(db, longitude, latitude, yes_callback, no_callback) 
{ 

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
        yes_callback();
      }
        else
      {
        no_callback();
      }
    });
  });
}


function get_user(db, username, callback) { 

  var collection = db.collection(users_collection);
  var query = { username: username }
  collection.find(query , function(err, cursor) 
  {
    if (err) throw err;

    cursor.toArray(function(err, result)
    {
      if (err) throw err;
      if(result.length > 0)
      {
        callback(null,result[0]);
      }
        else
      {
        callback("Can't find user");
      }
    });
  });
}

function for_each_user(db, callback) {
  var collection = db.collection(users_collection);
  collection.find({}, function(err, cursor)
      {
        if(err) throw err;
        cursor.each(callback);
      });
}
