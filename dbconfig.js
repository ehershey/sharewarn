var dbname = "bikewarn";
var dbserver = "localhost";
var dbport = 27017;
var dbuser = '';
var dbpass = '';
var dboptions = '';
var stations_collection = 'stations';


var dbuserpass = '';

if(dbuser && dbpass)
{
  dbuserpass = dbuser + ':' + dbpass + '@';
}

if(dboptions) { 
  dboptions = '?' + dboptions;
}

var dburl = 'mongodb://' + dbuserpass + dbserver + ':' + dbport + '/' + dbname + dboptions;


module.exports.dbname = dbname;
module.exports.dbserver = dbserver;
module.exports.dbport = dbport;
module.exports.dbuser = dbuser;
module.exports.dbpass = dbpass;
module.exports.dboptions = dboptions;
module.exports.stations_collection = stations_collection;
module.exports.dburl = dburl;
