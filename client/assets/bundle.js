/******************************************************************************
 * filename : bundle.js [angular.module | angular.controller]
 *						- main controller to set the scope variables for the client app
 * version : 1.0.0
 * dependencies :
 * exports :
 ******************************************************************************/
 /*
  * FIXME :
	*
	* TODO :
	* 	- break down the controller into services
	*/
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
  $scope.PERSISTANT_URL = [];
  $scope.open = false;

  callServer("");

  /**
   * @function reducePersistentURL
   *  keeps track of the url being requested and the levels of fs being
   *  traversed
   */
  function reducePersistentURL() {
    var reducedURL = $scope.PERSISTANT_URL.reduce(function(acc, curr) {
      return acc + curr;
    }, "");

    return reducedURL;
  }

  /**
   * @function callServer
   *  makes a get request to get the details of files and the folder strictures
   * @param directoryName
   *  sets the name of the directory for which the information is requested
   *
   * TODO:
   *  - make the request more generic for all get requests
   *  - move to a service
   */
  function callServer(directoryName) {

    switch (directoryName) {
      case "":
        break;

      case "..":
        $scope.PERSISTANT_URL.splice($scope.PERSISTANT_URL.length - 1, 1);
        break;

      default:
        directoryName = '/' + directoryName;
        $scope.PERSISTANT_URL.push(directoryName);
        break;
    }

    var DIRECTORY_URL = reducePersistentURL();

    var URL = "http://localhost:9000" + DIRECTORY_URL + "/";
    $http.get(URL)
      .then(function(response) {
        if(response.status === 404 || response.status === 500) {
          alert('resource not found or is not accessible!');
        }
        $scope.fileData = response.data;
        $scope.editing = false;
      });
  };

  /**
   * @function orderByMe
   *  orders the columns of the table by name or by size
   */
  $scope.orderByMe = function(x) {
    $scope.myOrderBy = x;
  };

  /**
   * @function statusIconMapping
   *  sets the image of the item
   *    - folder image if it is a directory
   *    - file image if it is a file
   */
  $scope.statusIconMapping = {
    "true": "./assets/images/folde.png",
    "false": "./assets/images/fileicon.png",
  };

  /**
   * @function Delete
   *  deletes the file in memory [scope of angular session]
   * TODO:
   *  make the call to the server with $http.delete
   *  update the delete service on server
   */
  $scope.Delete = function(index, resourceName) {
    $scope.fileData.splice(index, 1);
    var DIRECTORY_URL = reducePersistentURL();
    $http.delete(
      'http://localhost:9000/' + DIRECTORY_URL + '/' + resourceName
    ).then(function(response) {
      if (response.status === 200) {
        alert('SYNC WITH SERVER COMPLETE :  DELETE FILE');
      } else {
        alert('ERROR DELETING FILE');
        console.log('ERROR IN SYNCING WITH SERVER');
      }
    });
  };

  /**
   * @function editAppKey
   *  makes the table field editable
   *  if the editable field is current directory '.' or parent directory '..'
   *  edit option wont be availbale if not the edit option will be available
   */
  $scope.editAppKey = function(field) {
    if(field === "." || field === "..") {
      alert('This Field cannot be renamed');
      $scope.editMode = false;
    } else {
      $scope.editedField = field;
      $scope.editing = $scope.fileData.indexOf(field);
      $scope.newField = angular.copy(field);
    }
  };

  /**
   * @function saveName
   *  makes a $http.post to the server with
   *  oldPath, oldFileName, newFileName as the data and updates the
   *  file or folder name at the given / set path on the server
   */
  $scope.saveName = function(editedName) {
    var DIRECTORY_URL = reducePersistentURL();
    var postData = {
      "PATH_TO_UPDATE": DIRECTORY_URL,
      "renamedFile": '/' + $scope.editedField,
      "editedName": '/' + editedName
    }

    $http.post(
      'http://localhost:9000/',
      postData
    ).then(function(response) {
      if (response.status === 200) {
        alert('SYNC WITH SERVER COMPLETE :  RENAME FILE');
      } else {
        alert('ERROR RENAMING FILE');
        console.log('ERROR IN SYNCING WITH SERVER');
      }
    });
  }

  /**
   * @function openDirectory
   *  opens a selected directoryName on the path
   */
  $scope.openDirectory = function(directoryName) {
    callServer(directoryName);
  }
});
