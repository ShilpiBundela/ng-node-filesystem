/******************************************************************************
 * filename : app.service.ts [SERVICE]
 *						- service to get the details of files and
 *							directories
 * version : 1.0.0
 * dependencies : node fs - filesystem api
 *										 q - to handle async fs jobs
 * exports : getFileSystem
 ******************************************************************************/
 /*
  * getFileSystem service is responsible to get the details of the
	* files / directoried referenced by the path that is forwarded by
	* the controller app.js and return back an array of responseObjects
	*
	* [ RESPONSE OBJECT ] =>
	*	{
	*		"name" : fs.name,
	*		"isFolder" : fs.stats.isDirectory(),
	* 	"modified" : fs.stats.mtime,
	* 	"size" : fs.stats.size
	*	}
	*
  * FIXME :
	* 	- Fix the promise ending in loops in getFileNames function with the
	*			for(fiel in files) {...}, currently it uses an end flag which resolves
	*			the promise
	*
	* TODO :
	* 	- find a better way to handle promises in loops
	* 	- break down the service into multiple modules to reduce total file size
	*/
'use-strict'

const fs = require('fs');
const q = require('q');

/**
 * @function checkFileAccess
 * checks if the user has access to the directory that was requested
 * if the use has access true is returned if not false is returned and
 * the exception is logged in the server
 * @param location
 * location as requested by the user
 * @return promise [boolean]
 */
let checkFileAccess = function(location) {
	let deffered = q.defer();
	fs.access(location, fs.constants.R_OK | fs.constants.W_OK, (err) => {
		if (err) {
			console.log('NO READ WRITE ACCESS TO THE DIRECTORY');
			deffered.resolve(false);
		} else {
			deffered.resolve(true);
		}
	});
	return deffered.promise;
}

/**
 * @function getDirectoryInformation
 *	sets the directory related response objects :
 *	for '.' and '..' and get their stats
 * @param location - location of the directory
 * @param isHomeDirectory - check if the given directory is the BASE_PATH
 * @param responseArray - global responseArray
 *
 * @return responseArray [promise]
 */
let getDirectoryInformation = function(location, isHomeDirectory, responseArray) {
	let deffered = q.defer();
	fs.stat(location, (errs, stats) => {
		if (stats.isDirectory()) {
			let responseObject = {};

			responseObject.name = ".";
			responseObject.isFolder = true;
			responseObject.modified = stats.mtime;
			responseObject.size = stats.size;
			responseArray.push(responseObject);

			if (!isHomeDirectory) {
				let responseDirectoryObject = {};
				responseDirectoryObject.name = "..";
				responseDirectoryObject.isFolder = true;
				responseDirectoryObject.modified = stats.mtime;
				responseDirectoryObject.size = stats.size;
				responseArray.push(responseDirectoryObject);
			}

			deffered.resolve(responseArray);
		}
	});

	return deffered.promise;
}

/**
 * @function getFileDetails
 * uses the fileDetails to get the information of the file / folder
 * on the given path
 * @param location - location of the file / folder
 * @param file - file for which the stats request is made
 * @param fileIndex - [HACK] this is used to end the promise by keeping track
 *										of last file in the folder
 * @param directorySize - [HACK] used by fileIndex to check if the file that is
 *										that is being requested is the last file in directory
 *
 * @return fileDetails - object [promise] :
 *			responseObject - stats of the file
 *			isLastFileOFDirectory - check if the file is the last in directory
 */
let getFileDetails = function(location, file, fileIndex, directorySize) {
	let deffered = q.defer(),
	fileDetails = {
		responseObject: {},
		isLastFileOFDirectory: false
	};

	if(directorySize - 1 === parseInt(fileIndex)) {
		fileDetails.isLastFileOFDirectory = true;
	}

	fs.stat(location + file, (err, stats) => {
		fileDetails.responseObject.name = file;
		fileDetails.responseObject.isFolder = stats.isDirectory();
		fileDetails.responseObject.modified = stats.mtime;
		fileDetails.responseObject.size = stats.size;
		deffered.resolve(fileDetails);
	});

	return deffered.promise;
}

/**
 * @function getFileNames
 * 	opens the directory at the given location and reads the list of files and
 *  requests for stats
 * @param location - location of the resource
 * @param responseArray - golabal response object array
 *
 * @return responseArray [promise]
 */
let getFileNames = function(location, responseArray) {
	let deffered = q.defer(),
		isLastFileOFDirectory = false;

	fs.readdir(location, 'utf8', (err, files) => {
		if (err) {
			console.log('There was an error reading the directory :', err);
		} else {
			for (file in files) {
				getFileDetails(location, files[file], file, files.length).then((fileDetails) => {
					responseArray.push(fileDetails.responseObject);
					if (fileDetails.isLastFileOFDirectory) {
						deffered.resolve(responseArray);
					}
				});
			}
		}
	});

	return deffered.promise;
}

/**
 * @function getFileSystem
 * 	gets the final responseArray for the controller containing the stats for
 * 	all the files and folders
 * @param location - location of the resource
 *
 * @return responseArray [promise]
 */
let getFileSystem = function(location) {
	let deffered = q.defer(),
		responseArray = [],
		isHomeDirectory = false;
	if (location === './') {
		isHomeDirectory = true;
	}
	checkFileAccess(location).then((isDirectoryAccesible) => {
		if (isDirectoryAccesible) {
			getDirectoryInformation(location, isHomeDirectory, responseArray).then((responseArray) => {
				getFileNames(location, responseArray).then((responseArray) => {
					// console.log(responseArray);
					deffered.resolve(responseArray);
				});
			});
		} else {
			deffered.resolve(responseArray);
		}
	});

	return deffered.promise;
};

module.exports = getFileSystem;
