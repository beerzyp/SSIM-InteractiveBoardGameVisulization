'use strict';

const express = require('express');
var path = require('path');
const logger = require('morgan');
var cookieParser = require('cookie-parser');
var reload = require('reload');

//var http = require('http');

const bodyParser = require('body-parser');


// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

app.set('port', PORT);

app.use(logger('dev'));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(function (req, res, next) {
	//must be included these first two
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
	next();
});


app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/build')));

//require('./routes')(app);




app.get('/', (req, res) => {
  res.send('SSIM Interactive Board Game Visualization!!!!!!!!!!!!!!!!\n');
});


/*
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
}); 
*/

/*
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '/build', 'server.js'));
});
*/


var publicDir = path.join(__dirname, 'public')

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, HOST);


console.log(`Running on http://${HOST}:${PORT}`);


// Setup a default catch-all route that sends back an error message in JSON format.
app.get('*', (req, res) => {
	throw new Error(); res.status(200).send({
		message: 'Error: Page not found!',
	});
});


app.listen(PORT, () =>
	console.log(' app listening on port ${port}!'));


//var server = http.createServer(app)
/*
// Reload code here
reload(app).then(function (reloadReturned) {
  // reloadReturned is documented in the returns API in the README
 
  // Reload started, start web server
  server.listen(app.get('port'), function () {
    console.log('Web server listening on port ' + app.get('port'))
  })
}).catch(function (err) {
  console.error('Reload could not start, could not start server/sample app', err)
})

*/

module.exports = app;