var app = require('../app.js');
var http = require('http');
app.set('port', process.env.PORT);
var server = http.createServer(app);
server.listen(process.env.PORT);
console.log('im listening');
