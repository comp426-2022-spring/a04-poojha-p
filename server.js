//import {coinFlip, coinFlips, countFlips, flipACoin} from "./modules/coin.mjs"
//import { createRequire } from 'module';

const express = require('express')
const app = express()

const morgan = require('morgan')
const eh = require('errorhandler')
const fs = require('fs')
const db = require('./database')

/**const logging = (req, res, next) => {
  console.log(req.body.number)
  next()
}**/

const args = require('minimist')(process.argv.slice(2))

args['port']

const port = args['port']|| 5000

const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

if (args.log == false) {
  console.log("Not creating access.log file.")
} else {
  // create a write stream (in append mode)
  // basically writing all logs to file access.log
  const accessLogStream = fs.createWriteStream('access.log', {flags: 'a'})
  // setup the logger, access logging middleware
  app.use(morgan('combined', {stream: accessLogStream}))
}

app.get("/app/", (req, res, next) => {
  res.json({"message":"Your API works! (200)"})
  res.status(200)
  next()
});

app.use((req, res, next) => {
  let logdata = {
    remoteaddr: req.ip,
    remoteuser: req.user,
    time: Date.now(),
    method: req.method,
    url: req.url,
    protocol: req.protocol,
    httpversion: req.httpVersion,
    status: res.statusCode,
    referer: req.headers['referer'],
    useragent: req.headers['user-agent']
  }

  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?,?,?,?,?,?,?,?,?,?)')
  const run = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next()
})

const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)

// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
  console.log(help)
  process.exit(0)
}

if (args.debug == true || args.d == true) {
  app.get('/app/log/access', (req, res, next) => {
    const stmt = db.prepare('SELECT * FROM accesslog').all()
    res.status(200).json(stmt)
  })

  app.get('/app/error', (req, res, next) => {
    throw new Error('Successful: Error')
  })
}

//a03
function coinFlip() {
  return (Math.random() > 0.5 ? 'heads' : 'tails');
}

function coinFlips(flips) {
  let arr_coins = [];

  if (!flips) {
    arr_coins.push(coinFlip());
  } else {
    for (var i = 0; i < flips; i++) {
      Math.random() > 0.5 ? arr_coins.push("heads") : arr_coins.push("tails");
    }
  }

  return arr_coins;
}

function countFlips(array) {
  var heads = 0;
  var tails = 0;
  for (let i = 0; i < array.length; i++) {
    if (array[i] == "heads") {
      heads++;
    } else {
      tails++;
    }
  }

  if (heads > 0 && tails == 0) {
    return { "heads": heads}
  } else if (tails > 0 && heads == 0) {
    return { "tails": tails}
  } else {
    return { "heads": heads, "tails": tails }
  }
}

function flipACoin(call) {
  var verdict = 'win';
  var flip = coinFlip();

  if (!(call == flip)) {
    verdict = 'lose';
  }

  return { 'call': call, 'flip': flip, 'result': verdict };
}

app.get('/app/', (req, res) => {
    res.statusCode = 200;
    res.statusMessage = 'OK';
    res.writeHead(res.statusCode, {'Content-Type' : 'text/plain'});
    res.end(res.statusCode+ ' ' +res.statusMessage)
});

app.get('/app/flip/', (req, res) => {
    res.status(200);
    const ans = coinFlip();
    const flipResult = {"flip" : ans};
    res.json(flipResult);
});

app.get('/app/flips/:number/', (req, res) => {
    res.status(200);
    const flips = req.params.number || 1;
    const values = coinFlips(flips);
    const rawjson = {
        "raw" : values,
        "summary": countFlips(values)
    };
    res.json(rawjson)
});

app.get('/app/flip/call/heads/', (req, res) => {
    res.status(200);
    res.json(flipACoin('heads'));
});

app.get('/app/flip/call/tails/', (req, res) => {
    res.status(200);
    res.json(flipACoin('tails'));
});

app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});