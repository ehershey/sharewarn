#!/usr/bin/env node
var sharewarn = require('../src/sharewarn');
var assert = require('assert');

assert.equal(sharewarn.date_from_moves_date("20140124T232033Z").getTime(), (new Date("2014-01-24T23:20:33Z")).getTime(), "20140124T232033Z converts to date")
