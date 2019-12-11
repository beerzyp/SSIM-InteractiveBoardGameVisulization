var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST game search. */
router.post('/gameSearch', function (req, res) {
  /*
  PythonShell.run('clustering.py', options, function (err, results) { 
    console.log(err);
    console.log(results);
  });
  */
  console.log("entrou!");
  res.send('POST request to the homepage')
});

module.exports = router;
