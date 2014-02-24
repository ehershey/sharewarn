#!/usr/bin/env node
var sharewarn = require('../lib/sharewarn');
var dbconfig = require('../lib/dbconfig');
var private = require('../lib/private');

var assert = require('assert');

assert.equal(sharewarn.date_from_moves_date("20140124T232033Z").getTime(), (new Date("2014-01-24T23:20:33Z")).getTime(), "20140124T232033Z converts to date")

assert(dbconfig.dbname, "dbconfig.dbname exists");
assert(dbconfig.dbserver, "dbconfig.dbserver exists");
assert(dbconfig.dbport, "dbconfig.dbport exists");
assert(dbconfig.dbuser !== undefined, "dbconfig.dbuser exists");
assert(dbconfig.dbpass !== undefined, "dbconfig.dbpass exists");
assert(dbconfig.dboptions !== undefined, "dbconfig.dboptions exists");
assert(dbconfig.stations_collection, "dbconfig.stations_collection exists");
assert(dbconfig.users_collection, "dbconfig.users_collection exists");
assert(dbconfig.activities_collection, "dbconfig.activities_collection exists");
assert(dbconfig.dburl, "dbconfig.dburl exists");

assert(private.config, "private.config exists");
assert(private.config.twilio, "private.config.twilio exists");
assert(private.config.twilio.auth_token !== undefined, "private.config.twilio.auth_token exists");
assert(private.config.twilio.account_sid !== undefined, "private.config.twilio.account_sid exists");

var exec = require('child_process').exec,
    child;

child = exec('bin/save_moves_activities.js',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    assert.ifError(error);
});

child = exec('bin/am_i_biking.js',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    assert.ifError(error);
});
