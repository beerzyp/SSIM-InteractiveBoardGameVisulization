var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
let {PythonShell} = require('python-shell')

function chunkSubstr(str, size) {
  const numChunks = Math.ceil(str.length / size)
  const chunks = new Array(numChunks)

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size)
  }

  return chunks
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST game search. */
router.post('/gameSearch', function (req, res) {
  const somePath = 'public/clustering.py';
  const correctedPath = path.normalize(path.resolve(somePath));
  const singleQuote = "'";  
  //chunks = chunkSubstr(req.body.games,30000);
  let pyshell = new PythonShell(correctedPath,{pythonPath : '/app/.heroku/python/lib/python3.6'});
  pyshell.send(JSON.stringify(req.body.games));
  let list = [];
  pyshell.on('message', function (message) {
    console.log(message);
    if(message==="finish") {
      const json = JSON.stringify(list);
      res.write(json);
    } else {
      list.push(message);
    }
  });

   // end the input stream and allow the process to exit
  pyshell.end(function (err) {
    if (err){
        throw err;
    };
    console.log('finished');
    res.end();
  });

});



module.exports = router;
