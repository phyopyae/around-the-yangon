'use strict';

angular.module('myApp.map', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/map', {
      templateUrl: 'map/map.html',
      controller: 'MapCtrl'
    });
  }])

  .controller('MapCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.mymap = L.map('mapid').setView([16.888832606891466, 96.1299168993719], 13);
    $scope.layer
    $scope.busMap = {};
    $scope.busList = [];

    $scope.getInit = function () {
      $http.get("data/route_config.json")
      .then(function (response) {
        if (response) {
          var data = response.data[0];
          $scope.busMap = data;
          angular.forEach(data, function (value, key) {
            var busObj = {
              busNo: key,
              fileName: value
            };
            $scope.busList.push(busObj);
          });

        }
        var sidebar = L.control.sidebar({
          autopan: false,       // whether to maintain the centered map point when opening the sidebar
          closeButton: true,    // whether t add a close button to the panes
          container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
          position: 'left',     // left or right
        }).addTo($scope.mymap);
      }, function (error) {
      });
    };

    $scope.getBusRoute = function(busObj) {
      var selectedBus = busObj.busNo;
      var selectedBusFile = busObj.fileName;
      var filePath = "data/routes/" + selectedBusFile;
      $http.get(filePath)
      .then(function (response) {
        // $scope.mymap.removeLayer($scope.polyline);
        if ($scope.polyline) {
          $scope.polyline.remove();
        }
        
        if (response) {
          var routeLatLngList = [];
          var routeCoordinatesList = response.data.shape.geometry.coordinates;
          routeCoordinatesList.forEach(function (element) {

            var latlng = [];
            latlng.push(element[1]);
            latlng.push(element[0]);
            routeLatLngList.push(latlng);
          });
          // create a red polyline from an array of LatLng points
          var latlngs = [];
          latlngs.push(routeLatLngList);
          $scope.polyline = L.polyline(latlngs, { color: 'red' }).addTo($scope.mymap);
          // zoom the map to the polyline
          $scope.mymap.fitBounds($scope.polyline.getBounds());
        }

      }, function (error) {

      });
    };

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo($scope.mymap);
  }]);