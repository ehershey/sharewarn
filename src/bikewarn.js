var dbconfig = require('dbconfig');
var stations_collection = dbconfig.stations_collection;
module.exports = {
  is_point_at_station: is_point_at_station
}
function is_point_at_station(db, longitude, latitude, yes_callback, no_callback) { 

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