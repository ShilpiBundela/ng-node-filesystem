/**********************************************************
 * filename : file-rename.service.js [service]
 *						service to rename the file at the given path
 * version : 1.0.0
 * dependencies :
 * 		- fs
 *      - fs.rename [async]
 *    - q [promises]
 * exports :
 *    - renameFile
 *********************************************************/
/*
 *  the service works with the fs.rename api from nodejs
 *  which takes in the oldPath, newPath and a callback
 *    fs.rename(oldPath, newPath, callback) {...}
 *
 * FIXME :
 *
 * TODO :
 *  - check for access before renaming the file
 */
const fs = require('fs');
const q = require('q');

let renameFile = function(oldPath, oldFileName, newFileName, BASE_PATH) {
  let deffered = q.defer();

  fs.rename(BASE_PATH + oldPath + oldFileName,
    BASE_PATH + oldPath + newFileName,
    (err, success) => {
      if (err) {
        console.log('an error occured', err);
        deffered.resolve(500);
      } else {
        console.log('RENAME SUCCESSFUL!');
        deffered.resolve(200);
      }
    });

  return deffered.promise;
};

module.exports = renameFile;
