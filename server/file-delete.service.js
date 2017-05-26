/**********************************************************
 * filename : file-delete.service.js [service]
 *						service to delete the file at the given path
 * version : 1.0.0
 * dependencies :
 * 		- fs
 *      - fs.rename [async]
 *    - q [promises]
 * exports :
 *    - deleteFile
 *********************************************************/
/*
 *  the service works with the fs.unlink api from nodejs
 *  which takes in the oldPath, newPath and a callback
 *    fs.unlink(path, callback) {...}
 *
 * FIXME :
 *
 * TODO :
 *  - check for access before renaming the file
 *  - delete works for files and not for directories, need to unlink
 *    files from a non-empty directory before running rmdir
 */
const fs = require('fs');
const q = require('q');

/**
 * @function checkIfFileOrDirectory
 *  checks if the given resouce url has a file or a directory, required to
 *  run either fs.unlink or fs.rmdir
 * @param path - location of the resource
 *
 * @return boolean [promise] - if the resource URL is a directory or non-empty
 *
 * TODO: move ths function to a generic service as app.service.js uses something
 *       similar
 */
let checkIfFileOrDirectory = function(path) {
  let deffered = q.defer();

  fs.stat(path, (err, stats) => {
    if (err) {
      console.log('error reading path');
      deffered.resolve(false);
    } else {
      deffered.resolve(stats.isDirectory());
    }
  });

  return deffered.promise;
}

/**
 * @function deleteFile
 *  deltes the resource at the given url
 * @param path - location of the url
 *
 * @return error status [promise]
 *
 * FIXME : currently only works for files / need a recursive unlink of files
 * for non-empty directories
 */
let deleteFile = function(path) {
  let deffered = q.defer();

  checkIfFileOrDirectory(path).then((isDirectory) => {
    if (isDirectory) {
      fs.rmdir(path, (err, success) => {
        if (err) {
          console.log('an error occured', err);
          deffered.resolve(500);
        } else {
          console.log('DELETE SUCCESSFUL!');
          deffered.resolve(200);
        }
      });
    } else {
      fs.unlink(path, (err, success) => {
        if (err) {
          console.log('an error occured', err);
          deffered.resolve(500);
        } else {
          console.log('DELETE SUCCESSFUL!');
          deffered.resolve(200);
        }
      });
    }
  });

  return deffered.promise;
};

module.exports = deleteFile;
