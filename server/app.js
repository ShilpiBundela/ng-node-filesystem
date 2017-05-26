/**********************************************************
 * filename : app.js [controller]
 *						main controller for the application
 * version : 1.0.0
 * dependencies :
 * 		- expressjs
 *		- body-parser
 *		- cors
 *		- ./app.service - filesystem service based on nodejs
 *											fs api
 *		- ./file-rename.service.js - renames the files with the
 *											updated name
 *    - ./file-delete.service.js - deletes the files at the
 *                      given location
 *
 *********************************************************/
/*
 *	This controller handles the following routers :
 *		- GET ( '/*', ...)
 *				gets the path after '/' and forwards it to the SERVICE
 *				to get the details for the acquired path.
 *				if the user misses a PATH or enter an incoreect path the
 * 				DEFAULT_LOCATION is used as the path which is './' which
 * 				would be the configured root directory for the server
 *
 * 	- POST ( '/*', ...)
 *				gets the old path of the resource that needs a file /
 * 				fodler rename and also the new name as the data from
 * 				the client and sends it to the file-rename.service.js
 *
 * FIXME :
 *	- Fix cors just for localhost:3000 domain. Currently accepts all
 *		origin
 *
 * TODO :
 */
'use-strict'

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileSystemService = require('./app.service');
const fileRenameService = require('./file-rename.service');
const fileDeleteService = require('./file-delete.service');
const app = express();

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
let DEFAULT_LOCATION = './';
let BASE_PATH = './';

/**
 * Check if the command line arguments are present for node, if not
 * revert the base bath to the root path of the server './'
 */
if (process.argv[2] === '-c' || process.argv[2] === '--configure') {
  console.log('--------------- SATRTING SERVER IN CONFIGURE MODE ---------------');
  BASE_PATH = process.argv[3];
  /**
   * check if the user did not include the directory '/' at the end of the
   * argument : if not append one
   */
  if (BASE_PATH[BASE_PATH.length - 1] !== '/') {
    BASE_PATH += '/';
  }
  console.log('------> setting the BASE PATH TO : ', BASE_PATH);
} else {
  console.log('BASE PATH configuration not found : setting the BASE PATH TO : ./ ');
}

/**
 * GET -
 *	get the file system details for the set BASE_PATH / DEFAULT_LOCATION
 */
app.get('/*', function(req, res) {
  let serverConfiguredPath = BASE_PATH + req.params[0] || DEFAULT_LOCATION;
  console.log('SERVING FILES FROM PATH : ', serverConfiguredPath);
  fileSystemService(serverConfiguredPath).then((responseArray) => {
    if (responseArray.length !== 0) {
      res.status(200).json(responseArray);
    } else {
      response.status(404);
    }
    res.end();
  }).fail((err) => {
    console.log('internal server error', err);
    res.write('INTERNAL SERVER ERROR');
    res.status(500);
    res.end();
  });
});

/**
 * POST -
 *	renames the file on the current location to the new name
 */
app.post('/*', function(req, res) {
  let serverConfiguredPath = BASE_PATH + req.params[0] || DEFAULT_LOCATION;
  console.log('SERVING FILES FROM PATH : ', serverConfiguredPath);
  fileRenameService(req.body.PATH_TO_UPDATE,
    req.body.renamedFile,
    req.body.editedName,
    BASE_PATH).then((response) => {
    if (response === 200) {
      res.status(200);
    } else {
      res.status(response);
    }
    res.end();
  }).fail((err) => {
    console.log('internal server error', err);
    res.write('INTERNAL SERVER ERROR');
    res.status(500);
    res.end();
  });
});

/**
 * DELETE -
 *	deletes the file for the set BASE_PATH / DEFAULT_LOCATION
 */
app.delete('/*', function(req, res) {
  let serverConfiguredPath = BASE_PATH + req.params[0] || DEFAULT_LOCATION;
  console.log('SERVING FILES FROM PATH : ', serverConfiguredPath);
  fileDeleteService(serverConfiguredPath).then((response) => {
    if (response === 200) {
      res.status(200);
    } else {
      res.status(response);
    }
    res.end();
  }).fail((err) => {
    console.log('internal server error', err);
    res.write('INTERNAL SERVER ERROR');
    res.status(500);
    res.end();
  });
});

app.listen(9000, function() {
  console.log('Ahoy mate the app is running on PORT:9000!');
});
