var express = require('express');
var os = require('os');
var app = express();

app.use(express.logger('dev'));

app.use(express.static(__dirname + '/../webapp/static'));

app.use(app.router);



app.get('/hello.txt', function(req, res){
  res.send('Hello World');
});

app.get('/', function(req, res) {
  res.send("<html><body><a href='/hello.txt'>/hello.txt</a></body></html>");
});

var listen_port = 3000;
app.listen(listen_port);
console.log('Listening on port ' + listen_port);
console.log('http://' + os.hostname() + ':' + listen_port + '/');
