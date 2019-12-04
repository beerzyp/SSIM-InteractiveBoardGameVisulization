'use strict';

const express = require('express');
var path = require('path');
const logger = require('morgan');
var reload = require('reload')

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();

var publicDir = path.join(__dirname, 'public')

/*
app.get('/', (req, res) => {
  res.send('SSIM Interactive Board Game Visualization!!!!!!!!!!!!!!!!\n');
});
*/

/*
app.get('*', (req, res) => {
	res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
*/


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.js'));
});

app.set('port', PORT);

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, HOST);

app.use(logger('dev'));

console.log(`Running on http://${HOST}:${PORT}`);


// Setup a default catch-all route that sends back an error message in JSON format.
app.get('*', (req, res) => {
	throw new Error(); res.status(200).send({
		message: 'Error: Page not found!',
	});
});


app.listen(PORT, () =>
	console.log(' app listening on port ${port}!'));


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


module.exports = app;