var express = require('express');
var os = require('os');
var fs = require('fs');
var plates = require('plates');
var app = express();

app.use(express.logger('dev'));

app.use(express.static(__dirname + '/../webapp/static'));

app.use(app.router);



app.get('/activity_raw', function(req, res){
  var template_path=(require('path').dirname(require.main.filename) + '/../webapp/templates/activity_raw.html');
  var activity_data = [ 
    {startTime: new Date(), endTime: new Date(), activity: 'activity name' },
    {startTime: new Date(), endTime: new Date(), activity: 'activity name 2' },
    {startTime: new Date(), endTime: new Date(), activity: 'activity name 3' }
  ];
  fs.readFile(template_path, function(err, data) {
    if(err) throw err;
    res.send(plates.bind(data.toString(),activity_data));
  });
});

app.get('/', function(req, res) {
  res.send("<html><body><a href='/activity_raw'>/activity_raw</a></body></html>");
});

var listen_port = 3000;
app.listen(listen_port);
console.log('Listening on port ' + listen_port);
console.log('http://' + os.hostname() + ':' + listen_port + '/');
